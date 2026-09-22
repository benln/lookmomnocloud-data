# How the verdict is computed

The verdict is a **named tier**, never a score out of 100. Eight booleans cannot produce a
meaningful number, and a number invites arguments about why something is a 73 and not a 76.

The tier is derived mechanically from the criteria by the table below. It is not a judgement call,
and it is published here so that anyone can check our arithmetic or tell us the table itself is
wrong. The eight criteria are always displayed underneath the verdict, each with its source and
verification date.

## The criteria

Seven are properties of the device, recorded **as shipped**:

| Key | The question it answers |
|---|---|
| `works_offline` | Does the main function survive with the WAN cut? |
| `no_account_required` | Can it be set up without creating a vendor account? |
| `local_api` | Is there a publicly documented local protocol (HTTP, MQTT, ONVIF, RTSP, Zigbee, Z-Wave, Matter, Modbus)? |
| `cloud_blockable` | Can it be firewalled off **permanently** without breaking? |
| `local_firmware_updates` | Can it be updated without the cloud, with no forced auto-update? |
| `alternative_firmware` | Can it run ESPHome / Tasmota / OpenBeken / Valetudo / OpenIPC? |
| `ha_local_integration` | Does Home Assistant talk to it `local_push` or `local_polling`? |

The eighth lives on the **brand**, because it is a property of the vendor:

| Key | The question it answers |
|---|---|
| `local_control_revoked_history` | Has this vendor ever removed local control from hardware people already owned? |

Each value is `true`, `false`, or `unknown`. `unknown` is a first-class answer — we would rather
show a gap than guess. Any asserted value, positive **or** negative, requires a source URL, a
verification date and a confidence level. This is enforced in CI, not by good intentions.

## The decision table

Let `CORE` = `works_offline` AND `local_api` AND `cloud_blockable`.
Let `STRICT` = `no_account_required` AND `local_firmware_updates`.

| Tier | Condition |
|---|---|
| `unverified` | Any criterion the table depends on is `unknown` |
| `fully-local` | `CORE` and `STRICT` |
| `local-cloud-optional` | `CORE`, but not `STRICT` |
| `local-after-flashing` | Not `CORE`, but `flashing.supported` is true |
| `cloud-required` | Not `CORE`, and not flashable |

## Two criteria that deliberately do not move the tier

`ha_local_integration` is inherited from Home Assistant's own `iot_class`. It describes how HA
talks to the device, not whether the device needs its vendor — which is exactly the confusion that
lets a Chromecast be labelled "local". We show it; we do not let it decide.

`local_control_revoked_history` is about the vendor's past conduct, not the hardware in the box. It
is shown as a warning next to the verdict, and it is the reason brand pages exist.

The `ha` block (`route`, `cloud_needed`) does not move the tier either, for the same reason: it
describes the integration, not the device. A device can be `cloud-required` and still have a
`core` integration, which is precisely the case worth showing.

## Flashing

Criteria always describe the device **as sold**. A device you must modify is not a device that
works. The `flashing` block records what modification buys you, and the verdict is shown in two
parts — `Cloud required · flashable → Fully local` — so the trade-off is visible instead of
laundered into a good score.
