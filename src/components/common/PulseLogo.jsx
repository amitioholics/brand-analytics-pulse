import { useId } from 'react';
import './PulseLogo.css';

// Heartbeat that slices through the HaulPack bag
const BEAT = 'M5 29 H14 L17.5 23 L21.5 35 L26 19.5 L29.5 29 H38.5';

export default function PulseLogo({
  size = 'md',
  showBadge = false,
  badgeText = '',
  tagline = 'BY HAULPACK',
  variant = 'light', // 'light' or 'dark'
  animated = true,
  showText = true,
  showPeriod = false,
  className = '',
}) {
  const iconSizes = { sm: 30, md: 40, lg: 52, xl: 64 };
  const dim = typeof size === 'number' ? size : (iconSizes[size] || 40);
  // Unique, url()-safe ids so multiple logos on a page don't share defs
  const uid = `pl${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const id = (name) => `${uid}-${name}`;

  return (
    <div className={`pulse-brand-logo pulse-brand-logo--${size} pulse-brand-logo--${variant} ${className}`}>
      {/* Emblem */}
      <div className={`pulse-brand-logo__emblem ${animated ? 'pulse-brand-logo__emblem--animated' : ''}`}>
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pulse-brand-logo__svg"
          role="img"
          aria-label="Pulse — Brand Analytics"
        >
          <defs>
            <linearGradient id={id('tile')} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6442ef" />
              <stop offset="100%" stopColor="#4f26d9" />
            </linearGradient>
            <filter id={id('glow')} x="-15%" y="-30%" width="130%" height="160%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Vibrant Purple Squircle Tile ── */}
          <rect width="48" height="48" rx="12" fill={`url(#${id('tile')})`} />
          <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="11.25" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.2" />

          {/* ── Crisp White Pulse Waveform (from reference) ── */}
          <path
            d="M7 24 H15 L18.5 17 L22.5 32 L27.5 13 L31.5 24 H41"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${id('glow')})`}
          />

          {/* ── Traveling Spark Animation along the waveform ── */}
          {animated && (
            <path
              d="M7 24 H15 L18.5 17 L22.5 32 L27.5 13 L31.5 24 H41"
              pathLength="100"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pulse-brand-logo__spark"
            />
          )}
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="pulse-brand-logo__text-wrap">
          <div className="pulse-brand-logo__title-row">
            <span className="pulse-brand-logo__wordmark">
              Pulse{showPeriod && <span className="pulse-brand-logo__period">.</span>}
            </span>
            {showBadge && (
              <span className="pulse-brand-logo__badge">{badgeText}</span>
            )}
          </div>
          {tagline && (
            <span className="pulse-brand-logo__tagline">{tagline}</span>
          )}
        </div>
      )}
    </div>
  );
}
