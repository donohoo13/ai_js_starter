// Preinstall guard: hard-fail an install not run through pnpm, and any install
// running on the wrong Node major.
//
// pnpm-only: the repo's tooling (workspace protocol, devEngines runtime pin,
// lockfile) assumes pnpm; an accidental `npm install` / `yarn install`
// half-installs and corrupts the lockfile story. The package-manager check reads
// the installer's own user agent, so it needs no downloader and no dependencies.
//
// Node: the pin lives in three sites that this file checks against each other
// before it checks anything about the machine, because a partial retarget is
// otherwise indistinguishable from a broken environment:
//   .nvmrc                        the exact version, and what nvm reads
//   engines.node                  the range it implies, ">=<version> <<major+1>"
//   devEngines.runtime.version    the same exact version, and what pnpm downloads
// devEngines.runtime with onFail: "download" makes pnpm fetch that Node and run
// lifecycle scripts under it, so on a healthy setup this guard sees the pinned
// version and passes silently.
//
// devEngines.runtime.version MUST be an exact version, never a range. Given a
// range, pnpm stops using its runtime resolution entirely and installs the
// third-party `node` package from the npm registry instead: its bin creation
// fails (ENOENT), its setup script is blocked by the build-script allowlist, and
// lifecycle scripts silently run on the AMBIENT Node — the exact failure this
// pin exists to prevent, verified by running a lifecycle probe under both
// spellings. The exact pin also gives the lockfile per-platform nodejs.org URLs
// with integrity hashes; the range spelling records none.
//
// What that mechanism does NOT guarantee, and why this guard is not decorative:
// it engages only when the pnpm actually running the install honors devEngines.
// A pnpm predating devEngines support (pnpm 9 also defaults
// manage-package-manager-versions to false, so it does not self-switch to the
// packageManager pin), a non-pnpm installer, or a sandbox with no network all
// land here on the ambient Node instead. This class of failure is why the pin
// lives in devEngines rather than pnpm-workspace.yaml's useNodeVersion: pnpm 11
// removed useNodeVersion and ignores the leftover key SILENTLY — no warning,
// `pnpm config get use-node-version` still echoes the value back — so a pnpm
// major bump used to disarm the Node pin with no visible signal. Never restore
// useNodeVersion as the pinning mechanism, and never assume a runtime setting
// engaged because it reads back.
//
// Two behaviors of devEngines that are not pnpm's and cannot be fixed here:
// npm reads devEngines BEFORE preinstall and treats onFail "download" as
// "error", so `npm install` on any Node but the pinned one dies with
// EBADDEVENGINES and never reaches the pnpm-only message below. That is an
// accepted trade: the install is still stopped, which is this guard's actual
// job, just diagnosed as a Node problem rather than a package-manager one —
// and the alternative spelling that would fix it (a range) breaks the pin
// outright, per above. And nodejs.org publishes no musl build, so on Alpine
// pnpm resolves the glibc tarball and the install dies at exec time with a
// "not found" naming a binary that plainly exists; musl-based projects drop
// the devEngines block and keep .nvmrc plus engines.node as the contract.
//
// Every failure path prints an actionable message and exits 1 — a raw stack
// trace from this file is a bug in this file.
//
// Dependency-free on purpose: this runs before node_modules exists. Built-ins only.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

function fail(lines) {
  console.error(['', ...lines, ''].join('\n'));
  process.exit(1);
}

const agent = process.env.npm_config_user_agent ?? '';
if (!agent.startsWith('pnpm/')) {
  fail([
    '  ✖ This repo installs with pnpm only.',
    `    Detected installer: ${agent || '(none — run via a package manager, not node directly)'}`,
    '',
    '    Fix it:',
    '      • corepack enable && pnpm install   (packageManager pin in package.json)',
  ]);
}

const here = dirname(fileURLToPath(import.meta.url));
const nvmrcPath = join(here, '..', '..', '.nvmrc');

let raw;
try {
  raw = readFileSync(nvmrcPath, 'utf8');
} catch {
  fail([
    `  ✖ .nvmrc not found at ${nvmrcPath}.`,
    '',
    '    This repo pins its Node major in .nvmrc. Fix it:',
    '      • restore .nvmrc (a concrete version, e.g. 26.5.0), or',
    '      • drop the guard deliberately: delete .nvmrc AND the "preinstall"',
    '        script in package.json together.',
  ]);
}

const required = raw.trim().replace(/^v/, '');
const [reqMajor, reqMinor = 0, reqPatch = 0] = required.split('.').map(Number);

if (
  !Number.isInteger(reqMajor) ||
  reqMajor <= 0 ||
  !Number.isInteger(reqMinor) ||
  !Number.isInteger(reqPatch)
) {
  fail([
    `  ✖ Malformed .nvmrc: expected a concrete version like 26.5.0, got "${required}".`,
    '',
    '    Aliases (lts/*, node, latest) are not supported by this guard — pin the',
    '    exact version, and mirror the range it implies in package.json',
    '    engines.node and devEngines.runtime.version.',
  ]);
}

// Drift check, before the machine check: when the three pin sites disagree, pnpm
// supplies one version while this guard enforces another, and the wrong-Node
// message below would blame the machine for a repo bug. Name the drifted field
// instead — this is the cheapest place to catch it, since the guard already runs
// on every install and has .nvmrc in hand.
const expectedRange = `>=${required} <${reqMajor + 1}`;
const pkgPath = join(here, '..', '..', 'package.json');

let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
} catch (error) {
  fail([
    `  ✖ Could not read package.json at ${pkgPath}: ${error.message}`,
    '',
    '    This guard cross-checks the Node pin against engines.node and',
    '    devEngines.runtime.version, so it needs a parseable package.json.',
  ]);
}

const enginesNode = pkg.engines?.node;
const devEnginesVersion = pkg.devEngines?.runtime?.version;
const drifted = [];

if (enginesNode !== expectedRange) {
  drifted.push(`engines.node is "${enginesNode ?? '(missing)'}", expected "${expectedRange}"`);
}
// devEngines is optional: musl-based projects delete the block deliberately
// (nodejs.org ships no musl build). Present-but-wrong is drift; absent is a choice.
if (devEnginesVersion !== undefined && devEnginesVersion !== required) {
  drifted.push(`devEngines.runtime.version is "${devEnginesVersion}", expected "${required}"`);
}

if (drifted.length > 0) {
  fail([
    `  ✖ The Node pin disagrees with itself. .nvmrc says ${required}, so:`,
    ...drifted.map((line) => `      • ${line}`),
    '',
    '    This is a repo bug, not a problem with your machine — retargeting the',
    '    pin means changing every site together:',
    `      • .nvmrc                     → the exact version (currently ${required})`,
    `      • engines.node               → "${expectedRange}"`,
    `      • devEngines.runtime.version → "${required}" — exact, never a range; a`,
    '                                     range makes pnpm install a registry stub',
    '                                     and silently use the ambient Node. Omit',
    '                                     the block on musl/Alpine, where no Node',
    '                                     build is published.',
    '      • pnpm-lock.yaml             → run `pnpm install` and commit the result,',
    '                                     or CI fails on --frozen-lockfile',
  ]);
}

const actual = process.versions.node;
const [actMajor, actMinor, actPatch] = actual.split('.').map(Number);

// Pin to the .nvmrc major and require at least the .nvmrc patch within it.
const okMajor = actMajor === reqMajor;
const okFloor = actMinor > reqMinor || (actMinor === reqMinor && actPatch >= reqPatch);

if (!okMajor || !okFloor) {
  // Two different problems reach this branch, and they take different fixes:
  // the required major is missing entirely, or it is present but too old.
  // Diagnosing the second as the first sends the reader hunting for a Node
  // they demonstrably have.
  const wrongMajorHelp = [
    `    Node ${reqMajor} is very likely not installed anywhere on this machine.`,
    '    Verify that before anything else — both checks below fail in ways that',
    '    make an absent Node look present:',
    '',
    `      • Homebrew's versioned aliases can all point at ONE build, so the`,
    `        existence of /opt/homebrew/opt/node@${reqMajor} proves nothing:`,
    `            readlink /opt/homebrew/opt/node@${reqMajor}`,
    '            ls /opt/homebrew/Cellar | grep node',
    `        If that symlink resolves to a Cellar build that is not ${reqMajor}.x,`,
    `        you do not have Node ${reqMajor}.`,
    '',
    '      • nvm can be installed but never sourced, which hides every version it',
    '        manages behind "nvm: command not found":',
    '            command -v nvm || ls ~/.nvm/nvm.sh',
    '        If the file exists but the command does not, source it first:',
    '            . ~/.nvm/nvm.sh',
    '',
    '    Then install it:',
    '      • nvm:  nvm install && nvm use      (reads .nvmrc; needs nvm sourced)',
    `      • pnpm 11+:  pnpm runtime set node ${reqMajor} -g`,
    `        pnpm 10 spelling: pnpm env use --global ${reqMajor}`,
    '        Both error with ERR_PNPM_NO_GLOBAL_BIN_DIR when the global bin dir is',
    '        unset or off PATH. Run `pnpm setup` first if you hit that.',
    `      • or install Node ${required} through whatever version manager you use.`,
  ];

  const oldPatchHelp = [
    `    You have Node ${reqMajor}, but ${actual} is older than the ${required} floor.`,
    `    Upgrade within the major — there is nothing wrong with your Node install:`,
    '      • nvm:  nvm install && nvm use      (reads .nvmrc)',
    `      • pnpm 11+:  pnpm runtime set node ${required} -g`,
    `      • brew:  brew upgrade node@${reqMajor}`,
  ];

  fail([
    `  ✖ Wrong Node.js version: this repo requires Node ${reqMajor}.x (>= ${required}).`,
    `    You are running v${actual}.`,
    '',
    ...(okMajor ? oldPatchHelp : wrongMajorHelp),
    '',
    '    Why pnpm did not supply it: package.json pins the runtime in',
    '    devEngines.runtime, which pnpm downloads and runs lifecycle scripts under.',
    '    That engages only when the pnpm running this install honors devEngines and',
    '    could reach the network. Check which pnpm actually ran:',
    '        pnpm -v      # compare against the packageManager pin in package.json',
    '    If it is below that pin, the fix is to get onto it (`corepack enable`, or',
    '    upgrade pnpm) — pnpm 9 and older ignore devEngines entirely and do not',
    '    self-switch to the pin. Upgrading pnpm is safe here: the pin no longer',
    "    rides pnpm-workspace.yaml's useNodeVersion, which pnpm 11 removed.",
  ]);
}
