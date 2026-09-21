// Single source of truth for the verdict. Mirrored in human-readable form in schema/tiers.md.
// Keep the two in sync - the published decision table is what makes the verdict contestable.

export const TIERS = ['fully-local', 'local-cloud-optional', 'local-after-flashing', 'cloud-required', 'unverified'];

// The three criteria that decide whether a device is usable without the vendor.
const CORE = ['works_offline', 'local_api', 'cloud_blockable'];
// Additional criteria required to reach the top tier.
const STRICT = ['no_account_required', 'local_firmware_updates'];

const isTrue = (c) => c?.value === true;
const isUnknown = (c) => c?.value === 'unknown' || c === undefined;

export function computeTier(device) {
  const c = device.criteria ?? {};

  // Honesty first: we never award or deny a tier on missing data.
  if (CORE.some((k) => isUnknown(c[k]))) return 'unverified';

  const core = CORE.every((k) => isTrue(c[k]));

  if (core) {
    if (STRICT.some((k) => isUnknown(c[k]))) return 'unverified';
    return STRICT.every((k) => isTrue(c[k])) ? 'fully-local' : 'local-cloud-optional';
  }

  if (device.flashing?.supported === true) return 'local-after-flashing';
  if (device.flashing?.supported === 'unknown') return 'unverified';
  return 'cloud-required';
}

// `ha_local_integration` and the brand-level `local_control_revoked_history` deliberately do NOT
// move the tier. They are corroborating signals shown next to it, not properties of the device's
// own cloud dependence. Documented in schema/tiers.md.
