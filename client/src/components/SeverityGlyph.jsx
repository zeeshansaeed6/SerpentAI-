import React from 'react';
import { GLYPH_PATHS, severityOf } from '../utils/severity';

// One glyph per danger level: shape + color, so color is never the only cue
export default function SeverityGlyph({ level, size = 14 }) {
  const sev = severityOf(level);
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
      {sev.shape === 'circle' && <circle r="5.5" fill={sev.color} />}
      {sev.shape === 'diamond' && <path d={GLYPH_PATHS.diamond} fill={sev.color} />}
      {sev.shape === 'triangle' && <path d={GLYPH_PATHS.triangle} fill={sev.color} />}
      {sev.shape === 'target' && (
        <>
          <circle r="5" fill={sev.color} />
          <circle r="8.5" fill="none" stroke={sev.color} strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}
