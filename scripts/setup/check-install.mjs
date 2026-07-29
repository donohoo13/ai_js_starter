// Preinstall guard: hard-fail an install not run through pnpm, and any install
// running on the wrong Node major.
//
// pnpm-only: the repo's tooling (workspace protocol, devEngines runtime pin,
// lockfile) assumes pnpm; an accidental `npm install` / `yarn install`
// half-installs and corrupts the lockfile story. The package-manager check reads
// the installer's own user agent, so it needs no downloader and no dependencies.
//
// Node major: pinned by the root .nvmrc, mirrored in engines.node (the range
// this guard enforces) and in devEngines.runtime in package.json (the mechanism
// that supplies it). devEngines.runtime with onFail: "download" makes pnpm fetch
// the pinned Node and run lifecycle scripts under it, so on a healthy setup this
// guard sees the pinned version and passes silently.
//
// What that mechanism does NOT guarantee, and why this guard is not decorative:
// it engages only when the pnpm actually running the install honors devEngines.
// A pnpm predating devEngines support, a non-pnpm installer that slipped past
// the agent check, or a sandbox with no network to fetch the runtime all land
// here with the ambient Node instead. This exact class of failure is why the
// pin lives in devEngines rather than pnpm-workspace.yaml's useNodeVersion:
// pnpm 11 removed useNodeVersion and ignores the leftover key SILENTLY — no
// warning, `pnpm config get use-node-version` still echoes the value back — so
// a pnpm major bump used to disarm the Node pin with no visible signal.
// Never restore useNodeVersion as the pinning mechanism, and never assume a
// runtime setting engaged because it reads back.
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
    '    exact version, and mirror it in package.json devEngines.runtime.version',
    '    and engines.node.',
  ]);
}

const actual = process.versions.node;
const [actMajor, actMinor, actPatch] = actual.split('.').map(Number);

// Pin to the .nvmrc major and require at least the .nvmrc patch within it.
const okMajor = actMajor === reqMajor;
const okFloor = actMinor > reqMinor || (actMinor === reqMinor && actPatch >= reqPatch);

if (!okMajor || !okFloor) {
  fail([
    `  ✖ Wrong Node.js version: this repo requires Node ${reqMajor}.x (>= ${required}).`,
    `    You are running v${actual}.`,
    '',
    `    Node ${reqMajor} is very likely not installed anywhere on this machine.`,
    '    Verify that before anything else — the two checks below fail silently in',
    '    ways that make an absent Node look present:',
    '',
    `      • Homebrew's versioned aliases can all point at ONE build, so the`,
    `        existence of /opt/homebrew/opt/node@${reqMajor} proves nothing:`,
    `            readlink /opt/homebrew/opt/node@${reqMajor}`,
    '            ls /opt/homebrew/Cellar | grep node',
    `        If that symlink resolves to a Cellar build whose version is not`,
    `        ${reqMajor}.x, you do not have Node ${reqMajor}.`,
    '',
    '      • nvm can be installed but never sourced, which hides every version it',
    '        manages behind "nvm: command not found":',
    '            command -v nvm || ls ~/.nvm/nvm.sh',
    '        If the file exists but the command does not, source it first:',
    '            . ~/.nvm/nvm.sh',
    '',
    '    Then install it:',
    '      • nvm:  nvm install && nvm use      (reads .nvmrc; needs nvm sourced)',
    `      • pnpm: pnpm env use --global ${reqMajor}`,
    '        This is a no-op unless PNPM_HOME is set AND on your PATH — it installs',
    '        into a directory nothing reads otherwise. Check: echo "$PNPM_HOME"',
    `      • or install Node ${required} through whatever version manager you use.`,
    '',
    '    Why pnpm did not supply it: package.json pins the runtime in',
    '    devEngines.runtime, which pnpm downloads and uses for lifecycle scripts.',
    '    That only engages if the running pnpm honors devEngines and could reach',
    '    the network. Do NOT reach for a pnpm upgrade as the fix — pnpm 11 removed',
    '    the older useNodeVersion setting and ignores it without warning, so a',
    '    version bump is how this breaks, not how it is repaired. Confirm which',
    '    pnpm actually ran (pnpm -v) against the packageManager pin in',
    '    package.json before touching pnpm at all.',
  ]);
}
