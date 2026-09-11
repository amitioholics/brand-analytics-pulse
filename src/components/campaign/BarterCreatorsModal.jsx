import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Search, Download, CheckCircle2, Truck, Package, PackageCheck,
  Copy, Check, ExternalLink, ArrowRight, Filter, AlertCircle, Clock
} from 'lucide-react';
import { formatNumber, getInitials, getSocialUrl } from '../../utils/formatters';
import './BarterCreatorsModal.css';

export default function BarterCreatorsModal({
  isOpen,
  onClose,
  campaign,
  fulfillment,
  initialFilter = 'all',
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialFilter); // 'all' | 'delivered' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [courierFilter, setCourierFilter] = useState('all');
  const [subStatusFilter, setSubStatusFilter] = useState('all');
  const [copiedAWB, setCopiedAWB] = useState(null);

  // Sync activeTab when initialFilter changes upon modal open
  useEffect(() => {
    setActiveTab(initialFilter);
    setSearchQuery('');
    setCourierFilter('all');
    setSubStatusFilter('all');
  }, [initialFilter, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const creators = fulfillment?.creators || [];
  const deliveredCount = fulfillment?.deliveredCount || 0;
  const yetToReceiveCount = fulfillment?.yetToReceiveCount || 0;
  const totalRegistered = fulfillment?.totalRegistered || 0;

  // Filter creators based on tab, search, courier, and status
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      // 1. Primary Tab filter
      if (activeTab === 'delivered' && !c.productReceived && c.deliveryStatus !== 'Delivered') {
        return false;
      }
      if (activeTab === 'pending' && (c.productReceived || c.deliveryStatus === 'Delivered')) {
        return false;
      }

      // 2. Specific sub-status filter
      if (subStatusFilter !== 'all' && c.deliveryStatus !== subStatusFilter) {
        return false;
      }

      // 3. Courier filter
      if (courierFilter !== 'all' && c.courierPartner !== courierFilter) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const handleMatch = c.socialHandle?.toLowerCase().includes(q);
        const awbMatch = c.trackingNumber?.toLowerCase().includes(q);
        const cityMatch = c.shippingCity?.toLowerCase().includes(q);
        const productMatch = c.assignedProducts?.some((p) => p.name?.toLowerCase().includes(q));
        if (!nameMatch && !handleMatch && !awbMatch && !cityMatch && !productMatch) {
          return false;
        }
      }

      return true;
    });
  }, [creators, activeTab, subStatusFilter, courierFilter, searchQuery]);

  const handleCopyAWB = (awb) => {
    if (!awb) return;
    navigator.clipboard.writeText(awb);
    setCopiedAWB(awb);
    setTimeout(() => setCopiedAWB(null), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredCreators.length) return;
    const headers = [
      'Creator Name',
      'Handle',
      'Platform',
      'Followers',
      'City',
      'Registered Date',
      'Delivery Status',
      'Product Received',
      'Courier',
      'Tracking AWB',
      'Dispatched Date',
      'Delivered Date / ETA',
      'Products Sent',
      'Total Barter Value (INR)',
    ];

    const rows = filteredCreators.map((c) => [
      `"${c.name || ''}"`,
      `"${c.socialHandle || ''}"`,
      `"${c.platform || ''}"`,
      c.followerCount || 0,
      `"${c.shippingCity || ''}"`,
      `"${c.registeredAt || ''}"`,
      `"${c.deliveryStatus || ''}"`,
      c.productReceived ? 'Yes' : 'No',
      `"${c.courierPartner || ''}"`,
      `"${c.trackingNumber || ''}"`,
      `"${c.dispatchedAt || ''}"`,
      `"${c.deliveredAt || c.estimatedDelivery || ''}"`,
      `"${(c.assignedProducts || []).map((p) => `${p.name} (${p.variant || ''})`).join('; ')}"`,
      c.totalBarterValue || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `barter_creators_${campaign.id}_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="barter-modal-overlay" onClick={onClose}>
      <div
        className="barter-modal-dialog fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="barter-modal-title"
      >
        {/* Modal Header */}
        <div className="barter-modal__header">
          <div className="barter-modal__title-box">
            <div className="barter-modal__header-badge">
              <PackageCheck size={14} />
              <span>Barter Product Deliveries & Creator Roster</span>
            </div>
            <h2 id="barter-modal-title" className="barter-modal__title">
              {campaign.name}
            </h2>
            <p className="barter-modal__subtitle">
              Tracking creator registrations, product dispatch packages, courier AWBs, and delivery verifications.
            </p>
          </div>

          <button
            type="button"
            className="barter-modal__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close modal (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Filter Tabs */}
        <div className="barter-modal__tabs">
          <button
            type="button"
            className={`barter-modal__tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('all');
              setSubStatusFilter('all');
            }}
          >
            <Package size={15} />
            <span>All Registered Creators</span>
            <span className="barter-modal__tab-pill">{totalRegistered}</span>
          </button>

          <button
            type="button"
            className={`barter-modal__tab barter-modal__tab--delivered ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('delivered');
              setSubStatusFilter('all');
            }}
          >
            <CheckCircle2 size={15} />
            <span>Products Got / Delivered</span>
            <span className="barter-modal__tab-pill barter-modal__tab-pill--green">{deliveredCount}</span>
          </button>

          <button
            type="button"
            className={`barter-modal__tab barter-modal__tab--pending ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pending');
              setSubStatusFilter('all');
            }}
          >
            <Truck size={15} />
            <span>Yet to Get Products</span>
            <span className="barter-modal__tab-pill barter-modal__tab-pill--amber">{yetToReceiveCount}</span>
          </button>
        </div>

        {/* Controls Toolbar: Search, Filters & Export */}
        <div className="barter-modal__toolbar">
          <div className="barter-modal__search-wrap">
            <Search size={16} className="barter-modal__search-icon" />
            <input
              type="text"
              className="barter-modal__search-input"
              placeholder="Search by creator name, @handle, AWB tracking number, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="barter-modal__search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="barter-modal__filters-group">
            {activeTab === 'pending' && (
              <select
                className="barter-modal__select"
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value)}
              >
                <option value="all">All Pending States</option>
                <option value="In Transit">In Transit</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Processing">Processing / Packing</option>
              </select>
            )}

            <select
              className="barter-modal__select"
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
            >
              <option value="all">All Couriers</option>
              <option value="BlueDart">BlueDart</option>
              <option value="Delhivery">Delhivery</option>
              <option value="DTDC">DTDC</option>
              <option value="Shadowfax">Shadowfax</option>
            </select>

            <button
              type="button"
              className="barter-modal__export-btn"
              onClick={handleExportCSV}
              title="Download CSV for warehouse & logistics"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Creator List Body */}
        <div className="barter-modal__body">
          {filteredCreators.length === 0 ? (
            <div className="barter-modal__empty">
              <Package size={40} />
              <h4>No creators found</h4>
              <p>No creators match your active filter and search criteria.</p>
              {(searchQuery || courierFilter !== 'all' || subStatusFilter !== 'all') && (
                <button
                  type="button"
                  className="barter-modal__reset-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setCourierFilter('all');
                    setSubStatusFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="barter-creator-list">
              {filteredCreators.map((creator) => {
                const isDelivered = creator.productReceived || creator.deliveryStatus === 'Delivered';
                const isInTransit = creator.deliveryStatus === 'In Transit';
                const isDispatched = creator.deliveryStatus === 'Dispatched';
                const isProcessing = creator.deliveryStatus === 'Processing';

                return (
                  <div
                    key={creator.id || creator.creatorId}
                    className={`barter-creator-card ${isDelivered ? 'barter-creator-card--delivered' : 'barter-creator-card--pending'}`}
                  >
                    {/* Top Row: Creator Details + Status Badge */}
                    <div className="barter-creator-card__header">
                      <div className="barter-creator-card__user">
                        <div
                          className="barter-creator-card__avatar"
                          style={{ background: creator.avatarColor || 'var(--hp-primary)' }}
                        >
                          {getInitials(creator.name)}
                        </div>
                        <div className="barter-creator-card__info">
                          <div className="barter-creator-card__name-row">
                            <span className="barter-creator-card__name">{creator.name}</span>
                            <a
                              href={getSocialUrl(creator.platform, creator.socialHandle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="barter-creator-card__handle"
                              title={`Open ${creator.platform} profile`}
                            >
                              <span>{creator.socialHandle}</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                          <div className="barter-creator-card__meta">
                            <span>{formatNumber(creator.followerCount)} followers</span>
                            <span className="meta-sep">•</span>
                            <span>{creator.shippingCity}</span>
                            <span className="meta-sep">•</span>
                            <span>Registered: {creator.registeredAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="barter-creator-card__status-wrap">
                        {isDelivered && (
                          <div className="delivery-badge delivery-badge--delivered">
                            <CheckCircle2 size={14} />
                            <div>
                              <strong>Products Delivered</strong>
                              <div className="delivery-badge__sub">Delivered {creator.deliveredAt}</div>
                            </div>
                          </div>
                        )}
                        {isInTransit && (
                          <div className="delivery-badge delivery-badge--transit">
                            <Truck size={14} />
                            <div>
                              <strong>In Transit</strong>
                              <div className="delivery-badge__sub">ETA: {creator.estimatedDelivery}</div>
                            </div>
                          </div>
                        )}
                        {isDispatched && (
                          <div className="delivery-badge delivery-badge--dispatched">
                            <Package size={14} />
                            <div>
                              <strong>Dispatched</strong>
                              <div className="delivery-badge__sub">Shipped {creator.dispatchedAt}</div>
                            </div>
                          </div>
                        )}
                        {isProcessing && (
                          <div className="delivery-badge delivery-badge--processing">
                            <Clock size={14} />
                            <div>
                              <strong>Processing</strong>
                              <div className="delivery-badge__sub">Warehouse Packing</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Logistics & Products Box */}
                    <div className="barter-creator-card__logistics">
                      <div className="barter-creator-card__courier-info">
                        <div className="logistics-item">
                          <span className="logistics-item__label">Courier:</span>
                          <span className="logistics-item__val logistics-item__val--courier">
                            {creator.courierPartner}
                          </span>
                        </div>

                        <div className="logistics-item">
                          <span className="logistics-item__label">Tracking AWB:</span>
                          <span className="logistics-item__val logistics-item__val--awb">
                            <code>{creator.trackingNumber}</code>
                            <button
                              type="button"
                              className="copy-awb-btn"
                              onClick={() => handleCopyAWB(creator.trackingNumber)}
                              title="Copy Tracking AWB"
                            >
                              {copiedAWB === creator.trackingNumber ? (
                                <Check size={12} className="copy-success" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </span>
                        </div>

                        {creator.proofOfDelivery && (
                          <div className="logistics-item">
                            <span className="logistics-item__label">Receipt / POD:</span>
                            <span className="logistics-item__val logistics-item__val--pod">
                              {creator.proofOfDelivery}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Products Sent */}
                      <div className="barter-creator-card__products">
                        <span className="barter-products__label">Dispatched Items:</span>
                        <div className="barter-products__chips">
                          {(creator.assignedProducts || []).map((prod, pIdx) => (
                            <span key={pIdx} className="product-chip">
                              <Package size={11} />
                              <strong>{prod.name}</strong>
                              <span className="product-chip__variant">({prod.variant})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Action to open Creator Details */}
                    <div className="barter-creator-card__footer">
                      <span className="barter-creator-card__value-tag">
                        Kit Value: <strong>₹{creator.totalBarterValue?.toLocaleString('en-IN') || '6,798'}</strong>
                      </span>
                      <button
                        type="button"
                        className="barter-creator-card__profile-link"
                        onClick={() => {
                          onClose();
                          navigate(`/campaigns/${campaign.id}/creators/${creator.creatorId || creator.id}`);
                        }}
                      >
                        <span>View Creator Performance Analytics</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Summary */}
        <div className="barter-modal__footer">
          <div className="barter-modal__footer-stats">
            <span>Showing <strong>{filteredCreators.length}</strong> of {totalRegistered} creators</span>
            <span className="footer-sep">•</span>
            <span className="footer-highlight-green">{deliveredCount} got products</span>
            <span className="footer-sep">•</span>
            <span className="footer-highlight-amber">{yetToReceiveCount} pending delivery</span>
          </div>

          <button type="button" className="barter-modal__done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
