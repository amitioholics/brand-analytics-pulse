import { useState, useMemo } from 'react';
import {
  Search, ExternalLink, Filter, CheckCircle2, Clock, X,
  Video, Eye, MousePointerClick, ArrowRight, PackageCheck,
  Send, AlertCircle, Sparkles, MapPin, Tag, Globe, User
} from 'lucide-react';
import { formatNumber, getInitials, getSocialUrl } from '../../utils/formatters';
import './CampaignCreatorsTab.css';

const PROGRESS_STATUS_CONFIG = {
  'Getting product': { color: '#d97706', bg: '#fef3c7', border: '#fde68a', icon: PackageCheck },
  'Creating content': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: Video },
  'Content in review': { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Clock },
  'Changes requested': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertCircle },
  'Posting': { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: Send },
  'Live': { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: CheckCircle2 },
  'Completed': { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0', icon: Sparkles },
};

export default function CampaignCreatorsTab({
  creators = [],
  campaign,
  campaignSubmissions = [],
  onOpenBarterModal,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState(null); // Side Drawer state (PRD 8.6 CT-03)

  const filteredCreators = useMemo(() => {
    return creators.filter(c => {
      if (statusFilter !== 'all' && (c.campaignProgressStatus || 'Live') !== statusFilter) return false;
      if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const handleMatch = c.socialHandle?.toLowerCase().includes(q);
        const cityMatch = c.shippingCity?.toLowerCase().includes(q);
        const catMatch = c.category?.toLowerCase().includes(q);
        if (!nameMatch && !handleMatch && !cityMatch && !catMatch) return false;
      }
      return true;
    });
  }, [creators, statusFilter, platformFilter, search]);

  // Content deliverables for selected drawer creator
  const selectedCreatorDeliverables = useMemo(() => {
    if (!selectedCreator) return [];
    return campaignSubmissions.filter(
      s => s.creatorId === selectedCreator.id || s.creatorHandle === selectedCreator.socialHandle
    );
  }, [selectedCreator, campaignSubmissions]);

  return (
    <div className="campaign-creators-tab fade-in">
      {/* Toolbar */}
      <div className="creators-toolbar">
        <div className="creators-toolbar__left">
          <div className="creators-search-wrap">
            <Search size={15} className="creators-search-icon" />
            <input
              type="text"
              className="creators-search-input"
              placeholder="Search creators by name, handle, city, or niche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="creators-search-clear" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>

          <select
            className="creators-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Campaign Stages</option>
            <option value="Getting product">Getting product</option>
            <option value="Creating content">Creating content</option>
            <option value="Content in review">Content in review</option>
            <option value="Changes requested">Changes requested</option>
            <option value="Posting">Posting</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="creators-select"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube</option>
          </select>
        </div>

        <div className="creators-toolbar__right">
          {campaign.isBarter && onOpenBarterModal && (
            <button
              type="button"
              className="creators-barter-btn"
              onClick={() => onOpenBarterModal('all')}
            >
              <PackageCheck size={14} />
              <span>Barter Delivery Roster</span>
            </button>
          )}
        </div>
      </div>

      {/* Creators Table */}
      <div className="creators-table-card">
        <table className="creators-table">
          <thead>
            <tr>
              <th>Creator</th>
              <th>Platform</th>
              <th>Followers</th>
              <th>Category</th>
              <th>Location</th>
              <th>Campaign Stage</th>
              {campaign.isBarter && <th>Barter Product</th>}
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreators.length === 0 ? (
              <tr>
                <td colSpan={campaign.isBarter ? 8 : 7} className="creators-empty-cell">
                  No creators found matching active filters.
                </td>
              </tr>
            ) : (
              filteredCreators.map(creator => {
                const stage = creator.campaignProgressStatus || (creator.productReceived ? 'Live' : 'Getting product');
                const cfg = PROGRESS_STATUS_CONFIG[stage] || PROGRESS_STATUS_CONFIG['Live'];
                const StageIcon = cfg.icon;

                return (
                  <tr
                    key={creator.id || creator.creatorId}
                    className="creator-row"
                    onClick={() => setSelectedCreator(creator)}
                  >
                    <td>
                      <div className="creator-cell-user">
                        <div
                          className="creator-avatar"
                          style={{ background: creator.avatarColor || 'var(--hp-primary)' }}
                        >
                          {getInitials(creator.name)}
                        </div>
                        <div>
                          <div className="creator-name">{creator.name}</div>
                          <a
                            href={getSocialUrl(creator.platform, creator.socialHandle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="creator-handle-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>{creator.socialHandle}</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`platform-tag platform-tag--${creator.platform.toLowerCase()}`}>
                        {creator.platform}
                      </span>
                    </td>

                    <td>
                      <span className="followers-val">{formatNumber(creator.followerCount)}</span>
                    </td>

                    <td>
                      <span className="category-val">{creator.category || 'Fashion & Styling'}</span>
                    </td>

                    <td>
                      <div className="location-val">
                        <MapPin size={11} />
                        <span>{creator.shippingCity || 'Mumbai, MH'}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className="stage-badge"
                        style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                      >
                        <StageIcon size={12} />
                        <span>{stage}</span>
                      </span>
                    </td>

                    {campaign.isBarter && (
                      <td>
                        <span className={`barter-status-dot ${creator.productReceived ? 'barter-status-dot--delivered' : 'barter-status-dot--pending'}`}>
                          {creator.deliveryStatus || 'Delivered'}
                        </span>
                      </td>
                    )}

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="view-panel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreator(creator);
                        }}
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Creator Side Drawer (PRD 8.6 CT-03) */}
      {selectedCreator && (
        <div className="creator-drawer-overlay" onClick={() => setSelectedCreator(null)}>
          <div className="creator-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="creator-drawer__header">
              <div className="drawer-user-info">
                <div
                  className="drawer-avatar"
                  style={{ background: selectedCreator.avatarColor || 'var(--hp-primary)' }}
                >
                  {getInitials(selectedCreator.name)}
                </div>
                <div>
                  <h3 className="drawer-title">{selectedCreator.name}</h3>
                  <a
                    href={getSocialUrl(selectedCreator.platform, selectedCreator.socialHandle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="drawer-handle"
                  >
                    <span>{selectedCreator.socialHandle}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedCreator(null)}
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="creator-drawer__body">
              {/* Creator Meta Grid */}
              <div className="drawer-meta-grid">
                <div className="drawer-meta-item">
                  <span className="drawer-meta-label">Followers</span>
                  <span className="drawer-meta-val">{formatNumber(selectedCreator.followerCount)}</span>
                </div>
                <div className="drawer-meta-item">
                  <span className="drawer-meta-label">Platform</span>
                  <span className="drawer-meta-val">{selectedCreator.platform}</span>
                </div>
                <div className="drawer-meta-item">
                  <span className="drawer-meta-label">Location (City)</span>
                  <span className="drawer-meta-val">{selectedCreator.shippingCity || 'Mumbai, MH'}</span>
                </div>
                <div className="drawer-meta-item">
                  <span className="drawer-meta-label">Niche Category</span>
                  <span className="drawer-meta-val">{selectedCreator.category || 'Fashion & Styling'}</span>
                </div>
              </div>

              {/* Campaign Progress Status Card */}
              <div className="drawer-card">
                <h4 className="drawer-card-title">Campaign Progress Status</h4>
                <div className="drawer-status-box">
                  <span className="drawer-status-tag">
                    {selectedCreator.campaignProgressStatus || 'Live'}
                  </span>
                  <span className="drawer-status-date">Registered on {selectedCreator.registeredAt || '2026-09-02'}</span>
                </div>
              </div>

              {/* Barter Product Details (if applicable) */}
              {campaign.isBarter && selectedCreator.assignedProducts && (
                <div className="drawer-card">
                  <h4 className="drawer-card-title">Dispatched Barter Products</h4>
                  <div className="drawer-product-list">
                    {selectedCreator.assignedProducts.map((p, idx) => (
                      <div key={idx} className="drawer-product-row">
                        <div>
                          <strong>{p.name}</strong>
                          <div className="drawer-product-variant">{p.variant}</div>
                        </div>
                        <span className="drawer-product-val">₹{p.value}</span>
                      </div>
                    ))}
                    <div className="drawer-tracking-row">
                      <span>Courier: <strong>{selectedCreator.courierPartner}</strong></span>
                      <span>AWB: <code>{selectedCreator.trackingNumber}</code></span>
                      <span>Status: <strong style={{ color: selectedCreator.productReceived ? '#059669' : '#d97706' }}>{selectedCreator.deliveryStatus}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Creator Deliverables in this Campaign */}
              <div className="drawer-card">
                <h4 className="drawer-card-title">Campaign Deliverables ({selectedCreatorDeliverables.length})</h4>
                {selectedCreatorDeliverables.length === 0 ? (
                  <p className="drawer-empty-text">No deliverables submitted by creator yet.</p>
                ) : (
                  <div className="drawer-deliverables-list">
                    {selectedCreatorDeliverables.map(sub => (
                      <div key={sub.id} className="drawer-sub-card">
                        <div className="drawer-sub-header">
                          <span className="drawer-sub-type">{sub.deliverableType}</span>
                          <span className={`drawer-sub-badge drawer-sub-badge--${sub.stage}`}>
                            {sub.stage === 'live_approved' ? 'Live Approved' : sub.stage === 'draft_review' ? 'Draft Pending Review' : 'Under QA'}
                          </span>
                        </div>
                        <h5 className="drawer-sub-title">{sub.videoTitle}</h5>
                        {sub.livePostUrl && (
                          <a
                            href={sub.livePostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="drawer-live-link"
                          >
                            <span>Open Live Post</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {sub.caption && (
                          <p className="drawer-sub-caption">"{sub.caption}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
