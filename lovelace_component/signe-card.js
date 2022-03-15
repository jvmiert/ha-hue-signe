import {
    LitElement,
    html,
    css
} from "/local/lit-core.min.js";

class SigneCard extends LitElement  {
  constructor() {
    super();
    this._rgb_list = [[255,255,255], [255,255,255], [255,255,255], [255,255,255], [255,255,255]];
    this._showColorPicker = false;
    this._hueSegments = 0; //24
    this._saturationSegments = 0; //8
    this._colorPickerColor = [100, 0, 0];
    this._picker_id = 0;
    this._rendered_picker = false;
    this._timeout_picker = null;
  }

  async firstUpdated() {
    if (window.loadCardHelpers) {
      const helpers = await window.loadCardHelpers();
      helpers.importMoreInfoControl('light');
    }
  }

  static styles = css`
    .circle {
      width: 32px;
      height: 32px;
      margin: 4px 8px 8px;
      border-radius: 50%; cursor: pointer; transition: box-shadow 0.15s ease-in-out;
      box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }

    .circle:hover {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);
    }

    .circle-active {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,.25), 0 8px 10px 1px rgba(0,0,0,.19), 0 3px 14px 2px rgba(0,0,0,.17);
    }

    .circle-container {
      justify-content: space-evenly;
      margin-bottom: 8px;
      cursor: auto;
      display: flex;
      flex-wrap: wrap;
    }
    .light-entity-card__color-picker {
      display: flex;
      justify-content: space-around;
      --ha-color-picker-wheel-borderwidth: 5;
      --ha-color-picker-wheel-bordercolor: white;
      --ha-color-picker-wheel-shadow: none;
      --ha-color-picker-marker-borderwidth: 2;
      --ha-color-picker-marker-bordercolor: white;
    }
  `

  static get properties() {
    return {
      hass: {},
      _config: {},
      _rgb_list: {state: true},
      _showColorPicker: {state: true},
      _saturationSegments: {state: true},
      _hueSegments: {state: true},
      _colorPickerColor: {state: true},
      _rendered_picker: {state: true},
    };
  }

  setConfig(config) {
    this._config = config;
  }

  startTimeout() {
    if(this._timeout_picker) {
      clearTimeout(this._timeout_picker);
    }
    this._timeout_picker = setTimeout(() => this._showColorPicker = false, 8000);
  }

  handleCircleClick(e) {
    this._picker_id = Number(e.target.id.slice(-1));
    this._colorPickerColor = this._rgb_list[this._picker_id];
    this._showColorPicker = true;
    this.startTimeout();
  }

  handleColorPicker(e) {
    const index_id = this._picker_id;
    this._rgb_list[index_id][0] = e.detail.rgb.r;
    this._rgb_list[index_id][1] = e.detail.rgb.g;
    this._rgb_list[index_id][2] = e.detail.rgb.b;
    this.hass.callService("hue_signe_custom", "change_gradient", { color_list: this._rgb_list });
    this.startTimeout();
  }

  getCircleClass(n) {
    if(!this._showColorPicker) return "circle";

    if(this._picker_id === n) return "circle circle-active";

    return "circle";
  }

  updated(changedProperties) {
    if (changedProperties.has("hass")) {
      const hass_color_list = this.hass.states['hue_signe_custom.color_list'];
      if (hass_color_list?.state) {
        const newList = JSON.parse(hass_color_list.state);
        if(newList.length == 5) {
          if(newList[0].length === 3) {
            this._rgb_list = newList;
          }
        }
      }
    }
    super.update(changedProperties);
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html`
      <ha-card>
        <h1 class="card-header">Signe Lamp</h1>
        <div class="card-content">
          <div class="circle-container">
            <div
              id="circle-0"
              class="${this.getCircleClass(0)}"
              style="background-color: rgb(${this._rgb_list[0][0]}, ${this._rgb_list[0][1]}, ${this._rgb_list[0][2]})"
              @click=${this.handleCircleClick}
            ></div>
            <div
              id="circle-1"
              class="${this.getCircleClass(1)}"
              style="background-color: rgb(${this._rgb_list[1][0]}, ${this._rgb_list[1][1]}, ${this._rgb_list[1][2]})"
              @click=${this.handleCircleClick}
            ></div>
            <div
              id="circle-2"
              class="${this.getCircleClass(2)}"
              style="background-color: rgb(${this._rgb_list[2][0]}, ${this._rgb_list[2][1]}, ${this._rgb_list[2][2]})"
              @click=${this.handleCircleClick}
            ></div>
            <div
              id="circle-3"
              class="${this.getCircleClass(3)}"
              style="background-color: rgb(${this._rgb_list[3][0]}, ${this._rgb_list[3][1]}, ${this._rgb_list[3][2]})"
              @click=${this.handleCircleClick}
            ></div>
            <div
              id="circle-4"
              class="${this.getCircleClass(4)}"
              style="background-color: rgb(${this._rgb_list[4][0]}, ${this._rgb_list[4][1]}, ${this._rgb_list[4][2]})"
              @click=${this.handleCircleClick}
            ></div>
          </div>
          <div
            class="light-entity-card__color-picker"
            style="display: ${this._showColorPicker ? 'flex' : 'none'}"
          >
            <ha-color-picker
              id="color-picker-signe"
              class="color"
              @colorselected=${this.handleColorPicker}
              .desiredRgbColor=${this._colorPickerColor}
              throttle="500"
              .hueSegments=${this._hueSegments}
              .saturationSegments=${this._saturationSegments}
            >
            </ha-color-picker>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define('signe-card', SigneCard);
