import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gift, ChevronDown, Check, ArrowRightLeft } from 'lucide-react';
import { usePortal, PORTAL_MODES } from '../../context/PortalContext';
import './PortalSwitcher.css';

export default function PortalSwitcher({ onSelect }) {
  const navigate = useNavigate();
  const { portal, setPortal, currentConfig, isBrandConnect, isRewardProgram } = usePortal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (mode) => {
    setPortal(mode);
    setDropdownOpen(false);
    navigate('/');
    if (onSelect) onSelect();
  };

  return (
    <div className="portal-switcher" ref={containerRef}>
      {/* Top micro-header */}
      <div className="portal-switcher__label-row">
        <span className="portal-switcher__caption">PORTAL VIEW</span>
        <span className="portal-switcher__active-tag">
          {isBrandConnect ? 'Collabs' : 'Rewards'}
        </span>
      </div>

      {/* Primary Selector Button */}
      <button
        type="button"
        className={`portal-switcher__trigger ${isBrandConnect ? 'portal-switcher__trigger--brand' : 'portal-switcher__trigger--reward'} ${dropdownOpen ? 'portal-switcher__trigger--open' : ''}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title="Switch between Brand Connect and Reward Program"
      >
        <div className="portal-switcher__trigger-icon">
          {isBrandConnect ? (
            <Sparkles size={16} className="portal-switcher__icon-brand" />
          ) : (
            <Gift size={16} className="portal-switcher__icon-reward" />
          )}
        </div>

        <div className="portal-switcher__trigger-info">
          <span className="portal-switcher__trigger-title">{currentConfig.name}</span>
          <span className="portal-switcher__trigger-sub">
            {isBrandConnect ? 'Influencer Collabs' : 'Affiliate Rewards'}
          </span>
        </div>

        <div className="portal-switcher__trigger-chevron">
          <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
        </div>
      </button>


      {/* Expandable Dropdown Popover */}
      {dropdownOpen && (
        <div className="portal-switcher__dropdown">
          <div className="portal-switcher__dropdown-header">
            <span>Switch Workspace View</span>
            <ArrowRightLeft size={13} />
          </div>

          <div className="portal-switcher__options">
            {/* Option 1: Brand Connect */}
            <button
              type="button"
              className={`portal-switcher__option ${isBrandConnect ? 'portal-switcher__option--selected' : ''}`}
              onClick={() => handleSelect(PORTAL_MODES.BRAND_CONNECT)}
            >
              <div className="portal-switcher__opt-icon portal-switcher__opt-icon--brand">
                <Sparkles size={16} />
              </div>
              <div className="portal-switcher__opt-content">
                <div className="portal-switcher__opt-title-row">
                  <span className="portal-switcher__opt-name">Brand Connect</span>
                  <span className="portal-switcher__opt-pill portal-switcher__opt-pill--brand">Collabs</span>
                </div>
                <p className="portal-switcher__opt-desc">
                  Direct creator partnerships, sponsored deliverables, and brand activations.
                </p>
              </div>
              {isBrandConnect && (
                <div className="portal-switcher__opt-check">
                  <Check size={14} />
                </div>
              )}
            </button>

            {/* Option 2: Reward Program */}
            <button
              type="button"
              className={`portal-switcher__option ${isRewardProgram ? 'portal-switcher__option--selected' : ''}`}
              onClick={() => handleSelect(PORTAL_MODES.REWARD_PROGRAM)}
            >
              <div className="portal-switcher__opt-icon portal-switcher__opt-icon--reward">
                <Gift size={16} />
              </div>
              <div className="portal-switcher__opt-content">
                <div className="portal-switcher__opt-title-row">
                  <span className="portal-switcher__opt-name">Reward Program</span>
                  <span className="portal-switcher__opt-pill portal-switcher__opt-pill--reward">Affiliate</span>
                </div>
                <p className="portal-switcher__opt-desc">
                  Catalog affiliate hauls, milestone rewards, and gross sales attribution.
                </p>
              </div>
              {isRewardProgram && (
                <div className="portal-switcher__opt-check">
                  <Check size={14} />
                </div>
              )}
            </button>
          </div>

          <div className="portal-switcher__dropdown-footer">
            <span className="portal-switcher__dropdown-hint">
              💡 Dashboard and metrics automatically adapt to the selected portal.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
