# Contributing

You do not need to run the website to fix the data. This repository is YAML and a validator.

## Fixing or adding a device

1. Copy an existing file in `devices/<category>/` and edit it. The filename must match the `id`.
2. Run `npm install && npm run validate`. The same check runs on your pull request.
3. Open the pull request.

## The one rule

**Every asserted value needs a source.** `true` and `false` both need a URL, a verification date
and a confidence level. This is enforced by CI, so there is no point arguing with it.

`unknown` is always an acceptable answer and needs no source. An honest gap is worth more here
than a confident guess — the whole site is worth exactly as much as its worst entry.

Confidence levels, from weakest to strongest:

| Level | Meaning |
|---|---|
| `vendor_documented` | The manufacturer or an upstream project states it in writing |
| `community_verified` | Someone reported testing it, with a link to the report |
| `editor_tested` | We ran the test ourselves |

## Things that get a pull request closed

- A value changed without its `source` and `verified_on` being updated to match.
- A criterion describing the device **after** flashing. Criteria always describe the device as
  sold; the `flashing` block is where modification goes.
- Prices. They are never stored here — only stable merchant identifiers in `offers`.
- Content copied from `products.z-wavealliance.org` or `csa-iot.org`. Their terms of use forbid
  it, and permissively licensed equivalents exist.
- Rewritten flashing instructions where a canonical guide already exists. Link to Tasmota,
  ESPHome, Valetudo or OpenIPC instead; we only write a guide when there isn't a good one.

## Reporting that something changed

A vendor removing local control from hardware people already own is the single most valuable
thing you can report. Open an issue with a link to the announcement, changelog or news coverage.
It goes on the brand's record in `brands/`.
