#!/usr/bin/env node
// Emits the whole dataset as one JSON file, with the verdict already computed.
//
// The YAML in this repo is the source of truth and is written for people. This is the machine
// copy: one file to fetch, no YAML parser needed, and - the part that matters - `tier` resolved,
// so a consumer does not have to reimplement the decision table and drift from ours.
//
// Not committed. Generated in CI and published by the site, because a generated file in a repo
// that takes pull requests conflicts on every single one.

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { computeTier } from './tier.mjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const OUT = join(ROOT, 'dist', 'dataset.json');

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

const load = (f) => parse(readFileSync(join(ROOT, f), 'utf8'));
const byId = (a, b) => a.id.localeCompare(b.id);

const brands = yamlFiles('brands').map(load).sort(byId);

// The verdict is resolved here, once, from the same function CI validates against.
const devices = yamlFiles('devices')
  .map(load)
  .map((d) => ({ ...d, tier: computeTier(d) }))
  .sort(byId);

const tiers = {};
for (const d of devices) tiers[d.tier] = (tiers[d.tier] ?? 0) + 1;

const dataset = {
  generated_at: new Date().toISOString(),
  source: 'https://github.com/benln/lookmomnocloud-data',
  // ODbL travels with the data: anyone redistributing this file needs to know the terms.
  license: {
    data: 'ODbL-1.0',
    url: 'https://opendatacommons.org/licenses/odbl/1-0/',
    attribution: 'lookmomnocloud.com',
  },
  counts: { devices: devices.length, brands: brands.length, tiers },
  brands,
  devices,
};

mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`${OUT}\n  ${devices.length} device(s), ${brands.length} brand(s)`);
