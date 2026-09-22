# Contributing

You do not need to run the website to fix the data. This repository is YAML and a validator.

## Fixing or adding a device

1. Copy an existing file in `devices/<category>/` and edit it. The filename must match the `id`.
2. Run `npm install && npm run validate`. The same check runs on your pull request.
3. Open the pull request.

Every entry carries a `# yaml-language-server:` line at the top. Any editor with the YAML
Language Server (VS Code, Zed, Neovim, JetBrains) picks it up and gives you key completion,
enum completion and errors underlined as you type — so you find out about a typo before CI does.

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

The same rule applies to the `ha` block: `cloud_needed` is an asserted value and needs a `source`
and a `verified_on`. If you don't know whether the integration phones home, leave it `unknown`.

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

## Licensing your contribution

By opening a pull request, or an issue containing data, you agree that your contribution is
published under the same terms as the rest of this repository: **ODbL 1.0** for anything under
`devices/`, `brands/` and `schema/`, and **MIT** for anything under `scripts/`.

You keep whatever rights you hold in what you wrote. You are granting the same terms everyone
else here already grants — nothing more, and no transfer of ownership.

Two things that follow from this, and that we will ask about:

- **Don't contribute data you are not free to relicense.** In particular, nothing copied from
  `products.z-wavealliance.org` or `csa-iot.org`: their terms of use forbid it, and permissively
  licensed equivalents exist for the same facts. Individual facts with a link to where you found
  them are always fine — a copied table is not.
- **Images need a licence we can accept**: your own photo, or something already under MIT, CC-BY
  or CC-BY-SA. Tag it in the entry's `images` block. A product shot lifted from a shop listing
  is not something we can republish.
