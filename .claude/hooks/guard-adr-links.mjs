#!/usr/bin/env node
// PreToolUse guard: blocks Edit/Write on an ADR whose frontmatter omits `status`
// or declares a supersession/amendment relation the target ADR does not mirror
// back. Supersession recorded only in body prose is invisible to a reader
// scanning frontmatter, so a retired decision reads as binding — the failure
// this hook exists to make impossible. Exit 2 blocks the tool call and surfaces
// stderr to Claude; exit 0 allows it. Fail-open like guard-main: unparseable
// input, an unreadable file, or a launch failure must not lock the ADR
// directory shut. A relation pointing at an ADR that does not exist yet also
// passes, because writing a pair requires one of the two files to name the
// other first; the back-link is enforced the moment both files exist.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, basename } from 'node:path';

const RECIPROCAL = {
  supersedes: 'superseded-by',
  'superseded-by': 'supersedes',
  amends: 'amended-by',
  'amended-by': 'amends',
};
const STATUSES = ['proposed', 'accepted', 'amended', 'superseded', 'deprecated'];
// A status naming a relation is incoherent without that relation declared.
const STATUS_REQUIRES = { superseded: 'superseded-by', amended: 'amended-by' };

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const filePath = input.tool_input?.file_path ?? '';
if (!filePath.includes('/docs/adr/') || !filePath.endsWith('.md')) process.exit(0);

const selfNum = basename(filePath).match(/^(\d{4})-/)?.[1];
if (!selfNum) process.exit(0); // README or other non-ADR file living in the directory

// Reconstruct the post-write content. Write carries it whole; Edit carries a
// fragment, so replay the substitution against what is on disk — the same
// string replacement Edit itself performs.
const ti = input.tool_input ?? {};
let content;
if (typeof ti.content === 'string') {
  content = ti.content;
} else if (typeof ti.new_string === 'string' && typeof ti.old_string === 'string') {
  let existing;
  try {
    existing = readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
  }
  if (ti.replace_all) {
    content = existing.split(ti.old_string).join(ti.new_string);
  } else {
    const at = existing.indexOf(ti.old_string);
    content =
      at === -1
        ? existing
        : existing.slice(0, at) + ti.new_string + existing.slice(at + ti.old_string.length);
  }
} else {
  process.exit(0);
}

// Frontmatter only: relations declared in body prose are exactly what this hook
// treats as absent, so the parse deliberately stops at the closing fence.
function frontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  return match ? match[1] : null;
}

// Accepts inline flow lists (`amends: [0030, 0031]`), a bare number, and YAML
// block lists on following lines.
function relations(fm) {
  const found = {};
  const lines = fm.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const head = /^([a-z-]+):(.*)$/.exec(lines[i]);
    if (!head || !(head[1] in RECIPROCAL)) continue;
    const nums = (head[2].match(/\d{1,4}/g) ?? []).map((n) => n.padStart(4, '0'));
    for (let j = i + 1; j < lines.length; j++) {
      const item = /^\s+-\s*(\d{1,4})\s*$/.exec(lines[j]);
      if (!item) break;
      nums.push(item[1].padStart(4, '0'));
      i = j;
    }
    found[head[1]] = (found[head[1]] ?? []).concat(nums);
  }
  return found;
}

const fm = frontmatter(content);
const problems = [];

if (!fm) {
  problems.push(
    `no YAML frontmatter — every ADR opens with a \`---\` block declaring \`status\` (one of: ${STATUSES.join(', ')}).`,
  );
} else {
  const status = /^status:\s*(\S+)/m.exec(fm)?.[1];
  if (!status) {
    problems.push(
      `frontmatter has no \`status\`. A status-less ADR is indistinguishable from a binding one. Add \`status:\` with one of: ${STATUSES.join(', ')}.`,
    );
  } else if (!STATUSES.includes(status)) {
    problems.push(
      `\`status: ${status}\` is not a known status. Use one of: ${STATUSES.join(', ')}.`,
    );
  }

  const declared = relations(fm);

  const required = STATUS_REQUIRES[status];
  if (required && !declared[required]?.length) {
    problems.push(
      `\`status: ${status}\` names no successor. Add \`${required}: [NNNN]\`, or use \`deprecated\` if the decision was abandoned with nothing replacing it.`,
    );
  }

  const dir = dirname(filePath);
  let siblings = [];
  try {
    siblings = readdirSync(dir);
  } catch {
    process.exit(0); // cannot read the directory: nothing to verify against
  }

  for (const [field, targets] of Object.entries(declared)) {
    for (const target of targets) {
      if (target === selfNum) {
        problems.push(`\`${field}\` names this ADR itself (${selfNum}).`);
        continue;
      }
      const file = siblings.find((name) => name.startsWith(`${target}-`) && name.endsWith('.md'));
      if (!file) continue; // other half of the pair not written yet

      let targetFm;
      try {
        targetFm = frontmatter(readFileSync(`${dir}/${file}`, 'utf8'));
      } catch {
        continue;
      }
      const back = RECIPROCAL[field];
      if (!targetFm || !relations(targetFm)[back]?.includes(selfNum)) {
        problems.push(
          `\`${field}: [${target}]\` has no matching back-link. Add \`${back}: [${selfNum}]\` to \`${file}\` (and the amendment note saying which part changed) before writing this file.`,
        );
      }
    }
  }
}

if (!problems.length) process.exit(0);

console.error(
  `Blocked by guard-adr-links hook: ${basename(filePath)}\n` +
    problems.map((p) => `  - ${p}`).join('\n') +
    `\nSee domain-modeling/ADR-FORMAT.md for the status vocabulary and the relation fields.`,
);
process.exit(2);
