import React, { useState } from 'react';
import { useMonetization } from '../services/monetization';

// Pannello diagnostico pubblicità: compare solo con gli annunci di test attivi (7 tocchi sul logo)
export default function AdDiagnostics() {
  const { testAds, diag, native, adsReady, isPro } = useMonetization();
  const [open, setOpen] = useState(true);
  if (!testAds || !native) return null;
  return (
    <div className="ad-diagnostics">
      <button onClick={() => setOpen(!open)}>
        ADS DEBUG · ready={String(adsReady)} pro={String(isPro)} {open ? '▼' : '▲'}
      </button>
      {open && (
        <div className="ad-diagnostics-log">
          {(diag || []).map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
