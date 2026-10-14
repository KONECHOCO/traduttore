import React from 'react';
import { Crown } from 'lucide-react';
import { useMonetization } from '../services/monetization';

// Nell'app nativa il banner è quello vero di AdMob (disegnato sopra la WebView): qui riserviamo
// solo lo spazio. Nel browser non ci sono annunci: mostriamo l'invito a passare a Pro.
export default function AdBanner({ t, onUpgrade }) {
  const { native, isPro, bannerHeight } = useMonetization();

  if (isPro) return null;
  if (native) return <div style={{ height: bannerHeight }} aria-hidden="true" />;

  return (
    <div className="web-pro-bar">
      <button onClick={onUpgrade}>
        <Crown size={14} />
        <span>{t.pro.removeAds} · Pro</span>
      </button>
    </div>
  );
}
