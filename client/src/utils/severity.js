// The danger scale used by every visualization.
// Colors passed the dataviz palette validator on the dark surface (colorblind separation and
// contrast; orange/red were nudged apart to clear the normal-vision floor). Color is never the
// only cue: each level also has its own marker shape, a text label and a count.
export const SEVERITY = [
  { level: 'Harmless', color: '#34d399', shape: 'circle' },
  { level: 'Moderate', color: '#fde047', shape: 'diamond' },
  { level: 'Dangerous', color: '#fb923c', shape: 'triangle' },
  { level: 'Deadly', color: '#f43f5e', shape: 'target' }
];

export const severityOf = (level) => SEVERITY.find((s) => s.level === level) || SEVERITY[0];

// SVG path/shape data for a marker glyph centred on (0, 0), roughly 14px across
export const GLYPH_PATHS = {
  diamond: 'M0 -7L7 0L0 7L-7 0Z',
  triangle: 'M0 -7.5L7 5.5H-7Z'
};
