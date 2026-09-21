#!/usr/bin/env node
// Gatekeeper for the dataset. Runs in CI on every push and pull request.
// A contributor should be able to see exactly why their entry was rejected, without cloning the site.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import { computeTier } from './tier.mjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const STALE_AFTER_MONTHS = 18;

const errors = [];
const warnings = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const ajv = addFormats(new Ajv({ allErrors: true, strict: false }));
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const validateDevice = ajv.compile(readJson('schema/device.schema.json'));
const validateBrand = ajv.compile(readJson('schema/brand.schema.json'));

function yamlFiles(dir) {
  const abs = join(ROOT, dir);
  let entries;
  try {
    entries = readdirSync(abs);
  } catch {
    return [];
  }
  return entries.flatMap((e) => {
    const p = join(abs, e);
    if (statSync(p).isDirectory()) return yamlFiles(join(dir, e));
    return extname(e) === '.yaml' ? [join(dir, e)] : [];
  });
}

function load(file) {
  try {
    return parse(readFileSync(join(ROOT, file), 'utf8'));
  } catch (e) {
    fail(file, `not valid YAML - ${e.message}`);
    return null;
  }
}

function report(file, validator) {
  for (const e of validator.errors ?? []) {
    fail(file, `${e.instancePath || '/'} ${e.message}`);
  }
}

const monthsSince = (iso) => {
  const then = new Date(iso);
  return (Date.now() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
};

// --- brands ---------------------------------------------------------------
const brands = new Map();
for (const file of yamlFiles('brands')) {
  const doc = load(file);
  if (!doc) continue;
  if (!validateBrand(doc)) report(file, validateBrand);
  const expected = basename(file, '.yaml');
  if (doc.id !== expected) fail(file, `id "${doc.id}" does not match filename "${expected}"`);
  for (const incident of doc.local_control_revoked_history?.incidents ?? []) {
    if (new Date(incident.date) > new Date()) fail(file, `incident dated in the future: ${incident.date}`);
  }
  brands.set(doc.id, doc);
}

// --- devices --------------------------------------------------------------
const tally = {};
let deviceCount = 0;

for (const file of yamlFiles('devices')) {
  const doc = load(file);
  if (!doc) continue;
  deviceCount++;
  if (!validateDevice(doc)) report(file, validateDevice);

  const expected = basename(file, '.yaml');
  if (doc.id !== expected) fail(file, `id "${doc.id}" does not match filename "${expected}"`);

  const dir = basename(join(file, '..'));
  if (doc.category && doc.category !== dir) {
    fail(file, `category "${doc.category}" does not match its directory "${dir}"`);
  }

  if (doc.brand && !brands.has(doc.brand)) {
    fail(file, `unknown brand "${doc.brand}" - add brands/${doc.brand}.yaml`);
  }

  for (const [key, c] of Object.entries(doc.criteria ?? {})) {
    if (!c?.verified_on) continue;
    if (new Date(c.verified_on) > new Date()) {
      fail(file, `${key}.verified_on is in the future`);
    } else if (monthsSince(c.verified_on) > STALE_AFTER_MONTHS) {
      warn(file, `${key} was last verified ${Math.round(monthsSince(c.verified_on))} months ago - shows as "needs re-checking"`);
    }
  }

  const tier = computeTier(doc);
  tally[tier] = (tally[tier] ?? 0) + 1;
}

// --- output ---------------------------------------------------------------
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);

console.log(
  `\n${deviceCount} device(s), ${brands.size} brand(s)` +
    (deviceCount ? `\n${Object.entries(tally).map(([t, n]) => `  ${t}: ${n}`).join('\n')}` : '')
);

if (errors.length) {
  console.error(`\n${errors.length} error(s). Nothing was published.`);
  process.exit(1);
}
console.log(`\nOK${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
