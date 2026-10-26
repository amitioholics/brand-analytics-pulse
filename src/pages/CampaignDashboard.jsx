import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, FileText, Radio, Eye, Heart, Sparkles,
  ArrowUpDown, ExternalLink, Package, TrendingUp, Receipt, Search
} from 'lucide-react';
import { getCampaignById } from '../data/campaigns';
import { getCreatorsForCampaign } from '../data/creators';
import { getProductSalesForCampaign } from '../data/productSales';
import { formatDate, formatDateRange, formatNumber, formatCompactNumber, formatCurrency, getInitials } from '../utils/formatters';
import CampaignVideoDeliverables from '../components/campaign/CampaignVideoDeliverables';
import CampaignReimbursementsSection from '../components/campaign/CampaignReimbursementsSection';
import PGLogo from '../components/common/PGLogo';
import './CampaignDashboard.css';

function InstagramIcon({ size = 11, color = '#db2777' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ size = 11, color = '#dc2626' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function CampaignDashboard() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  // Active campaign
  const campaign = getCampaignById(campaignId);

  // Smooth scroll to deliverables section if hash is #deliverables
  useEffect(() => {
    const scrollToDeliverables = () => {
      if (window.location.hash === '#deliverables') {
        const el = document.getElementById('deliverables');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    scrollToDeliverables();
    const timer = setTimeout(scrollToDeliverables, 250);
    window.addEventListener('hashchange', scrollToDeliverables);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', scrollToDeliverables);
    };
  }, []);

  // Product Sales data for this campaign
  const campaignSalesData = useMemo(() => {
    return getProductSalesForCampaign(campaignId);
  }, [campaignId]);

  // Platform Breakdown
  const platformRows = [
    { platform: 'Instagram', livePosts: 0, views: 0, likes: 0, comments: 0, shares: 0, followers: 0, er: '0.0%' },
    { platform: 'YouTube', livePosts: 0, views: 0, likes: 0, comments: 0, shares: 0, followers: 0, er: '0.0%' },
    { platform: 'Facebook', livePosts: 0, views: 0, likes: 0, comments: 0, shares: 0, followers: 0, er: '0.0%' },
  ];

  // Product Sales & Creators table search, sort & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [salesSortField, setSalesSortField] = useState('sales');
  const [salesSortDir, setSalesSortDir] = useState('desc');
  const [salesPage, setSalesPage] = useState(1);
  const salesPageSize = 10;

  const handleSalesSort = (field) => {
    if (salesSortField === field) {
      setSalesSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSalesSortField(field);
      setSalesSortDir(field === 'name' ? 'asc' : 'desc');
    }
    setSalesPage(1);
  };

  const filteredSalesCreators = useMemo(() => {
    const list = campaignSalesData.creatorsList;
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(cr => {
      const matchName = (cr.name || '').toLowerCase().includes(q);
      const matchHandle = (cr.handle || '').toLowerCase().includes(q);
      const matchPlatform = (cr.platforms || []).some(p =>
        (p.label || '').toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q)
      );
      return matchName || matchHandle || matchPlatform;
    });
  }, [campaignSalesData.creatorsList, searchQuery]);

  const sortedSalesCreators = useMemo(() => {
    const list = [...filteredSalesCreators];
    list.sort((a, b) => {
      let valA = a[salesSortField];
      let valB = b[salesSortField];

      if (salesSortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return salesSortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (salesSortField === 'content' || salesSortField === 'deliverables') {
        valA = a.content ?? a.deliverables ?? 0;
        valB = b.content ?? b.deliverables ?? 0;
        return salesSortDir === 'asc' ? valA - valB : valB - valA;
      }
      if (salesSortField === 'views' || salesSortField === 'reach') {
        valA = a.views ?? a.reach ?? 0;
        valB = b.views ?? b.reach ?? 0;
        return salesSortDir === 'asc' ? valA - valB : valB - valA;
      }
      if (valA === undefined) valA = 0;
      if (valB === undefined) valB = 0;
      return salesSortDir === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [filteredSalesCreators, salesSortField, salesSortDir]);

  const salesTotalPages = Math.ceil(sortedSalesCreators.length / salesPageSize) || 1;
  const paginatedSalesCreators = useMemo(() => {
    const start = (salesPage - 1) * salesPageSize;
    return sortedSalesCreators.slice(start, start + salesPageSize);
  }, [sortedSalesCreators, salesPage, salesPageSize]);

  if (!campaign) {
    return (
      <div className="campaign-pulse fade-in">
        <p>Campaign not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/campaigns')}>
          Back to Campaigns
        </button>
      </div>
    );
  }

  // Top KPI numbers matching Screenshot 1 & 2
  const registeredCount = campaignSalesData.totals.activeCreators || 695;
  const deliverablesCount = 418;
  const livePostsCount = 0;
  const totalViews = 0;
  const totalEngagements = 0;
  const avgEngagementRate = '0.0';

  return (
    <div className="campaign-pulse fade-in">
      {/* Breadcrumb Navigation */}
      <div className="campaign-pulse__breadcrumbs">
        <span
          className="campaign-pulse__breadcrumb-link"
          onClick={() => navigate('/campaigns')}
        >
          Campaigns
        </span>
        <span className="campaign-pulse__breadcrumb-sep">&gt;</span>
        <span className="campaign-pulse__breadcrumb-current">{campaign.name}</span>
      </div>

      {/* Campaign Header Row */}
      <div className="campaign-pulse__header">
        <div
          className="campaign-pulse__header-thumb"
          style={{
            width: '68px',
            height: '42px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            flexShrink: 0,
            background: '#5b21b6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={campaign.imageUrl || '/campaign-banner.png'}
            alt={campaign.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div className="campaign-pulse__header-info">
          <div className="campaign-pulse__title-line">
            <h1 className="campaign-pulse__title">{campaign.name}</h1>
            <span className="campaign-pulse__status-badge">
              {campaign.status || 'Active'}
            </span>
          </div>

          <div className="campaign-pulse__meta-line">
            <span className="campaign-pulse__dates">
              {formatDateRange(campaign.startDate, campaign.endDate)}
            </span>
            <span className="campaign-pulse__type-pill">
              {campaign.compensationType || 'Paid Collab'}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="campaign-pulse__kpi-grid">
        {/* 1. REGISTERED CREATORS */}
        <div className="campaign-pulse__kpi-card">
          <div className="campaign-pulse__kpi-top">
            <div className="campaign-pulse__kpi-icon-box">
              <Users size={16} />
            </div>
            <span className="campaign-pulse__kpi-label">REGISTERED CREATORS</span>
          </div>
          <div className="campaign-pulse__kpi-val">{formatNumber(registeredCount)}</div>
        </div>

        {/* 2. CONTENT */}
        <div className="campaign-pulse__kpi-card">
          <div className="campaign-pulse__kpi-top">
            <div className="campaign-pulse__kpi-icon-box">
              <FileText size={16} />
            </div>
            <span className="campaign-pulse__kpi-label">CONTENT</span>
          </div>
          <div className="campaign-pulse__kpi-val">{formatNumber(deliverablesCount)}</div>
        </div>

        {/* 3. LIVE POSTS */}
        <div className="campaign-pulse__kpi-card">
          <div className="campaign-pulse__kpi-top">
            <div className="campaign-pulse__kpi-icon-box">
              <Radio size={16} />
            </div>
            <span className="campaign-pulse__kpi-label">LIVE POSTS</span>
          </div>
          <div className="campaign-pulse__kpi-val">{formatNumber(livePostsCount)}</div>
        </div>

        {/* 4. VIEWS */}
        <div className="campaign-pulse__kpi-card">
          <div className="campaign-pulse__kpi-top">
            <div className="campaign-pulse__kpi-icon-box">
              <Eye size={16} />
            </div>
            <span className="campaign-pulse__kpi-label">VIEWS</span>
          </div>
          <div className="campaign-pulse__kpi-val">{formatCompactNumber(totalViews)}</div>
        </div>

        {/* 5. ENGAGEMENTS */}
        <div className="campaign-pulse__kpi-card">
          <div className="campaign-pulse__kpi-top">
            <div className="campaign-pulse__kpi-icon-box">
              <Heart size={16} />
            </div>
            <span className="campaign-pulse__kpi-label">ENGAGEMENTS</span>
          </div>
          <div className="campaign-pulse__kpi-val">{formatCompactNumber(totalEngagements)}</div>
          <div className="campaign-pulse__kpi-subtext">
            0 likes • 0 comments • 0 shares
          </div>
        </div>

        {/* 6. AVG. ENGAGEMENT RATE */}
        <div className="campaign-pulse__kpi-card">
          <div className="campaign-pulse__kpi-top">
            <div className="campaign-pulse__kpi-icon-box">
              <Sparkles size={16} />
            </div>
            <span className="campaign-pulse__kpi-label">AVG. ENGAGEMENT RATE</span>
          </div>
          <div className="campaign-pulse__kpi-val">{avgEngagementRate}%</div>
        </div>
      </div>

      {/* 1. Platform Breakdown Card */}
      <div className="campaign-pulse__card">
        <h2 className="campaign-pulse__card-title">Platform Breakdown</h2>
        <div className="campaign-pulse__table-container">
          <table className="campaign-pulse__table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>PLATFORM</th>
                <th style={{ textAlign: 'right' }}>LIVE POSTS</th>
                <th style={{ textAlign: 'right' }}>VIEWS</th>
                <th style={{ textAlign: 'right' }}>LIKES</th>
                <th style={{ textAlign: 'right' }}>COMMENTS</th>
                <th style={{ textAlign: 'right' }}>SHARES</th>
                <th style={{ textAlign: 'right' }}>FOLLOWERS</th>
                <th style={{ textAlign: 'right' }}>ER</th>
              </tr>
            </thead>
            <tbody>
              {platformRows.map(row => (
                <tr key={row.platform}>
                  <td style={{ textAlign: 'left', fontWeight: 600, color: '#111827' }}>
                    {row.platform}
                  </td>
                  <td style={{ textAlign: 'right' }}>{row.livePosts}</td>
                  <td style={{ textAlign: 'right' }}>{row.views}</td>
                  <td style={{ textAlign: 'right' }}>{row.likes}</td>
                  <td style={{ textAlign: 'right' }}>{row.comments}</td>
                  <td style={{ textAlign: 'right' }}>{row.shares}</td>
                  <td style={{ textAlign: 'right' }}>{row.followers}</td>
                  <td style={{ textAlign: 'right' }}>{row.er}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Sales Metrics & Conversion Card matching Screenshot 1 & 2 */}
      {campaignSalesData.creatorsList.length > 0 && (
        <div className="campaign-pulse__card campaign-pulse__sales-card">
          <div className="campaign-pulse__sales-header">
            <div className="campaign-pulse__sales-title-wrap">
              <h2 className="campaign-pulse__sales-title">
                <Users size={18} color="var(--hp-primary, #6538ea)" />
                <span>Creator Performance & Sales Metrics</span>
              </h2>
              <p className="campaign-pulse__sales-subtitle">
                Creator content deliverables, views, units sold, and gross sales value attributed in this campaign.
              </p>
            </div>
            <div className="campaign-pulse__sales-header-actions">
              <div className="campaign-pulse__sales-search-wrap">
                <Search size={14} className="campaign-pulse__sales-search-icon" />
                <input
                  type="text"
                  className="campaign-pulse__sales-search-input"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSalesPage(1);
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="campaign-pulse__sales-search-clear"
                    onClick={() => {
                      setSearchQuery('');
                      setSalesPage(1);
                    }}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="campaign-pulse__sales-kpis">
            <div className="campaign-pulse__sales-kpi-card">
              <div className="campaign-pulse__sales-kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="campaign-pulse__sales-kpi-label">GROSS SALES VALUE</div>
                <div className="campaign-pulse__sales-kpi-val" style={{ color: '#059669' }}>
                  {formatCurrency(campaignSalesData.totals.totalSalesValue)}
                </div>
              </div>
            </div>

            <div className="campaign-pulse__sales-kpi-card">
              <div className="campaign-pulse__sales-kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <Package size={18} />
              </div>
              <div>
                <div className="campaign-pulse__sales-kpi-label">UNITS SOLD</div>
                <div className="campaign-pulse__sales-kpi-val">
                  {campaignSalesData.totals.totalUnitsSold}
                </div>
              </div>
            </div>

            <div className="campaign-pulse__sales-kpi-card">
              <div className="campaign-pulse__sales-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Users size={18} />
              </div>
              <div>
                <div className="campaign-pulse__sales-kpi-label">CREATORS</div>
                <div className="campaign-pulse__sales-kpi-val">
                  {campaignSalesData.totals.activeCreators}
                </div>
              </div>
            </div>

            <div className="campaign-pulse__sales-kpi-card">
              <div className="campaign-pulse__sales-kpi-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
                <Receipt size={18} />
              </div>
              <div>
                <div className="campaign-pulse__sales-kpi-label">AVG. ORDER VALUE</div>
                <div className="campaign-pulse__sales-kpi-val">
                  {formatCurrency(campaignSalesData.totals.avgOrderValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="campaign-pulse__table-container">
            <table className="campaign-pulse__table campaign-pulse__table--product-sales">
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                  <th
                    style={{ textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSalesSort('name')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>CREATOR</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'left' }}>PLATFORMS</th>
                  <th
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSalesSort('content')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>CONTENT</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSalesSort('views')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>VIEWS</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSalesSort('unitsSold')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>UNITS SOLD</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSalesSort('sales')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>SALES</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSalesCreators.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '42px 16px', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <Search size={28} color="#94a3b8" />
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                          No creators found matching "{searchQuery}"
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Try checking for typos or searching by creator name, social handle, or platform.
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSearchQuery(''); setSalesPage(1); }}
                          style={{
                            marginTop: 6,
                            padding: '5px 14px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#6538ea',
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Clear search
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSalesCreators.map((cr, idx) => {
                    const rankNum = (salesPage - 1) * salesPageSize + idx + 1;
                    return (
                      <tr
                        key={cr.creatorId}
                        className="campaign-pulse__sales-creator-row"
                        onClick={() => navigate(`/creators/${cr.creatorId}`)}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <span className="campaign-pulse__rank-badge">
                            #{rankNum}
                          </span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <div className="campaign-pulse__creator-flex">
                            {cr.avatarUrl ? (
                              <img
                                src={cr.avatarUrl}
                                alt={cr.name}
                                className="campaign-pulse__creator-img"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="campaign-pulse__creator-avatar-fallback"
                              style={{
                                background: cr.avatarColor || '#6538ea',
                                display: cr.avatarUrl ? 'none' : 'flex'
                              }}
                            >
                              {getInitials(cr.name)}
                            </div>
                            <div>
                              <div className="campaign-pulse__creator-name">{cr.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <div className="campaign-pulse__platforms-cell">
                            {cr.platforms && cr.platforms.length > 0 ? (
                              cr.platforms.map((p, pIdx) => {
                                const isIG = p.type === 'instagram';
                                return (
                                  <span
                                    key={pIdx}
                                    className={`campaign-pulse__plat-pill campaign-pulse__plat-pill--${isIG ? 'ig' : 'yt'}`}
                                  >
                                    {isIG ? <InstagramIcon size={12} /> : <YouTubeIcon size={12} />}
                                    <span>{p.label}</span>
                                  </span>
                                );
                              })
                            ) : (
                              <span className="campaign-pulse__plat-pill campaign-pulse__plat-pill--ig">
                                <InstagramIcon size={12} />
                                <span>{cr.handle || '@creator'}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: '#475569' }}>
                          {cr.content ?? cr.deliverables ?? 0}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: '#475569' }}>
                          {formatNumber(cr.views ?? cr.reach ?? 0)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          {cr.unitsSold || 0}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '13.5px' }}>
                          {formatCurrency(cr.sales || 0)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {salesTotalPages > 1 && (
            <div className="campaign-pulse__pagination">
              <span className="campaign-pulse__page-info">
                Showing {(salesPage - 1) * salesPageSize + 1} to {Math.min(salesPage * salesPageSize, sortedSalesCreators.length)} of {sortedSalesCreators.length} {searchQuery.trim() ? 'matching ' : ''}creators
              </span>
              <div className="campaign-pulse__page-buttons">
                <button
                  type="button"
                  className="campaign-pulse__pagination-btn"
                  disabled={salesPage <= 1}
                  onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="campaign-pulse__page-indicator">
                  Page {salesPage} of {salesTotalPages}
                </span>
                <button
                  type="button"
                  className="campaign-pulse__pagination-btn"
                  disabled={salesPage >= salesTotalPages}
                  onClick={() => setSalesPage(p => Math.min(salesTotalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Systematic Content and Video Approvals Section */}
      <CampaignVideoDeliverables campaignId={campaignId} campaignName={campaign.name} />

      {/* Creator Reimbursements & Invoices Section */}
      <CampaignReimbursementsSection campaignId={campaignId} />
    </div>
  );
}
