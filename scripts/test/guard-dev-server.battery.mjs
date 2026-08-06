// Verification battery for the guard-dev-server PreToolUse hook.
//
// The repo has no test runner (empty workspace). The guard's real interface
// is the registered command string in .claude/settings.json — a shell `case`
// prefilter that pipes the tool-call payload into the hook — so this battery
// reads that command string out of settings.json at run time and executes
// every case through it. Testing the bare .mjs instead is how a prefilter
// gap ships under a green battery: the prefilter drops a spelling, the hook
// that would block it never runs, and a direct-invocation test cannot see
// the difference. Payloads carry a neutral cwd on purpose: this repo's own
// path contains "start", which satisfies the prefilter for every payload and
// would mask a missing token.
//
// Covers: runner scripts (dev/start/serve/preview and namespaced forms),
// direct binaries, tunnels, containers, wrapper prefixes (nohup/env/time),
// shell -c payloads, quoted script names, unterminated quotes, compound and
// multiline commands, package-management escapes (workspace-filtered forms
// included), near-miss names (vitest vs vite), and fail-open on malformed
// input. Run: pnpm exec node scripts/test/guard-dev-server.battery.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const settings = JSON.parse(readFileSync(join(repoRoot, '.claude', 'settings.json'), 'utf8'));
const registered = settings.hooks.PreToolUse.find((entry) => entry.matcher === 'Bash')
  .hooks.map((hook) => hook.command)
  .find((cmd) => cmd.includes('guard-dev-server'));
if (!registered) {
  console.error('FAIL guard-dev-server is not registered under the Bash matcher in settings.json');
  process.exit(1);
}

const NEUTRAL_CWD = '/Users/x/acme-app';
const BLOCK = 2;
const ALLOW = 0;

const cases = [
  // Runner + server script spellings
  { name: 'pnpm dev', command: 'pnpm dev', expect: BLOCK },
  { name: 'pnpm run dev', command: 'pnpm run dev', expect: BLOCK },
  { name: 'npm run dev', command: 'npm run dev', expect: BLOCK },
  { name: 'yarn dev', command: 'yarn dev', expect: BLOCK },
  { name: 'bun dev', command: 'bun dev', expect: BLOCK },
  { name: 'turbo dev', command: 'turbo dev', expect: BLOCK },
  { name: 'npm start', command: 'npm start', expect: BLOCK },
  { name: 'pnpm start', command: 'pnpm start', expect: BLOCK },
  { name: 'yarn start', command: 'yarn start', expect: BLOCK },
  { name: 'pnpm run start', command: 'pnpm run start', expect: BLOCK },
  { name: 'pnpm preview', command: 'pnpm preview', expect: BLOCK },
  { name: 'npm run preview', command: 'npm run preview', expect: BLOCK },
  { name: 'pnpm serve', command: 'pnpm serve', expect: BLOCK },
  { name: 'npm run serve', command: 'npm run serve', expect: BLOCK },
  { name: 'namespaced dev script', command: 'pnpm dev:web', expect: BLOCK },
  { name: 'runner with filter flag', command: 'pnpm --filter web dev', expect: BLOCK },
  { name: 'quoted script name', command: 'pnpm run "dev"', expect: BLOCK },
  // Direct binaries
  { name: 'bare vite', command: 'vite', expect: BLOCK },
  { name: 'vite dev', command: 'vite dev', expect: BLOCK },
  { name: 'vite preview', command: 'vite preview', expect: BLOCK },
  { name: 'next dev', command: 'next dev', expect: BLOCK },
  { name: 'next start', command: 'next start', expect: BLOCK },
  { name: 'astro dev', command: 'astro dev', expect: BLOCK },
  { name: 'astro preview', command: 'astro preview', expect: BLOCK },
  { name: 'remix dev', command: 'remix dev', expect: BLOCK },
  { name: 'nuxt dev', command: 'nuxt dev', expect: BLOCK },
  { name: 'nuxt preview', command: 'nuxt preview', expect: BLOCK },
  { name: 'storybook dev', command: 'storybook dev -p 6006', expect: BLOCK },
  { name: 'bare storybook', command: 'storybook', expect: BLOCK },
  { name: 'expo start', command: 'expo start', expect: BLOCK },
  { name: 'wrangler dev', command: 'wrangler dev', expect: BLOCK },
  { name: 'runner-launched binary', command: 'pnpm exec vite', expect: BLOCK },
  { name: 'bare serve', command: 'serve dist', expect: BLOCK },
  { name: 'python http.server', command: 'python3 -m http.server 8000', expect: BLOCK },
  // Tunnels and service containers
  { name: 'ngrok', command: 'ngrok http 3000', expect: BLOCK },
  { name: 'cloudflared tunnel', command: 'cloudflared tunnel run mytunnel', expect: BLOCK },
  { name: 'docker compose up', command: 'docker compose up -d', expect: BLOCK },
  { name: 'docker-compose up', command: 'docker-compose up', expect: BLOCK },
  { name: 'docker run detached', command: 'docker run -d -p 5432:5432 postgres', expect: BLOCK },
  { name: 'docker run published', command: 'docker run -p 8080:80 nginx', expect: BLOCK },
  { name: 'docker start', command: 'docker start db', expect: BLOCK },
  { name: 'podman run detached', command: 'podman run -d nginx', expect: BLOCK },
  { name: 'supabase start', command: 'supabase start', expect: BLOCK },
  // Wrappers, shells, compound, prefixed, and multiline commands
  { name: 'compound cd && dev', command: 'cd apps/web && pnpm dev', expect: BLOCK },
  { name: 'env-var prefix', command: 'PORT=3001 pnpm dev', expect: BLOCK },
  { name: 'nohup prefix', command: 'nohup pnpm dev &', expect: BLOCK },
  { name: 'env binary prefix', command: 'env PORT=3001 pnpm dev', expect: BLOCK },
  { name: 'time prefix', command: 'time pnpm dev', expect: BLOCK },
  { name: 'bash -c payload', command: 'bash -c "pnpm dev"', expect: BLOCK },
  { name: 'sh -c compound payload', command: 'sh -c "cd apps/web && pnpm dev"', expect: BLOCK },
  { name: 'multiline batch', command: 'pnpm build\npnpm dev', expect: BLOCK },
  { name: 'subshell wrap', command: '(pnpm dev)', expect: BLOCK },
  {
    name: 'unterminated quote before dev',
    command: "# Start the app's dev server\npnpm dev",
    expect: BLOCK,
  },
  {
    name: 'vite after unbalanced quotes',
    command: "git commit -m 'it'\\''s ok' && vite",
    expect: BLOCK,
  },
  // Allowed: near-misses, mentions, and package management
  { name: 'similar script name', command: 'pnpm devtools-check', expect: ALLOW },
  { name: 'dev inside quotes', command: 'git commit -m "fix dev server docs"', expect: ALLOW },
  { name: 'plain build', command: 'pnpm build', expect: ALLOW },
  { name: 'vitest is not vite', command: 'pnpm exec vitest run', expect: ALLOW },
  { name: 'next build', command: 'next build', expect: ALLOW },
  { name: 'vite build', command: 'vite build', expect: ALLOW },
  { name: 'storybook build', command: 'storybook build', expect: ALLOW },
  { name: 'docker compose down', command: 'docker compose down', expect: ALLOW },
  { name: 'docker build', command: 'docker build -t app .', expect: ALLOW },
  { name: 'docker run one-off', command: 'docker run --rm node:24 node script.mjs', expect: ALLOW },
  { name: 'installing a server pkg', command: 'pnpm add vite', expect: ALLOW },
  { name: 'filtered install', command: 'pnpm --filter web add vite', expect: ALLOW },
  { name: 'short filter install', command: 'pnpm -F web add vite', expect: ALLOW },
  { name: 'workspace install', command: 'yarn workspace web add vite', expect: ALLOW },
  { name: 'package inspection', command: 'npm view vite', expect: ALLOW },
  {
    name: 'echo mentioning dev',
    command: 'echo "please run pnpm dev in your terminal"',
    expect: ALLOW,
  },
  { name: 'grep for dev', command: 'git log --grep dev', expect: ALLOW },
  { name: 'dev in a path', command: 'node scripts/dev-check.mjs', expect: ALLOW },
];

function runPipeline(stdinText) {
  return spawnSync('bash', ['-c', registered], {
    input: stdinText,
    encoding: 'utf8',
    timeout: 10_000,
    env: { ...process.env, CLAUDE_PROJECT_DIR: repoRoot },
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
  const payload = JSON.stringify({
    tool_input: { command: testCase.command },
    cwd: NEUTRAL_CWD,
  });
  const result = runPipeline(payload);
  const verdictOk = result.status === testCase.expect;
  const fragmentOk =
    testCase.expect === ALLOW || (result.stderr ?? '').includes('guard-dev-server');
  report(
    testCase.name,
    verdictOk && fragmentOk,
    `expected exit ${testCase.expect}, got ${result.status}; stderr: ${(result.stderr ?? '').trim()}`,
  );
}

// Fail-open contract: malformed input must never block, even when the
// prefilter routes it to the hook.
const malformed = runPipeline('this is not json but mentions a dev server');
report('malformed JSON fails open', malformed.status === ALLOW, `got exit ${malformed.status}`);

const noCommand = runPipeline(JSON.stringify({ tool_input: {}, cwd: NEUTRAL_CWD }));
report('missing command allows', noCommand.status === ALLOW, `got exit ${noCommand.status}`);

if (failures > 0) {
  console.error(`\n${failures} case(s) failed`);
  process.exit(1);
}
console.log(`\nall ${cases.length + 2} cases passed`);
