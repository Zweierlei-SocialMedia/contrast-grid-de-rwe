// jQuery must exist as a global before any jQuery plugin module is evaluated.
import $ from "jquery";

window.$ = window.jQuery = $;

export default $;
