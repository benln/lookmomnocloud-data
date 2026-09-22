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

## The Home Assistant block

The verdict says whether the device needs its vendor. The `ha` block answers the other question
people actually have: *I already own this - can I get it into Home Assistant, how, and does that
get me off the vendor's cloud?*

| Key | The question it answers |
|---|---|
| `route` | How it gets in: `core`, `hacs`, `generic-protocol` (ONVIF, RTSP, MQTT, Matter), `after-flash`, `none` |
| `cloud_needed` | What the integration itself needs: `never`, `setup-only` (one vendor login, then local), `always` |
| `guide_url` | Where the how-to lives. We point, we don't rewrite |

`cloud_needed` is the one to read twice. Home Assistant's Roomba integration is `local_push`, and
you still fetch the robot's password through iRobot's cloud once. That is `setup-only`, and it is
the nuance a `local` badge hides. Roborock's is `local_polling` too, and needs the cloud for every
map: `always`. Like every asserted value it carries a source and a date, and it never moves
the tier.

## Machine-readable export

`npm run build` writes `dist/dataset.json` — every device and brand in one file, with `tier`
already resolved so you don't have to reimplement the decision table. It is generated, not
committed: CI attaches it to every run, and the site publishes it.

## Licence

Data under [ODbL 1.0](LICENSE.md), scripts under MIT. Use it, including commercially — just
credit us and keep it open.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Corrections are more welcome than additions.
