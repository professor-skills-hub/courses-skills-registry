# professor-skills Registry

Static GitHub-hosted registry of **courses** and **skills** for the [course-professor](https://github.com/professor-skills/course-professor) CLI. No server required — the CLI reads directly from GitHub raw URLs.

- **Courses** — Syllabus templates for learning a topic (community-contributed). Install a course to learn with professor.
- **Skills** — Claude Code skills built by learners after completing a course (earned). See [CONTRIBUTING.md](CONTRIBUTING.md) for the two-track model.

## Installing a course

```bash
npx course-professor install <course-name>
```

Example:

```bash
npx course-professor install react-hooks
```

The CLI fetches `index.json` from this repo to discover courses, then downloads `COURSE.md` and `meta.json` into your local professor plugin. Run `professor:new-topic` to start learning.

## Browsing

See [index.json](index.json) for the full list: `courses[]` (name, title, description, level, section count) and `skills[]`. Courses live under [courses/](courses/), skills under [skills/](skills/).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute a **course** (open) or publish a **skill** (earned).

## Local development

- `npm run validate` — validate all courses and skills (same as CI on PRs).
- `npm run build-index` — rebuild `index.json` from `courses/*` and `skills/*`.
