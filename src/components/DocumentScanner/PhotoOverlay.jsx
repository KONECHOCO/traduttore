import React, { useState } from 'react';

/**
 * Foto con la traduzione disegnata sopra ogni blocco di testo riconosciuto (stile "lente").
 * blocks: [{ box: {left, top, right, bottom} in pixel dell'immagine, lines, translated }]
 */
export default function PhotoOverlay({ src, blocks, showOriginal }) {
  const [size, setSize] = useState(null); // dimensioni naturali dell'immagine

  return (
    <div className="photo-overlay">
      <img src={src} alt="" onLoad={e => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
      {size && !showOriginal && blocks.map((b, i) => {
        const w = b.box.right - b.box.left;
        const h = b.box.bottom - b.box.top;
        if (w <= 0 || h <= 0 || !b.translated) return null;
        // dimensione del carattere: il testo tradotto deve stare nel riquadro (stima dalla sua lunghezza),
        // senza superare l'altezza di una riga originale; espressa in % della larghezza dell'immagine
        const fit = Math.sqrt((w * h) / (Math.max(1, b.translated.length) * 0.55));
        const lineH = Math.min(h / Math.max(1, b.lines), fit);
        return (
          <div
            key={i}
            className="photo-overlay-box"
            dir="auto"
            style={{
              left: `${(b.box.left / size.w) * 100}%`,
              top: `${(b.box.top / size.h) * 100}%`,
              width: `${(w / size.w) * 100}%`,
              minHeight: `${(h / size.h) * 100}%`,
              fontSize: `${(lineH / size.w) * 100 * 0.85}cqw`
            }}
          >
            {b.translated}
          </div>
        );
      })}
    </div>
  );
}
