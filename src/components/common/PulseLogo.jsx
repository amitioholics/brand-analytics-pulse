import { useId } from 'react';
import './PulseLogo.css';

// Heartbeat that slices through the HaulPack bag
const BEAT = 'M5 29 H14 L17.5 23 L21.5 35 L26 19.5 L29.5 29 H38.5';

export default function PulseLogo({
  size = 'md',
  showBadge = false,
  badgeText = '',
  tagline = 'Brand Analytics',
  variant = 'light', // 'light' or 'dark'
  animated = true,
  showText = true,
  className = '',
}) {
  const iconSizes = { sm: 30, md: 40, lg: 52 };
  const dim = iconSizes[size] || 40;
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
              <stop offset="0" stopColor="#2d2650" />
              <stop offset="1" stopColor="#110e24" />
            </linearGradient>
            <radialGradient id={id('halo')} cx="24" cy="28" r="22" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#7c3aed" stopOpacity="0.55" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={id('bag')} x1="10" y1="12" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#a78bfa" />
              <stop offset="0.5" stopColor="#7c3aed" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id={id('beat')} x1="5" y1="0" x2="41" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="0.55" stopColor="#ffffff" />
              <stop offset="1" stopColor="#67e8f9" />
            </linearGradient>
            {/* Knock the heartbeat out of the bag, like HaulPack's cut */}
            <mask id={id('cut')} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
              <rect width="48" height="48" fill="#fff" />
              <path d={BEAT} stroke="#000" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            </mask>
            <filter id={id('glow')} x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="1.1" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Tile ── */}
          <rect width="48" height="48" rx="13" fill={`url(#${id('tile')})`} />
          <rect width="48" height="48" rx="13" fill={`url(#${id('halo')})`} className="pulse-brand-logo__halo" />

          {/* ── HaulPack bag ── */}
          <g mask={`url(#${id('cut')})`}>
            <path
              d="M18.5 16.5 V13.5 a5.5 5.5 0 0 1 11 0 V16.5"
              stroke={`url(#${id('bag')})`}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M14.2 16.5 H33.8 L38.4 36.6 Q39 39.5 36.2 39.5 H11.8 Q9 39.5 9.6 36.6 Z"
              fill={`url(#${id('bag')})`}
              stroke={`url(#${id('bag')})`}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </g>

          {/* ── Heartbeat ── */}
          <path
            d={BEAT}
            stroke={`url(#${id('beat')})`}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${id('glow')})`}
          />
          {/* Travelling spark along the beat */}
          {animated && (
            <path
              d={BEAT}
              pathLength="100"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${id('glow')})`}
              className="pulse-brand-logo__spark"
            />
          )}

          {/* ── Beacon ── */}
          <circle cx="41" cy="29" r="3.2" stroke="#67e8f9" strokeWidth="0.9" className="pulse-brand-logo__ring" />
          <circle cx="41" cy="29" r="2" fill="#67e8f9" filter={`url(#${id('glow')})`} className="pulse-brand-logo__dot" />

          {/* Border gloss */}
          <rect x="0.6" y="0.6" width="46.8" height="46.8" rx="12.4" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="pulse-brand-logo__text-wrap">
          <div className="pulse-brand-logo__title-row">
            <span className="pulse-brand-logo__wordmark">
              Pulse<span className="pulse-brand-logo__period">.</span>
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
