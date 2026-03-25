#!/usr/bin/env node
/**
 * Rebuilds index.json from courses/* and skills/* meta plus COURSE.md section counts.
 * Run on push to main. Does not perform git operations.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const COURSES_DIR = path.join(REPO_ROOT, 'courses');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const INDEX_PATH = path.join(REPO_ROOT, 'index.json');

// Match section lines like "⬜ 1. Title" (excludes legend "Status: ⬜ = not started")
const SECTION_PATTERN = /⬜\s+\d+\./;
const GITHUB_COURSES_BASE = 'https://github.com/professor-skills/registry/tree/main/courses';
const GITHUB_SKILLS_BASE = 'https://github.com/professor-skills/registry/tree/main/skills';

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

// --- Build courses[] ---
const courses = [];

for (const { name: dirName, path: coursePath } of getSubdirs(COURSES_DIR)) {
  const metaPath = path.join(coursePath, 'meta.json');
  const coursePathMd = path.join(coursePath, 'COURSE.md');

  if (!fs.existsSync(metaPath)) continue;

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    continue;
  }

  let sections = 0;
  if (fs.existsSync(coursePathMd)) {
    sections = countSectionsInCourse(coursePathMd);
  }

  const created = meta.created || null;
  const updated = meta.updated || meta.created || null;

  courses.push({
    name: meta.name,
    title: meta.title,
    description: meta.description,
    author: meta.author,
    github: `${GITHUB_COURSES_BASE}/${meta.name}`,
    topics: Array.isArray(meta.topics) ? meta.topics : [],
    level: meta.level,
    sections,
    created,
    updated,
  });
}

courses.sort((a, b) => a.name.localeCompare(b.name));

// --- Build skills[] ---
const skills = [];

for (const { name: dirName, path: skillPath } of getSubdirs(SKILLS_DIR)) {
  const metaPath = path.join(skillPath, 'meta.json');

  if (!fs.existsSync(metaPath)) continue;

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    continue;
  }

  const created = meta.created || null;
  const updated = meta.updated || meta.created || null;

  skills.push({
    name: meta.name,
    title: meta.title,
    description: meta.description,
    author: meta.author,
    origin_course: meta.origin_course,
    github: `${GITHUB_SKILLS_BASE}/${meta.name}`,
    topics: Array.isArray(meta.topics) ? meta.topics : [],
    version: meta.version || null,
    created,
    updated,
  });
}

skills.sort((a, b) => a.name.localeCompare(b.name));

// --- Write index.json ---
const index = {
  version: '1.0',
  updated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  courses,
  skills,
};

fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(`Wrote index.json with ${courses.length} course(s) and ${skills.length} skill(s).`);
