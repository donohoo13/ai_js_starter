// Preinstall guard: hard-fail an install not run through pnpm, and any install
// running on the wrong Node version. Dependency-free on purpose — this runs
// before node_modules exists, so built-ins only. Every failure path prints an
// actionable message and exits 1; a raw stack trace from here is a bug in here.
//
// pnpm-only, because the workspace protocol, the runtime pin, and the lockfile
// all assume pnpm; a stray `npm install` half-installs and corrupts the lockfile
// story. Read from the installer's own user agent, so it needs no dependencies.
//
// ── The Node pin: four sites, one version ───────────────────────────────────
//   .nvmrc                      exact version. The source of truth, and what nvm reads.
//   engines.node                ">=<version> <<major+1>". The range this file enforces.
//   devEngines.runtime.version  exact version. What pnpm downloads and runs scripts under.
//   pnpm-lock.yaml              regenerate and commit; stale fails --frozen-lockfile, CI's default.
// This file cross-checks the first three on every install BEFORE it checks the
// machine, because a partial retarget is otherwise indistinguishable from a
// broken environment and sends the reader hunting through their Node installs
// for a repo bug.
//
// ── Why these defaults, so a project can diverge deliberately ───────────────
// Each was measured on pnpm 10.32.1 and 11.15.1 with a lifecycle probe, not
// assumed. Change one only with equivalent evidence.
//
// devEngines.runtime, NOT pnpm-workspace.yaml's useNodeVersion.
//   useNodeVersion worked correctly through pnpm 10 and was REMOVED in pnpm 11,
//   which ignores the leftover key silently: no warning, and `pnpm config get
//   use-node-version` still echoes the value back. So a pnpm major bump used to
//   disarm the pin with no visible signal. The general claim "useNodeVersion
//   does not work" is false and misleads the next debugger — it is specifically
//   gone in 11. Never assume a runtime setting engaged because it reads back.
//
// engineStrict OFF wherever devEngines is present.
//   pnpm's own settings docs recommend pairing engineStrict with nodeVersion,
//   so a project that followed them carries it. Alongside devEngines the pair
//   deadlocks: the engines check runs against the AMBIENT Node before pnpm
//   switches to the pinned runtime, so every pnpm command fails on any other
//   Node — including the install that would have downloaded it. The guard below
//   hard-fails on the pairing; read it for the measurement, for the one state
//   it cannot fire in, and for what turning engineStrict off costs.
//
// An exact version, NEVER a range.
//   Given a range, pnpm abandons its runtime resolution and installs the
//   third-party `node` package from the npm registry instead: bin creation
//   fails with ENOENT, the build-script allowlist blocks its setup script, and
//   lifecycle scripts silently run on the AMBIENT Node — reintroducing the exact
//   bug this pin exists to prevent. The exact spelling also earns the lockfile
//   per-platform nodejs.org URLs with integrity hashes; a range records none.
//
// Accepted cost: npm reads devEngines before preinstall and treats onFail
//   "download" as "error", so `npm install` on any other Node dies with
//   EBADDEVENGINES rather than reaching the pnpm-only message below. The install
//   still stops, which is this guard's actual job; only the diagnosis degrades.
//   The change that would fix it (a range) breaks the pin outright, per above.
//
// Known limit — musl: nodejs.org publishes no musl build, so on Alpine pnpm
//   resolves the glibc tarball and the install dies at exec time with a "not
//   found" naming a binary that plainly exists. musl projects DELETE the
//   devEngines block and keep .nvmrc plus engines.node as the contract; this
//   guard treats an absent block as that deliberate posture, not as drift.
//
// This guard is not decorative: devEngines engages only when the pnpm running
// the install honors it. pnpm 9 (which also defaults manage-package-manager-
// versions to false, so it ignores the packageManager pin), a non-pnpm
// installer, or a sandbox with no network all land here on the ambient Node.
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

// engineStrict × devEngines deadlock, also before the machine check and for the
// same reason: it is a repo bug that presents as a broken machine.
//
// pnpm's settings docs recommend pairing engineStrict with nodeVersion to stop
// contributors adding dependencies that declare an incompatible engine, so a
// project that followed them carries engineStrict: true. With nodeVersion also
// set the engines check runs against the version pnpm PRETENDS, so it passes;
// delete nodeVersion for the devEngines pin — which is exactly what this repo's
// changelog instructs — and the check falls through to the AMBIENT Node, and it
// runs BEFORE pnpm switches to the devEngines runtime. So the guard blocks the
// very install that would have provisioned the pinned Node.
//
// Measured on pnpm 10.34.1, engines.node ">=22.22.3 <23", ambient Node 24.17.0:
// engineStrict true failed every pnpm command with ERR_PNPM_UNSUPPORTED_ENGINE,
// install and typecheck alike, and provisioning the runtime first did not help
// — the check precedes the switch every time. engineStrict false installed,
// fetched Node 22.22.3, and ran scripts on it while the shell stayed on 24.17.0.
// pnpm's settings page claims a project's own engines field fails the install
// "regardless of this configuration"; that is not the observed behavior on
// 10.34.1. Why the check passes with engineStrict off is unknown — the
// measurement is what this guard encodes, not the doc line.
//
// Known limit: this check cannot fire in the bricked state, because pnpm refuses
// at command startup and preinstall never runs — that developer gets pnpm's own
// message blaming their Node. It fires on the machine of whoever introduces the
// pairing while already on the pinned Node, which is the one place the
// configuration is silently latent and the cheapest place it will ever be fixed.
function readIfPresent(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function engineStrictSite() {
  const workspace = readIfPresent(join(here, '..', '..', 'pnpm-workspace.yaml'));
  if (
    workspace !== null &&
    /^engineStrict[ \t]*:[ \t]*(true|'true'|"true")[ \t]*(#.*)?$/m.test(workspace)
  ) {
    return { file: 'pnpm-workspace.yaml', found: 'engineStrict: true', fix: 'engineStrict: false' };
  }
  // The .npmrc spelling predates pnpm's move of settings into pnpm-workspace.yaml
  // and is still honored, so a project carrying it deadlocks identically.
  const npmrc = readIfPresent(join(here, '..', '..', '.npmrc'));
  if (npmrc !== null && /^[ \t]*engine-strict[ \t]*=[ \t]*true[ \t]*$/m.test(npmrc)) {
    return { file: '.npmrc', found: 'engine-strict=true', fix: 'engine-strict=false' };
  }
  return null;
}

// Absent devEngines is the deliberate musl posture, where engineStrict is the
// only Node enforcement the project has and must stay on. Only the pairing fails.
const engineStrict = pkg.devEngines?.runtime === undefined ? null : engineStrictSite();

if (engineStrict) {
  fail([
    '  ✖ engineStrict and devEngines cannot coexist. As configured, this repo is',
    `    uninstallable by anyone whose ambient Node is not already ${required}.`,
    `    Found ${engineStrict.found} in ${engineStrict.file}, alongside`,
    '    devEngines.runtime in package.json.',
    '',
    '    pnpm checks engines against the ambient Node BEFORE it switches to the',
    '    devEngines runtime, so the check blocks the very install that would have',
    `    downloaded Node ${required}. Every pnpm command fails that way, not just`,
    '    install. You are reading this instead of ERR_PNPM_UNSUPPORTED_ENGINE only',
    `    because your own Node (v${process.versions.node}) happens to satisfy the range.`,
    '',
    '    Fix it — pick one:',
    `      • Keep the pin: set ${engineStrict.fix} in ${engineStrict.file}. The`,
    '        runtime download then works and contributors need no Node of their own.',
    '      • Keep engineStrict: delete the devEngines block from package.json and',
    `        require every contributor to install Node ${required} themselves.`,
    '',
    '    What turning engineStrict off gives up: pnpm no longer hard-blocks a',
    '    DEPENDENCY that declares an incompatible engine. That capability is not',
    '    recoverable alongside devEngines on pnpm 10.x — getting it back means',
    '    engineStrict: true, which reinstates the deadlock. This guard still',
    '    enforces the Node the repo actually runs on, which is unaffected.',
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
