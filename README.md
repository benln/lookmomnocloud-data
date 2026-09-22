# lookmomnocloud — data

The open dataset behind [lookmomnocloud.com](https://lookmomnocloud.com): smart home devices,
checked one by one on whether they phone home, and whether they can be made to stop.

## Layout

```
devices/<category>/<brand>-<model>.yaml   one device, as shipped
brands/<brand>.yaml                       vendor trust record
schema/device.schema.json                 the contract, enforced in CI
schema/brand.schema.json
schema/tiers.md                           how the verdict is computed. Read this first
scripts/validate.mjs                      npm run validate
```

## How devices are assessed

Seven criteria describe the device as sold, one describes the vendor's past conduct, and a
published decision table turns them into one of five named verdicts: `fully-local`,
`local-cloud-optional`, `local-after-flashing`, `cloud-required` or `unverified`.

The table is in [`schema/tiers.md`](schema/tiers.md). It is published so you can check the
arithmetic, or argue that the table itself is wrong.

Every asserted value carries a source URL, a verification date and a confidence level. `unknown`
is a first-class answer. Entries not re-checked in 18 months are flagged on the site as needing
review.

## The Home Assistant block

The verdict says whether the device needs its vendor. The `ha` block answers a second question:
*I already own this. Can I get it into Home Assistant, how, and does that get me off the vendor's
cloud?*

| Key | The question it answers |
|---|---|
| `route` | How it gets in: `core`, `hacs`, `generic-protocol` (ONVIF, RTSP, MQTT, Matter), `after-flash`, `none` |
| `cloud_needed` | What the integration itself needs: `never`, `setup-only` (one vendor login, then local), `always` |
| `guide_url` | A link to the existing how-to. Guides are linked, never copied |

`cloud_needed` carries a distinction the `local` badge does not show. Home Assistant's Roomba
integration is `local_push`, and you still fetch the robot's password through iRobot's cloud once:
that is `setup-only`. Roborock's is `local_polling` too, and needs the cloud for every map: that
is `always`. Like every asserted value it carries a source and a date, and it never moves the
tier.

## Machine-readable export

`npm run build` writes `dist/dataset.json`: every device and brand in one file, with `tier`
already resolved, so you don't have to reimplement the decision table. It is generated on every
CI run and never committed. The site publishes it.

## Licence

Data under [ODbL 1.0](LICENSE.md), scripts under MIT. Use it, including commercially. Credit
lookmomnocloud.com and keep it open.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Corrections are more welcome than additions.
