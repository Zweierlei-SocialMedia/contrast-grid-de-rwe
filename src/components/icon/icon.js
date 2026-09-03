import arrowRepeat from "bootstrap-icons/icons/arrow-repeat.svg?raw";
import clipboard from "bootstrap-icons/icons/clipboard.svg?raw";
import github from "bootstrap-icons/icons/github.svg?raw";
import gripHorizontal from "bootstrap-icons/icons/grip-horizontal.svg?raw";
import gripVertical from "bootstrap-icons/icons/grip-vertical.svg?raw";
import twitterX from "bootstrap-icons/icons/twitter-x.svg?raw";
import xLg from "bootstrap-icons/icons/x-lg.svg?raw";
import eightshapesMark from "../../brand/eightshapes-mark.svg?raw";

const SOURCES = {
  "circle-o-notch": arrowRepeat,
  clipboard,
  close: xLg,
  "eightshapes-mark": eightshapesMark,
  github,
  grip: gripVertical,
  "grip-horizontal": gripHorizontal,
  twitter: twitterX,
};

// Drops width/height/fill so the icon takes its size and color from the CSS
// applied to the host element.
function normalize(source) {
  return source
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<svg\b[^>]*>/, (openTag) => {
      const viewBox = openTag.match(/viewBox="[^"]*"/)?.[0] ?? "";
      return `<svg xmlns="http://www.w3.org/2000/svg" ${viewBox} aria-hidden="true" focusable="false">`;
    });
}

class IconElement extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name");
    const source = SOURCES[name];

    if (!source) {
      throw new Error(`Unknown icon "${name}"`);
    }

    this.innerHTML = normalize(source);
  }
}

customElements.define("es-icon", IconElement);
