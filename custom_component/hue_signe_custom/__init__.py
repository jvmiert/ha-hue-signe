from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers.typing import ConfigType

from aiohttp import ClientSession, TCPConnector
from rgbxy import Converter
from rgbxy import GamutC

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

    converter = Converter(GamutC)
    xy_list = []
    for color in color_list:
      xy_list.append(converter.rgb_to_xy(color[0], color[1], color[2]))

    json_request = {"gradient": { "points": []}}

    xy_list.reverse()
    for color in xy_list:
      json_request["gradient"]["points"].append(
        {"color": {"xy": { "x": color[0], "y": color[1] } } }
      )

    websession = ClientSession(connector=TCPConnector(verify_ssl=False))

    hue_config = hass.data[DOMAIN]

    headers = {
      "hue-application-key": hue_config['config']['token']
    }

    try:
      url = f"https://{hue_config['config']['bridge_ip']}/clip/v2/resource/light/{hue_config['config']['lamp_id']}"
      async with websession.put(url, json=json_request, headers=headers, timeout=30) as res:
        res.raise_for_status()
    finally:
      await websession.close()

  hue_config = config.get("hue_signe_custom")

  if hue_config:
    token = hue_config.get("token")
    bridge_ip = hue_config.get("ip")
    lamp_id = hue_config.get("lamp_id")
    hass.data[DOMAIN] = {
      'config': {
        'token': token,
        'bridge_ip': bridge_ip,
        'lamp_id': lamp_id,
      }
    }

  # Register our service with Home Assistant.
  hass.services.async_register(DOMAIN, 'change_gradient', my_service)

  # Return boolean to indicate that initialization was successfully.
  return True
