// Preinstall guard: hard-fail an install running on the wrong Node major.
//
// The repo's Node major is pinned by the root .nvmrc, mirrored in engines.node
// and the useNodeVersion setting in pnpm-workspace.yaml. useNodeVersion makes pnpm run
// its own commands under the pinned Node automatically, so under pnpm this guard
// sees the pinned version and passes silently. It earns its keep for the paths
// pnpm's runtime management does NOT cover: an accidental `npm install` /
// `yarn install`, or an environment where pnpm's Node download did not engage.
// In those cases it stops the install with an actionable message instead of
// letting a wrong-major Node produce confusing downstream failures.
//
// Dependency-free on purpose: this runs before node_modules exists. Built-ins only.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
