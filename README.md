# professor-skills Registry

Static GitHub-hosted registry of **courses** and **skills** for the [course-professor](https://github.com/professor-skills-hub/courses-skills-registry) CLI. No server required — the CLI reads directly from GitHub raw URLs.

- **Courses** — Syllabus templates for learning a topic (community-contributed). Anyone can contribute.
- **Skills** — Claude Code skills built by learners after completing a course and capstone (earned gate). See [CONTRIBUTING.md](CONTRIBUTING.md).

## Installing a course

```bash
npx course-professor courses                  # browse all courses
npx course-professor search <keyword>         # search by keyword
npx course-professor install <course-name>    # install to learning/{name}/ in your repo
```

Example:

```bash
npx course-professor install react-hooks
```

Downloads `COURSE.md` and `meta.json` to `learning/react-hooks/` in your current repo. Then run `professor:new-topic` in Claude Code — Professor detects the course automatically.

## Installing a skill

```bash
npx course-professor install --skill <name>           # prompts local or global scope
npx course-professor install --skill <name> --local   # .claude/skills/ (this project)
npx course-professor install --skill <name> --global  # ~/.claude/skills/ (all projects)
```

## Browsing

See [index.json](index.json) for the full list. Courses live under [courses/](courses/), skills under [skills/](skills/).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute a **course** (open to all) or publish a **skill** (earned after completing a course + capstone).

## Local development

- `npm run validate` — validate all courses and skills (same as CI on PRs).
- `npm run build-index` — rebuild `index.json` from `courses/*` and `skills/*`.
