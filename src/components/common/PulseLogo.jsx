import { useId } from 'react';
import './PulseLogo.css';

export default function PulseLogo({
  size = 'md',
  showBadge = false,
  badgeText = '',
  variant = 'light', // 'light' (for white/light backgrounds) or 'dark' (for dark headers)
  animated = true,
  showText = true,
  tagline = 'Brand Analytics',
  className = '',
}) {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
  };

  const dim = iconSizes[size] || 38;
  const rawId = useId();
  const uid = `pl${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const gradId = `${uid}-grad`;
  const lineGlowId = `${uid}-line`;
  const dropShadowId = `${uid}-shadow`;

  return (
    <div className={`pulse-brand-logo pulse-brand-logo--${size} pulse-brand-logo--${variant} ${className}`}>
      {/* Animated Pulse Emblem */}
      <div className={`pulse-brand-logo__emblem ${animated ? 'pulse-brand-logo__emblem--animated' : ''}`}>
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pulse-brand-logo__svg"
          aria-label="Pulse"
          role="img"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6538ea" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id={lineGlowId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.9" />
            </linearGradient>
            <filter id={dropShadowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6538ea" floodOpacity="0.32" />
            </filter>
          </defs>

          {/* Squircle base */}
          <rect
            x="1.5"
            y="1.5"
            width="37"
            height="37"
            rx="11"
            fill={`url(#${gradId})`}
            filter={`url(#${dropShadowId})`}
          />

          {/* Subtle inner highlight */}
          <rect
            x="2.5"
            y="2.5"
            width="35"
            height="35"
            rx="10"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Dynamic Pulse / ECG line */}
          <path
            d="M 6.5 20.5 H 12 L 15 13.5 L 19 27.5 L 23.5 10.5 L 27 23.5 L 29.5 20.5 H 33.5"
            stroke={`url(#${lineGlowId})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pulse-brand-logo__wave"
          />

          {/* Active Live Pulse Beacon Dot */}
          <circle cx="33.5" cy="20.5" r="2.2" fill="#38bdf8" className="pulse-brand-logo__dot" />
        </svg>
      </div>

      {/* Typography & Badge */}
      {showText && (
        <div className="pulse-brand-logo__text-wrap">
          <div className="pulse-brand-logo__title-row">
            <span className="pulse-brand-logo__name">Pulse</span>
            <span className="pulse-brand-logo__dot-accent">.</span>
            {showBadge && (
              <span className="pulse-brand-logo__badge">{badgeText}</span>
            )}
          </div>
          {tagline && <span className="pulse-brand-logo__tagline">{tagline}</span>}
        </div>
      )}
    </div>
  );
}
