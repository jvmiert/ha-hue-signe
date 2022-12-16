Simple Home Assistant component to control Hue gradient signe lamp.

## Setup

### Copy lovelace component

Copy content of lovelace_component folder into: `<HA-config>/www`

### Register resources

Register both resources: https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources/

```
/local/lit-core.min.js
/local/signe-card.js
```

### Add to dashboard

Go to your dashboard and enter YAML mode to add the resource. Enter following YAML:

```
type: custom:signe-card
```

### Copy custom component

This enables the service that the lovelace component calls.

Copy content of custom_component into: `<HA-config>/custom_components`

### Setup configuration

Add the following to your configuration.yaml file:

```
hue_signe_custom:
  lamp_id: <Zigbee2mqtt device id>
```
