Repo: github.com/professor-skills/registry  
 Purpose: Static GitHub-hosted registry of community SKILLs. No server required — the CLI reads
directly from GitHub raw URLs.

---

Overview

professor-skills/registry/
├── index.json ← CLI reads this to discover skills
├── README.md ← How to install and contribute
├── CONTRIBUTING.md ← How to submit a skill
├── .github/
│ └── workflows/
│ ├── validate-skill.yml ← Runs on every PR
│ └── update-index.yml ← Runs on merge to main
└── skills/
├── react-hooks/
│ ├── SKILL.md
│ ├── COURSE.md
│ └── meta.json
├── python-basics/
│ ├── SKILL.md
│ ├── COURSE.md
│ └── meta.json
└── ...

---

index.json Schema

{
"version": "1.0",
"updated": "2026-03-15T00:00:00Z",
"skills": [
{
"name": "react-hooks",
"title": "React Hooks",
"description": "Master useState, useEffect, useContext and custom hooks",
"author": "tuankhuat",
"github": "https://github.com/professor-skills/registry/tree/main/skills/react-hooks",
"topics": ["react", "javascript", "frontend"],
"level": "Intermediate",
"sections": 8,
"created": "2026-03-15",
"updated": "2026-03-15"
}
]
}

---

meta.json per Skill

{
"name": "react-hooks",
"title": "React Hooks",
"description": "Master useState, useEffect, useContext and custom hooks",
"author": "tuankhuat",
"topics": ["react", "javascript", "frontend"],
"level": "Intermediate",
"version": "1.0.0",
"professor_plugin_version": ">=1.0.0",
"created": "2026-03-15",
"license": "MIT"
}

---

SKILL.md Format (per skill)

Each skill follows the existing professor plugin format. The CLI installs this into
~/.claude/plugins/professor/skills/{name}/.

skills/react-hooks/
├── SKILL.md ← Agent behavior spec for this topic (optional override)
├── COURSE.md ← Syllabus template — sections pre-defined, status all ⬜
└── meta.json ← Metadata for index

COURSE.md is a template — when installed, it gets copied to the user's learning/{slug}/COURSE.md on
professor:new-topic if the skill name matches.

---

GitHub Actions

validate-skill.yml — runs on every PR

on: [pull_request]
jobs:
validate:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - name: Validate skill structure
run: node scripts/validate.js

scripts/validate.js checks:

- meta.json exists and has required fields (name, title, description, author, level)
- COURSE.md exists and has at least 3 sections (⬜ Section)
- name in meta.json matches the folder name
- No duplicate names in index.json

update-index.yml — runs on merge to main

on:
push:
branches: [main]
jobs:
update-index:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - name: Rebuild index.json
run: node scripts/build-index.js - name: Commit updated index
run: |
git config user.name "github-actions"
git config user.email "actions@github.com"
git add index.json
git diff --staged --quiet || git commit -m "chore: rebuild index.json"
git push

scripts/build-index.js: reads every skills/\*/meta.json, counts sections in COURSE.md, writes
index.json.

---

How npx course-professor install Works (CLI side — this repo)

User runs: npx course-professor install react-hooks

1. Fetch index.json from:
   https://raw.githubusercontent.com/professor-skills/registry/main/index.json

2. Find skill by name → get github URL

3. Download files:
   SKILL.md → ~/.claude/plugins/professor/skills/react-hooks/SKILL.md
   COURSE.md → ~/.claude/plugins/professor/skills/react-hooks/COURSE.md
   meta.json → ~/.claude/plugins/professor/skills/react-hooks/meta.json

4. Print: ✅ Installed react-hooks (8 sections, Intermediate)
   Run professor:new-topic to start learning.

Raw file URLs pattern:
https://raw.githubusercontent.com/professor-skills/registry/main/skills/{name}/{file}

---

Contribution Flow (Community)

1. Fork professor-skills/registry
2. Create skills/my-skill/ with SKILL.md + COURSE.md + meta.json
3. Open PR → validate-skill.yml runs automatically
4. PR merged → update-index.yml rebuilds index.json
5. npx course-professor install my-skill works immediately

---

Seed Skills (you create these first)

┌──────────────────┬──────────────┬──────────┐
│ Skill │ Level │ Sections │
├──────────────────┼──────────────┼──────────┤
│ react-hooks │ Intermediate │ 8 │
├──────────────────┼──────────────┼──────────┤
│ python-basics │ Beginner │ 6 │
├──────────────────┼──────────────┼──────────┤
│ sql-fundamentals │ Beginner │ 7 │
├──────────────────┼──────────────┼──────────┤
│ git-workflow │ Beginner │ 5 │
└──────────────────┴──────────────┴──────────┘

Start with 1-2 real ones you've already learned yourself — they serve as the format reference for
contributors.

---

What This Repo Does NOT Need

- No server, no API, no database
- No authentication
- No Vercel/Railway/Fly.io
- No npm package — it's just a GitHub repo with JSON + Markdown

The CLI (npx course-professor install) does all the heavy lifting on the user's machine.
