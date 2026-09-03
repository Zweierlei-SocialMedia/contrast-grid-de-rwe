import { EightShapes } from "./eightshapes.js";
import { qs } from "./dom.js";
import { EVENTS, emit } from "./events.js";

// Initialize the various components in the correct order
EightShapes.ContrastGrid.initialize();
EightShapes.CodeSnippet.initialize();
EightShapes.ColorForm.initialize();

qs(".es-code-toggle").addEventListener("click", () => {
  document.body.classList.add("es-code-toggle--visible");
  emit(EVENTS.showCodeSnippet);
});

qs(".es-code-snippet__hide-button").addEventListener("click", () => {
  document.body.classList.remove("es-code-toggle--visible");
});
