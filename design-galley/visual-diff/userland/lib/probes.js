// lib/probes.js — Reusable probe recipes for Fringe intake screens
// Defines which CSS properties and attributes to extract for each component type.

// Shared style presets (matching the pixel-accuracy scripting guide)
const PRESETS = {
  typography: [
    'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
    'color', 'text-transform',
  ],
  layout: [
    'display', 'position', 'width', 'height', 'min-height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  ],
  surface: [
    'background-color', 'border-color', 'border-width', 'border-radius',
    'box-shadow', 'opacity',
  ],
  spacing: [
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'gap', 'row-gap', 'column-gap',
  ],
  pageShell: [
    'box-sizing', 'width', 'height', 'padding-top', 'padding-bottom',
    'display', 'background-color', 'overflow',
  ],
};

// Screen-level probe: captures the full content area
function screenShellProbe(selector) {
  return {
    name: 'screen-shell',
    selector,
    required: true,
    props: [
      'display', 'position', 'width', 'height', 'min-height',
      'background-color', 'overflow', 'font-family', 'color',
    ],
  };
}

// Component-level probe: captures an individual component within a screen
function componentProbe(name, selector, opts = {}) {
  return {
    name,
    selector,
    required: opts.required ?? false,
    props: opts.props || PRESETS.layout.concat(PRESETS.surface),
  };
}

module.exports = { PRESETS, screenShellProbe, componentProbe };
