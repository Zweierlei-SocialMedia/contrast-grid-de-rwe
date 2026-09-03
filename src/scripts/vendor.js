// Legacy component code reads these off the global scope, so expose them here.
import "./jquery-global.js";
import "jquery-ui-dist/jquery-ui.js";
import "jquery-deserialize";
import "jquery.typewatch";
import "./dragtable.js";
import Clipboard from "clipboard";
import beautify from "js-beautify";
import svg4everybody from "svg4everybody";

window.Clipboard = Clipboard;
window.html_beautify = beautify.html;
window.css_beautify = beautify.css;
window.svg4everybody = svg4everybody;
