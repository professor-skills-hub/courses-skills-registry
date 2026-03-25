# Contributing to the professor-skills Registry

This registry has **two distinct contribution tracks**: **courses** (open to everyone) and **skills** (earned after completing a course and capstone).

---

## Track 1: Contribute a COURSE (open — anyone)

A **course** is a syllabus template for learning a topic. Professor uses it to guide learners. No gate — open PR.

### What you need

1. **Fork** [professor-skills-hub/courses-skills-registry](https://github.com/professor-skills-hub/courses-skills-registry).
2. **Create** a directory under `courses/` with a slug name (e.g. `courses/my-topic/`).
3. **Add** these two files (no SKILL.md in courses):

   - **meta.json** — Required: `name`, `title`, `description`, `author`, `level`. Optional: `topics` (array), `version`, `created`, `updated`, `license`.  
     `name` must match the folder name.

   - **COURSE.md** — Syllabus template. Each section must be a line with ⬜ and a number (e.g. `⬜ 1. Section Title`). At least 3 sections required.

4. **Open a PR** against `main`. The **Validate skill** workflow runs and will fail if:
   - meta.json is missing or missing required fields,
   - COURSE.md is missing or has fewer than 3 sections,
   - `name` in meta.json does not match the folder name,
   - or there are duplicate course names.

5. **Merge** — The **Update index** workflow rebuilds `index.json`; courses are listed under `courses[]`.

### Raw URLs for courses

```
https://raw.githubusercontent.com/professor-skills-hub/courses-skills-registry/main/courses/<name>/<file>
```

---

## Track 2: Publish a SKILL (earned)

A **skill** is a Claude Code skill built by a learner **after** completing a course and a capstone. It solves a real problem (e.g. a "react-hooks-reviewer" skill after the "react-hooks" course). **Earned gate** — only learners who completed a course + capstone can publish.

### What you need

1. **Earn the right** — Complete a course and its capstone using the Professor plugin. When `professor:capstone-review` passes, Professor writes a `COMPLETION.md` to your `learning/{slug}/` directory recording the course, date, and capstone summary. You'll need this as evidence.

2. **Create** a directory under `skills/` with a slug name (e.g. `skills/react-hooks-reviewer/`).

3. **Add** these two files:

   - **meta.json** — Required: `name`, `title`, `description`, `author`, `origin_course` (must match the course you completed). Optional: `topics`, `version`, `created`, `updated`, `license`.
     `name` must match the folder name.

   - **SKILL.md** — Standard Claude Code skill format:
     - Must start with a **frontmatter** block (`---` ... `---`) containing at least:
       - `name` — skill identifier (should match folder/meta).
       - `description` — when the skill should trigger.
     - Followed by the skill content (a problem-solving tool, not a teaching guide).

4. **Open a PR.** Include a link to your `COMPLETION.md` (or paste its contents) in the PR description. A bot will post a reviewer checklist automatically. Validation CI checks that `origin_course` matches a real course in `courses/`.

### Raw URLs for skills

```
https://raw.githubusercontent.com/professor-skills-hub/courses-skills-registry/main/skills/<name>/<file>
```

---

## Running validation locally

```bash
npm run validate
```

Fix any reported issues before pushing your PR.
