from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers.typing import ConfigType


# The domain of your component. Should be equal to the name of your component.
DOMAIN = "hue_signe_custom"
LIST_FIELD = "color_list"
_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
  @callback
  async def my_service(call: ServiceCall) -> None:
    color_list = call.data.get(LIST_FIELD, [])

    if len(color_list) < 5:
      return

    hass.states.async_set(f"{DOMAIN}.{LIST_FIELD}", str(color_list))

    hex_list = []
    for color in color_list:
      hex_list.append('"%02x%02x%02x"' % (int(color[0]), int(color[1]), int(color[2])))

    hue_config = hass.data[DOMAIN]

    topic = f"zigbee2mqtt/{hue_config['config']['lamp_id']}/set"
    message = f'{{"gradient":[ {", ".join(hex_list)}]}}'

    await hass.components.mqtt.async_publish(hass, topic, message)

  hue_config = config.get("hue_signe_custom")

  if hue_config:
    lamp_id = hue_config.get("lamp_id")
    hass.data[DOMAIN] = {
      'config': {
        'lamp_id': lamp_id,
      }
    }

  # Register our service with Home Assistant.
  hass.services.async_register(DOMAIN, 'change_gradient', my_service)

  # Return boolean to indicate that initialization was successfully.
  return True
