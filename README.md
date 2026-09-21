# lookmomnocloud — data

The open dataset behind [lookmomnocloud.com](https://lookmomnocloud.com): smart home devices
assessed on whether they still work when the manufacturer's servers go away.

Plenty of places will tell you whether a device talks to Home Assistant. This one answers a
different question:

> If the internet drops, or the vendor shuts its servers down tomorrow, what exactly keeps working?

Those are not the same question. A Chromecast has a "local connection" to Home Assistant and is
useless without Google.

## Layout

```
devices/<category>/<brand>-<model>.yaml   one device, as shipped
brands/<brand>.yaml                       vendor trust record
schema/device.schema.json                 the contract, enforced in CI
schema/brand.schema.json
schema/tiers.md                           how the verdict is computed - read this first
scripts/validate.mjs                      npm run validate
```

## How devices are assessed

Seven criteria describe the device **as sold**, one describes the vendor's past conduct, and a
published decision table turns them into a named tier — `fully-local`, `local-cloud-optional`,
`local-after-flashing`, `cloud-required` or `unverified`. There is no score out of 100, because
eight booleans cannot honestly produce one.

The table is in [`schema/tiers.md`](schema/tiers.md). It is published so you can check our
arithmetic, or tell us the table itself is wrong.

Every asserted value carries a source URL, a verification date and a confidence level. `unknown`
is a first-class answer. Entries not re-checked in 18 months are flagged as needing review on the
site rather than quietly presented as current.

## Licence

Data under [ODbL 1.0](LICENSE.md), scripts under MIT. Use it, including commercially — just
credit us and keep it open.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Corrections are more welcome than additions.
