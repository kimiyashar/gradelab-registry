import { readFileSync } from 'node:fs';

const forbidden = new Set(['score','scores','grade','grades','submission','submissions','student','studentid','canvasuserid','andrewid','email','cookie','cookies','token','password','session','officialoverall','assignments','coursepreferences','gradeoverrides']);
const fail = (message) => { throw new Error(message); };
const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const normalized = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
function rejectPrivate(value, path = 'definition') {
  if (Array.isArray(value)) return value.forEach((item, index) => rejectPrivate(item, `${path}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (forbidden.has(normalized(key))) fail(`${path}.${key} is forbidden private data`);
    rejectPrivate(item, `${path}.${key}`);
  }
}
const index = readJson('registry.json');
if (index.schemaVersion !== 1 || !Number.isInteger(index.revision) || index.revision < 1) fail('Invalid registry index');
for (const [key, entry] of Object.entries(index.courses || {})) {
  if (!/^courses\/[a-z0-9/_-]+\.json$/.test(entry.path) || entry.path.includes('..')) fail(`Unsafe path for ${key}`);
  const definition = readJson(entry.path);
  rejectPrivate(definition);
  if (definition.schemaVersion !== 1 || definition.status !== 'published') fail(`Invalid published definition for ${key}`);
  if (definition.courseKey !== key || definition.revision !== entry.revision) fail(`Index mismatch for ${key}`);
  if (!['weighted', 'points', 'unverified'].includes(definition.gradingModel)) fail(`Invalid grading model for ${key}`);
  if (!Array.isArray(definition.categories) || !definition.categories.length) fail(`Missing categories for ${key}`);
  const names = new Set();
  for (const category of definition.categories) {
    const name = normalized(category.name || '');
    if (!name || names.has(name) || !Number.isFinite(category.weight) || category.weight < 0) fail(`Invalid category for ${key}`);
    names.add(name);
  }
  if (!Array.isArray(definition.sources) || !definition.sources.length || definition.sources.some((source) => !String(source.url || '').startsWith('https://'))) fail(`Invalid official source for ${key}`);
}
console.log(`Validated ${Object.keys(index.courses).length} published GradeLab course definitions at registry revision ${index.revision}.`);
