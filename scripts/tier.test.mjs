// Synthetic fixtures live here, never in devices/. The dataset only ever holds real, sourced facts.
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTier } from './tier.mjs';

const sourced = (value) => ({ value, source: 'https://example.com/', verified_on: '2026-01-01', confidence: 'editor_tested' });
const unknown = { value: 'unknown' };

const device = (criteria, flashing = { supported: false }) => ({
  criteria: {
    works_offline: unknown,
    no_account_required: unknown,
    local_api: unknown,
    cloud_blockable: unknown,
    local_firmware_updates: unknown,
    alternative_firmware: unknown,
    ha_local_integration: unknown,
    ...criteria,
  },
  flashing,
});

const core = { works_offline: sourced(true), local_api: sourced(true), cloud_blockable: sourced(true) };
const strict = { no_account_required: sourced(true), local_firmware_updates: sourced(true) };

test('fully-local requires the core three plus no account and local updates', () => {
  assert.equal(computeTier(device({ ...core, ...strict })), 'fully-local');
});

test('an account requirement drops it to local-cloud-optional', () => {
  assert.equal(
    computeTier(device({ ...core, ...strict, no_account_required: sourced(false) })),
    'local-cloud-optional',
  );
});

test('failing a core criterion but flashable gives local-after-flashing', () => {
  const flashing = {
    supported: true, firmwares: ['esphome'], method: 'serial', difficulty: 'medium',
    guide_url: 'https://example.com/', tier_after_flash: 'fully-local',
    source: 'https://example.com/', verified_on: '2026-01-01',
  };
  assert.equal(computeTier(device({ ...core, cloud_blockable: sourced(false) }, flashing)), 'local-after-flashing');
});

test('failing a core criterion with no escape hatch gives cloud-required', () => {
  assert.equal(computeTier(device({ ...core, works_offline: sourced(false) })), 'cloud-required');
});

test('an unknown core criterion is never laundered into a verdict', () => {
  assert.equal(computeTier(device({ ...core, ...strict, local_api: unknown })), 'unverified');
});

test('an unknown strict criterion blocks the top tier rather than downgrading silently', () => {
  assert.equal(computeTier(device({ ...core, no_account_required: sourced(true) })), 'unverified');
});

test('neither ha_local_integration nor a perfect record moves the verdict', () => {
  const withHa = computeTier(device({ ...core, ...strict, ha_local_integration: sourced(true) }));
  const withoutHa = computeTier(device({ ...core, ...strict, ha_local_integration: sourced(false) }));
  assert.equal(withHa, withoutHa);
});
