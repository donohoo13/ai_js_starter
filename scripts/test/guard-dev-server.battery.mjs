// Verification battery for .claude/hooks/guard-dev-server.mjs.
//
// The repo has no test runner (empty workspace), and the guard is a
// dependency-free PreToolUse hook whose interface is: a tool-call JSON payload
// on stdin, producing an exit code (0 allow, 2 block) and a stderr diagnostic.
// This battery exercises that exact interface: each case pipes a crafted
// payload into the real hook as a child process and asserts the exit code,
// plus a stderr fragment where the branch matters. It never unit-tests the
// hook's internal parsing helpers.
//
// Covers: every runner and binary spelling the task's acceptance criteria
// enumerate, compound and multiline commands, env-var prefixes, quoted
// content that merely mentions a server command, package-management
// subcommands that install rather than run, near-miss binary names
// (vitest vs vite), and fail-open on malformed input.
// Run: pnpm exec node scripts/test/guard-dev-server.battery.mjs
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hookPath = join(here, '..', '..', '.claude', 'hooks', 'guard-dev-server.mjs');

const BLOCK = 2;
const ALLOW = 0;

const cases = [
  // Runner + dev script spellings
  { name: 'pnpm dev', command: 'pnpm dev', expect: BLOCK },
  { name: 'pnpm run dev', command: 'pnpm run dev', expect: BLOCK },
  { name: 'npm run dev', command: 'npm run dev', expect: BLOCK },
  { name: 'yarn dev', command: 'yarn dev', expect: BLOCK },
  { name: 'bun dev', command: 'bun dev', expect: BLOCK },
  { name: 'turbo dev', command: 'turbo dev', expect: BLOCK },
  { name: 'namespaced dev script', command: 'pnpm dev:web', expect: BLOCK },
  { name: 'runner with filter flag', command: 'pnpm --filter web dev', expect: BLOCK },
  // Direct binaries
  { name: 'bare vite', command: 'vite', expect: BLOCK },
  { name: 'vite dev', command: 'vite dev', expect: BLOCK },
  { name: 'vite preview', command: 'vite preview', expect: BLOCK },
  { name: 'next dev', command: 'next dev', expect: BLOCK },
  { name: 'next start', command: 'next start', expect: BLOCK },
  { name: 'astro dev', command: 'astro dev', expect: BLOCK },
  { name: 'remix dev', command: 'remix dev', expect: BLOCK },
  { name: 'nuxt dev', command: 'nuxt dev', expect: BLOCK },
  { name: 'storybook dev', command: 'storybook dev -p 6006', expect: BLOCK },
  { name: 'bare storybook', command: 'storybook', expect: BLOCK },
  { name: 'expo start', command: 'expo start', expect: BLOCK },
  { name: 'wrangler dev', command: 'wrangler dev', expect: BLOCK },
  { name: 'runner-launched binary', command: 'pnpm exec vite', expect: BLOCK },
  // Tunnels and service containers
  { name: 'ngrok', command: 'ngrok http 3000', expect: BLOCK },
  { name: 'cloudflared tunnel', command: 'cloudflared tunnel run mytunnel', expect: BLOCK },
  { name: 'docker compose up', command: 'docker compose up -d', expect: BLOCK },
  { name: 'docker-compose up', command: 'docker-compose up', expect: BLOCK },
  { name: 'supabase start', command: 'supabase start', expect: BLOCK },
  // Compound, prefixed, and multiline commands
  { name: 'compound cd && dev', command: 'cd apps/web && pnpm dev', expect: BLOCK },
  { name: 'env-var prefix', command: 'PORT=3001 pnpm dev', expect: BLOCK },
  { name: 'multiline batch', command: 'pnpm build\npnpm dev', expect: BLOCK },
  { name: 'subshell wrap', command: '(pnpm dev)', expect: BLOCK },
  // Allowed: near-misses and mentions
  { name: 'similar script name', command: 'pnpm devtools-check', expect: ALLOW },
  { name: 'dev inside quotes', command: 'git commit -m "fix dev server docs"', expect: ALLOW },
  { name: 'plain build', command: 'pnpm build', expect: ALLOW },
  { name: 'vitest is not vite', command: 'pnpm exec vitest run', expect: ALLOW },
  { name: 'next build', command: 'next build', expect: ALLOW },
  { name: 'vite build', command: 'vite build', expect: ALLOW },
  { name: 'storybook build', command: 'storybook build', expect: ALLOW },
  { name: 'docker compose down', command: 'docker compose down', expect: ALLOW },
  { name: 'installing a server pkg', command: 'pnpm add vite', expect: ALLOW },
  {
    name: 'echo mentioning dev',
    command: 'echo "please run pnpm dev in your terminal"',
    expect: ALLOW,
  },
  { name: 'grep for dev', command: 'git log --grep dev', expect: ALLOW },
  { name: 'dev in a path', command: 'node scripts/dev-check.mjs', expect: ALLOW },
];

function runHook(stdinText) {
  return spawnSync(process.execPath, [hookPath], {
    input: stdinText,
    encoding: 'utf8',
    timeout: 10_000,
  });
}

let failures = 0;

function report(name, passed, detail) {
  if (passed) {
    console.log(`ok   ${name}`);
    return;
  }
  failures++;
  console.error(`FAIL ${name}: ${detail}`);
}

for (const testCase of cases) {
  const payload = JSON.stringify({ tool_input: { command: testCase.command } });
  const result = runHook(payload);
  const verdictOk = result.status === testCase.expect;
  const fragmentOk =
    testCase.expect === ALLOW || (result.stderr ?? '').includes('guard-dev-server');
  report(
    testCase.name,
    verdictOk && fragmentOk,
    `expected exit ${testCase.expect}, got ${result.status}; stderr: ${(result.stderr ?? '').trim()}`,
  );
}

// Fail-open contract: malformed JSON and an absent command must never block.
const malformed = runHook('this is not json');
report('malformed JSON fails open', malformed.status === ALLOW, `got exit ${malformed.status}`);

const noCommand = runHook(JSON.stringify({ tool_input: {} }));
report('missing command allows', noCommand.status === ALLOW, `got exit ${noCommand.status}`);

if (failures > 0) {
  console.error(`\n${failures} case(s) failed`);
  process.exit(1);
}
console.log(`\nall ${cases.length + 2} cases passed`);
