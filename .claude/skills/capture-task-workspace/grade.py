#!/usr/bin/env python3
"""Grade capture-task eval runs. Writes grading.json into each run dir.

Usage: python3 grade.py <iteration_dir>
"""
import hashlib
import json
import re
import sys
from pathlib import Path

FIXTURES = ["src/middleware/auth.ts", "src/app/reports/page.tsx", "scripts/seed.ts", "README.md"]

KEY_FACTS = {
    0: {
        "verbatim error text preserved": [r"Cannot read properties of undefined \(reading 'orgId'\)"],
        "symptom, file, and condition captured": [r"src/middleware/auth\.ts", r"/dashboard", r"/login", r"org"],
    },
    1: {
        "customer demand and reports page captured": [r"(?i)customer", r"(?i)reports"],
    },
    2: {
        "password, runtime, and file captured": [r"(?i)password", r"(?i)(5 min|five min|~5|5-min)", r"scripts/seed\.ts"],
    },
}

TYPES = {0: "bug", 1: "feature", 2: "chore"}


def fixture_hashes(root: Path) -> dict:
    return {
        f: hashlib.sha256((root / f).read_bytes()).hexdigest()
        for f in FIXTURES
        if (root / f).exists()
    }


def grade_run(eval_id: int, run_dir: Path, baseline_hashes: dict) -> dict:
    outputs = run_dir / "outputs"
    ttype = TYPES[eval_id]
    expectations = []

    def check(text: str, passed: bool, evidence: str) -> None:
        expectations.append({"text": text, "passed": passed, "evidence": evidence})

    tasks_dir = outputs / "docs" / "tasks"
    task_files = sorted(tasks_dir.glob("*.md")) if tasks_dir.exists() else []
    pattern = re.compile(rf"^2026-07-10-{ttype}-[a-z0-9]+(-[a-z0-9]+)*\.md$")
    named_ok = len(task_files) == 1 and pattern.match(task_files[0].name)
    check(
        f"Exactly one task file in docs/tasks/ named 2026-07-10-{ttype}-<slug>.md",
        bool(named_ok),
        f"found: {[f.name for f in task_files] if task_files else 'no docs/tasks/*.md'}",
    )

    body = task_files[0].read_text() if len(task_files) == 1 else ""
    # tolerate any single task file for content checks even if misnamed
    if not body:
        all_md = [p for p in outputs.rglob("*.md") if p.name != "README.md"]
        if len(all_md) == 1:
            body = all_md[0].read_text()

    fm = re.match(r"^---\n(.*?)\n---", body, re.S)
    fm_text = fm.group(1) if fm else ""
    fm_ok = (
        re.search(rf"^type:\s*{ttype}\s*$", fm_text, re.M)
        and re.search(r"^status:\s*captured\s*$", fm_text, re.M)
        and re.search(r"^created:\s*['\"]?2026-07-10['\"]?\s*$", fm_text, re.M)
    )
    check(
        f"Frontmatter has type: {ttype}, status: captured, created: 2026-07-10",
        bool(fm_ok),
        fm_text.strip()[:200] if fm_text else "no frontmatter found",
    )

    required = ["Context", "Problem", "Scope", "Requirements", "Acceptance criteria", "Dependencies", r"Risks\s*/\s*open questions"]
    labels = ["Context", "Problem", "Scope", "Requirements", "Acceptance criteria", "Dependencies", "Risks / open questions"]
    present = [lab for lab, pat in zip(labels, required) if re.search(rf"^##\s*{pat}\s*$", body, re.M | re.I)]
    check(
        "File has all seven template sections (Context, Problem, Scope, Requirements, Acceptance criteria, Dependencies, Risks / open questions)",
        len(present) == 7,
        f"present: {present}",
    )

    check(
        "No leftover template guidance comments (<!-- -->) in the captured file",
        "<!--" not in body,
        "clean" if "<!--" not in body else "guidance comments remain in file",
    )

    for name, patterns in KEY_FACTS[eval_id].items():
        missing = [p for p in patterns if not re.search(p, body)]
        check(
            f"Context fidelity: {name}",
            not missing,
            "all facts present" if not missing else f"missing patterns: {missing}",
        )

    risks = re.search(r"^##\s*Risks.*?(?=^##\s|\Z)", body, re.S | re.M | re.I)
    risk_boxes = re.findall(r"^- \[ \]", risks.group(0), re.M) if risks else []
    check(
        "Risks / open questions: 2-5 items using - [ ] checkboxes",
        2 <= len(risk_boxes) <= 5,
        f"checkbox count in risks section: {len(risk_boxes)}" if risks else "no risks section found",
    )

    current = fixture_hashes(outputs)
    untouched = current == baseline_hashes
    extra = [
        str(p.relative_to(outputs))
        for p in outputs.rglob("*")
        if p.is_file()
        and str(p.relative_to(outputs)) not in FIXTURES
        and not str(p.relative_to(outputs)).startswith("docs/tasks/")
    ]
    check(
        "No fix/implementation attempted: fixtures unmodified, no extra files outside docs/tasks/",
        untouched and not extra,
        f"fixtures unmodified: {untouched}; extra files: {extra or 'none'}",
    )

    passed = sum(1 for e in expectations if e["passed"])
    total = len(expectations)
    return {
        "summary": {
            "pass_rate": round(passed / total, 4),
            "passed": passed,
            "failed": total - passed,
            "total": total,
        },
        "expectations": expectations,
    }


def main() -> None:
    iteration = Path(sys.argv[1])
    # baseline hashes from a pristine fixture set: recompute from known content is overkill;
    # use with_skill eval-0's hashes ONLY if pristine copy missing. Prefer stored pristine hashes.
    pristine = json.loads((iteration.parent / "fixture_hashes.json").read_text())
    for eval_dir in sorted(iteration.glob("eval-*")):
        eval_id = int(eval_dir.name.split("-")[1])
        for cfg in ["with_skill", "without_skill"]:
            run_dir = eval_dir / cfg / "run-1"
            if not (run_dir / "outputs").exists():
                continue
            result = grade_run(eval_id, run_dir, pristine)
            (run_dir / "grading.json").write_text(json.dumps(result, indent=2))
            s = result["summary"]
            print(f"{eval_dir.name}/{cfg}: {s['passed']}/{s['total']}")


if __name__ == "__main__":
    main()
