// Preinstall guard: hard-fail an install not run through pnpm, and any install
// running on the wrong Node major.
//
// pnpm-only: the repo's tooling (workspace protocol, useNodeVersion, lockfile)
// assumes pnpm; an accidental `npm install` / `yarn install` half-installs and
// corrupts the lockfile story. The package-manager check reads the installer's
// own user agent, so it needs no downloader and no dependencies.
//
// Node major: pinned by the root .nvmrc, mirrored in engines.node and the
// useNodeVersion setting in pnpm-workspace.yaml. useNodeVersion makes pnpm run
// its own commands under the pinned Node automatically, so under pnpm this guard
// sees the pinned version and passes silently. It earns its keep for the paths
// pnpm's runtime management does NOT cover: an environment where pnpm's Node
// download did not engage, or a non-pnpm installer that slipped past the agent
// check. In those cases it stops the install with an actionable message instead
// of letting a wrong-major Node produce confusing downstream failures.
//
// Dependency-free on purpose: this runs before node_modules exists. Built-ins only.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const agent = process.env.npm_config_user_agent ?? '';
if (!agent.startsWith('pnpm/')) {
  console.error(
    [
      '',
      '  ✖ This repo installs with pnpm only.',
      `    Detected installer: ${agent || '(none — run via a package manager, not node directly)'}`,
      '',
      '    Fix it:',
      '      • corepack enable && pnpm install   (packageManager pin in package.json)',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const nvmrcPath = join(here, '..', '..', '.nvmrc');

const required = readFileSync(nvmrcPath, 'utf8').trim().replace(/^v/, '');
const [reqMajor, reqMinor = 0, reqPatch = 0] = required.split('.').map(Number);

const actual = process.versions.node;
const [actMajor, actMinor, actPatch] = actual.split('.').map(Number);

// Pin to the .nvmrc major and require at least the .nvmrc patch within it.
const okMajor = actMajor === reqMajor;
const okFloor = actMinor > reqMinor || (actMinor === reqMinor && actPatch >= reqPatch);

if (!okMajor || !okFloor) {
  console.error(
    [
      '',
      `  ✖ Wrong Node.js version: this repo requires Node ${reqMajor}.x (>= ${required}).`,
      `    You are running v${actual}.`,
      '',
      '    Fix it:',
      '      • nvm:  nvm install && nvm use      (reads .nvmrc)',
      `      • or install Node ${required} via your version manager`,
      '',
      '    Under pnpm this normally self-corrects (useNodeVersion in',
      '    pnpm-workspace.yaml). If you hit this with pnpm, your pnpm is too old',
      '    to honor useNodeVersion — upgrade pnpm (>= 10.16).',
      '',
    ].join('\n'),
  );
  process.exit(1);
}
