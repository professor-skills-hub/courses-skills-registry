#!/usr/bin/env node
/**
 * Validates courses/ and skills/ structure for the professor-skills registry.
 * Run on every PR. Exits 1 on failure, 0 on success.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const COURSES_DIR = path.join(REPO_ROOT, 'courses');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const INDEX_PATH = path.join(REPO_ROOT, 'index.json');

const COURSE_REQUIRED_META = ['name', 'title', 'description', 'author', 'level'];
const SKILL_REQUIRED_META = ['name', 'title', 'description', 'author', 'origin_course'];
const MIN_SECTIONS = 3;
// Match section lines like "⬜ 1. Title" (excludes legend "Status: ⬜ = not started")
const SECTION_PATTERN = /⬜\s+\d+\./;
// SKILL.md frontmatter: --- ... --- with name and description
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;

function countSectionsInCourse(coursePath) {
  const content = fs.readFileSync(coursePath, 'utf8');
  const lines = content.split('\n');
  return lines.filter((line) => SECTION_PATTERN.test(line)).length;
}

function getSubdirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => ({ name: d.name, path: path.join(dir, d.name) }));
}

function parseFrontmatter(content) {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) return null;
  const block = match[1];
  const fields = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*(\w+):\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

const errors = [];

// --- Validate courses/ ---
const courseDirs = getSubdirs(COURSES_DIR);
const courseNamesSeen = new Set();

for (const { name: dirName, path: coursePath } of courseDirs) {
  const metaPath = path.join(coursePath, 'meta.json');
  const coursePathMd = path.join(coursePath, 'COURSE.md');

  if (!fs.existsSync(metaPath)) {
    errors.push(`courses/${dirName}: meta.json is missing`);
    continue;
  }

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (e) {
    errors.push(`courses/${dirName}/meta.json: invalid JSON (${e.message})`);
    continue;
  }

  for (const field of COURSE_REQUIRED_META) {
    if (meta[field] == null || String(meta[field]).trim() === '') {
      errors.push(`courses/${dirName}/meta.json: missing or empty required field "${field}"`);
    }
  }

  if (meta.name !== dirName) {
    errors.push(
      `courses/${dirName}/meta.json: "name" must match folder name (got "${meta.name}", expected "${dirName}")`
    );
  }

  if (courseNamesSeen.has(meta.name)) {
    errors.push(`courses/${dirName}: duplicate course name "${meta.name}"`);
  }
  courseNamesSeen.add(meta.name);

  if (!fs.existsSync(coursePathMd)) {
    errors.push(`courses/${dirName}: COURSE.md is missing`);
  } else {
    const sectionCount = countSectionsInCourse(coursePathMd);
    if (sectionCount < MIN_SECTIONS) {
      errors.push(
        `courses/${dirName}/COURSE.md: must have at least ${MIN_SECTIONS} sections (found ${sectionCount})`
      );
    }
  }
}

// --- Validate skills/ ---
const skillDirs = getSubdirs(SKILLS_DIR);
const skillNamesSeen = new Set();

for (const { name: dirName, path: skillPath } of skillDirs) {
  const metaPath = path.join(skillPath, 'meta.json');
  const skillMdPath = path.join(skillPath, 'SKILL.md');

  if (!fs.existsSync(metaPath)) {
    errors.push(`skills/${dirName}: meta.json is missing`);
    continue;
  }

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (e) {
    errors.push(`skills/${dirName}/meta.json: invalid JSON (${e.message})`);
    continue;
  }

  for (const field of SKILL_REQUIRED_META) {
    if (meta[field] == null || String(meta[field]).trim() === '') {
      errors.push(`skills/${dirName}/meta.json: missing or empty required field "${field}"`);
    }
  }

  if (meta.name !== dirName) {
    errors.push(
      `skills/${dirName}/meta.json: "name" must match folder name (got "${meta.name}", expected "${dirName}")`
    );
  }

  if (skillNamesSeen.has(meta.name)) {
    errors.push(`skills/${dirName}: duplicate skill name "${meta.name}"`);
  }
  skillNamesSeen.add(meta.name);

  if (!fs.existsSync(skillMdPath)) {
    errors.push(`skills/${dirName}: SKILL.md is missing`);
  } else {
    const content = fs.readFileSync(skillMdPath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm) {
      errors.push(`skills/${dirName}/SKILL.md: must have a frontmatter block (--- ... ---)`);
    } else {
      if (!fm.name || fm.name.trim() === '') {
        errors.push(`skills/${dirName}/SKILL.md: frontmatter must have "name" field`);
      }
      if (!fm.description || fm.description.trim() === '') {
        errors.push(`skills/${dirName}/SKILL.md: frontmatter must have "description" field`);
      }
    }
  }
}

// --- If index.json exists, check for duplicate names in index ---
if (fs.existsSync(INDEX_PATH)) {
  try {
    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    const courseNames = (index.courses || []).map((c) => c.name);
    const skillNames = (index.skills || []).map((s) => s.name);
    const dupCourses = courseNames.filter((name, i) => courseNames.indexOf(name) !== i);
    const dupSkills = skillNames.filter((name, i) => skillNames.indexOf(name) !== i);
    if (dupCourses.length > 0) {
      errors.push(`index.json: duplicate course name(s): ${[...new Set(dupCourses)].join(', ')}`);
    }
    if (dupSkills.length > 0) {
      errors.push(`index.json: duplicate skill name(s): ${[...new Set(dupSkills)].join(', ')}`);
    }
  } catch (e) {
    errors.push(`index.json: invalid JSON (${e.message})`);
  }
}

if (errors.length > 0) {
  console.error('Validation failed:\n');
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
}

console.log('Validation passed.');
process.exit(0);
