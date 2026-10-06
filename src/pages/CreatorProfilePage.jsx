import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileVideo, Eye, MousePointerClick, ShoppingCart,
  ExternalLink, LinkIcon, ArrowLeft, ArrowUpRight, Layers,
  Package, TrendingUp, BarChart2
} from 'lucide-react';
import { getCreatorById } from '../data/creators';
import { getCreatorOverallMetrics, getCreatorCampaignBreakdown } from '../data/metrics';
import { getAggregatedProductSales, getProductById } from '../data/productSales';
import { getAllContentForCreator } from '../data/content';
import { formatNumber, formatCurrency, formatPercent, formatDate, getInitials, getSocialUrl } from '../utils/formatters';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import ContentDetailDrawer from '../components/content/ContentDetailDrawer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { usePortal } from '../context/PortalContext';
import './CreatorProfilePage.css';

const CHART_METRICS = [
  { key: 'views', label: 'Views', color: '#655bef', format: formatNumber },
  { key: 'clicks', label: 'Clicks', color: '#10b981', format: formatNumber },
  { key: 'sales', label: 'Sales (₹)', color: '#059669', format: formatCurrency },
];

export default function CreatorProfilePage() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { portal, currentConfig, isBrandConnect } = usePortal();

  const [activeChartMetric, setActiveChartMetric] = useState('views');
  const [contentSearch, setContentSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [creatorPerfTab, setCreatorPerfTab] = useState('content'); // 'content' | 'product'

  const creator = useMemo(() => getCreatorById(creatorId), [creatorId]);
  const overallMetrics = useMemo(() => getCreatorOverallMetrics(creatorId, portal), [creatorId, portal]);
  const campaignBreakdown = useMemo(() => getCreatorCampaignBreakdown(creatorId, portal), [creatorId, portal]);
  const allContent = useMemo(() => getAllContentForCreator(creatorId, portal), [creatorId, portal]);

  // Product sales for THIS creator only
  const creatorProductRows = useMemo(() => {
    const all = getAggregatedProductSales(portal);
    return all.filter(r => r.creatorId === creatorId);
  }, [creatorId, portal]);

  const creatorProductTotals = useMemo(() => ({
    unitsSold:  creatorProductRows.reduce((s, r) => s + r.unitsSold,  0),
    salesValue: creatorProductRows.reduce((s, r) => s + r.salesValue, 0),
    orders:     creatorProductRows.reduce((s, r) => s + r.orders,     0),
    products:   new Set(creatorProductRows.map(r => r.productId)).size,
  }), [creatorProductRows]);

  // Chart data comparing each campaign
  const campaignComparisonData = useMemo(() => {
    return campaignBreakdown.map(item => ({
      name: item.campaign.name.length > 24 ? item.campaign.name.slice(0, 22) + '…' : item.campaign.name,
      fullName: item.campaign.name,
      views: item.views,
      clicks: item.clicks,
      sales: item.sales,
      orders: item.orders,
      contentCount: item.contentCount,
    }));
  }, [campaignBreakdown]);

  // Filtered content list
  const filteredContent = useMemo(() => {
    let list = allContent;
    if (campaignFilter) {
      list = list.filter(c => c.campaignId === campaignFilter);
    }
    if (contentSearch) {
      const q = contentSearch.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }
    return list;
  }, [allContent, campaignFilter, contentSearch]);

  const activeMetricObj = CHART_METRICS.find(m => m.key === activeChartMetric) || CHART_METRICS[0];

  if (!creator) {
    return (
      <div className="fade-in" style={{ padding: 'var(--space-8)' }}>
        <p>Creator not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/creators')}>
          ← Back to Creators
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in creator-profile-page">
      {/* Back button */}
      <button className="creator-profile-page__back" onClick={() => navigate('/creators')}>
        <ArrowLeft size={16} />
        Back to Creators
      </button>

      {/* Creator Header Card */}
      <div className="creator-profile-page__header-card">
        <div className="creator-profile-page__avatar" style={{ background: creator.avatarColor || 'var(--hp-primary)' }}>
          {getInitials(creator.name)}
        </div>
        <div className="creator-profile-page__meta">
          <div className="creator-profile-page__title-row">
            <h1 className="creator-profile-page__name">{creator.name}</h1>
            <span className="creator-profile-page__badge">
              <Layers size={14} />
              Participated in {overallMetrics.campaignsCount} {overallMetrics.campaignsCount === 1 ? (isBrandConnect ? 'Collab' : 'Campaign') : (isBrandConnect ? 'Collabs' : 'Campaigns')}
            </span>
          </div>
          <div className="creator-profile-page__sub">
            <a
              href={getSocialUrl(creator.platform, creator.socialHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className="creator-profile-page__handle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--hp-primary)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              title={`Open ${creator.name}'s ${creator.platform} profile`}
            >
              <span>{creator.socialHandle}</span>
              <ExternalLink size={12} />
            </a>
            <span className="creator-profile-page__sep">•</span>
            <a
              href={getSocialUrl(creator.platform, creator.socialHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className="creator-profile-page__platform"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                color: 'var(--hp-text-secondary)',
                textDecoration: 'none',
              }}
              title={`Open on ${creator.platform}`}
            >
              <span>{creator.platform}</span>
            </a>
            <span className="creator-profile-page__sep">•</span>
            <span className="creator-profile-page__followers">{formatNumber(creator.followerCount)} followers</span>
          </div>
        </div>
      </div>

      {/* Cumulative KPI Cards */}
      <div className="creator-profile-page__kpis">
        <KPICard
          icon={Layers}
          label={isBrandConnect ? 'Collabs Participated' : 'Campaigns Participated'}
          value={`${overallMetrics.campaignsCount} ${overallMetrics.campaignsCount === 1 ? (isBrandConnect ? 'Collab' : 'Campaign') : (isBrandConnect ? 'Collabs' : 'Campaigns')}`}
          change={`In ${currentConfig.name}`}
          positive={true}
        />
        <KPICard
          icon={FileVideo}
          label={isBrandConnect ? 'Total Deliverables' : 'Total Content Created'}
          value={formatNumber(overallMetrics.contentCount)}
          change={`In ${currentConfig.name}`}
        />
        <KPICard
          icon={Eye}
          label={isBrandConnect ? 'Total Reach' : 'Total Views'}
          value={formatNumber(overallMetrics.views)}
          change={`Avg ${(overallMetrics.avgViewsPerContent / 1000).toFixed(1)}k / post`}
          positive={true}
        />
        <KPICard
          icon={MousePointerClick}
          label={isBrandConnect ? 'Creator Engagements' : 'Total Clicks'}
          value={formatNumber(overallMetrics.clicks)}
          change={`CTR: ${overallMetrics.conversionRate}%`}
          positive={true}
        />
        <KPICard
          icon={ShoppingCart}
          label={isBrandConnect ? 'Total Media Value' : 'Total Sales Generated'}
          value={formatCurrency(overallMetrics.sales)}
          change={`In ${currentConfig.name}`}
          positive={true}
        />
      </div>

      {/* Campaign Participation Breakdown Cards */}
      <div className="creator-profile-page__section">
        <div className="creator-profile-page__section-header">
          <div>
            <h2 className="creator-profile-page__section-title">
              Campaign Participation & Analytics
            </h2>
            <p className="creator-profile-page__section-subtitle">
              Detailed performance metrics across all {overallMetrics.campaignsCount} Myntra campaigns
            </p>
          </div>
          {/* ── Performance tab toggle ── */}
          <div className="cp-perf-tabs">
            <button
              className={`cp-perf-tab ${creatorPerfTab === 'content' ? 'cp-perf-tab--active' : ''}`}
              onClick={() => setCreatorPerfTab('content')}
            >
              <BarChart2 size={14} />
              Content Performance
            </button>
            <button
              className={`cp-perf-tab ${creatorPerfTab === 'product' ? 'cp-perf-tab--active' : ''}`}
              onClick={() => setCreatorPerfTab('product')}
            >
              <Package size={14} />
              Product Sales
            </button>
          </div>
        </div>

        {/* ── Content Performance (existing campaign cards) ── */}
        {creatorPerfTab === 'content' && (
          <div className="creator-campaign-grid fade-in">
            {campaignBreakdown.map(item => (
              <div key={item.campaign.id} className="creator-campaign-card">
                <div className="creator-campaign-card__header">
                  <div>
                    <div className="creator-campaign-card__status-row">
                      <StatusBadge status={item.campaign.status} />
                      <span className="creator-campaign-card__dates">
                        {formatDate(item.campaign.startDate)} – {formatDate(item.campaign.endDate)}
                      </span>
                    </div>
                    <h3 className="creator-campaign-card__title">{item.campaign.name}</h3>
                  </div>
                </div>
                <p className="creator-campaign-card__desc">{item.campaign.description}</p>
                <div className="creator-campaign-card__stats-grid">
                  <div className="creator-campaign-card__stat">
                    <span className="creator-campaign-card__stat-label">Content</span>
                    <span className="creator-campaign-card__stat-val">{item.contentCount} pieces</span>
                  </div>
                  <div className="creator-campaign-card__stat">
                    <span className="creator-campaign-card__stat-label">Views</span>
                    <span className="creator-campaign-card__stat-val">{formatNumber(item.views)}</span>
                  </div>
                  <div className="creator-campaign-card__stat">
                    <span className="creator-campaign-card__stat-label">Clicks</span>
                    <span className="creator-campaign-card__stat-val">{formatNumber(item.clicks)}</span>
                  </div>
                  <div className="creator-campaign-card__stat">
                    <span className="creator-campaign-card__stat-label">CTR</span>
                    <span className="creator-campaign-card__stat-val">{item.conversionRate}%</span>
                  </div>
                  <div className="creator-campaign-card__stat highlight">
                    <span className="creator-campaign-card__stat-label">Sales Generated</span>
                    <span className="creator-campaign-card__stat-val">{formatCurrency(item.sales)}</span>
                  </div>
                </div>
                <div className="creator-campaign-card__footer">
                  <Link
                    to={`/campaigns/${item.campaign.id}/creators/${creator.id}`}
                    className="btn btn-secondary creator-campaign-card__cta"
                  >
                    <span>Open Campaign Deep Dive</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Product Sales view ── */}
        {creatorPerfTab === 'product' && (
          <div className="cp-product-sales fade-in">
            {/* Mini KPI strip */}
            <div className="cp-product-kpis">
              <div className="cp-product-kpi">
                <div className="cp-product-kpi__icon" style={{ background: '#ede9fe' }}>
                  <Package size={18} color="#6538ea" />
                </div>
                <div>
                  <div className="cp-product-kpi__label">Orders</div>
                  <div className="cp-product-kpi__val">{formatNumber(creatorProductTotals.unitsSold)}</div>
                </div>
              </div>
              <div className="cp-product-kpi">
                <div className="cp-product-kpi__icon" style={{ background: '#ecfdf5' }}>
                  <TrendingUp size={18} color="#059669" />
                </div>
                <div>
                  <div className="cp-product-kpi__label">Sales Value</div>
                  <div className="cp-product-kpi__val" style={{ color: '#059669' }}>{formatCurrency(creatorProductTotals.salesValue)}</div>
                </div>
              </div>
              <div className="cp-product-kpi">
                <div className="cp-product-kpi__icon" style={{ background: '#eff6ff' }}>
                  <Layers size={18} color="#3b82f6" />
                </div>
                <div>
                  <div className="cp-product-kpi__label">Products</div>
                  <div className="cp-product-kpi__val" style={{ color: '#3b82f6' }}>{creatorProductTotals.products}</div>
                </div>
              </div>
            </div>

            {creatorProductRows.length === 0 ? (
              <div className="cp-product-empty">
                <Package size={32} color="var(--hp-text-tertiary)" />
                <p>No product sales tracked for this creator yet.</p>
              </div>
            ) : (
              <div className="cp-product-table-wrap">
                <table className="analytics__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Orders</th>
                      <th style={{ textAlign: 'right' }}>Sales Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creatorProductRows.map((row, idx) => (
                      <tr key={row.productId}>
                        <td>
                          <div
                            className="analytics__prod-rank"
                            style={{ background: idx < 3 ? '#ede9fe' : 'var(--hp-bg)' }}
                          >
                            <span style={{ color: idx < 3 ? '#6538ea' : 'var(--hp-text-tertiary)', fontWeight: 700, fontSize: '0.7rem' }}>#{idx + 1}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{row.productName}</div>
                        </td>
                        <td>
                          <span className="analytics__table-tag">{row.productCategory}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatNumber(row.unitsSold)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{formatCurrency(row.salesValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cross-Campaign Performance Chart */}
      <div className="creator-profile-page__section">
        <div className="creator-chart-container">
          <div className="creator-chart-header">
            <div>
              <h3 className="creator-chart-title">Cross-Campaign Performance Comparison</h3>
              <p className="creator-chart-subtitle">Compare performance metrics across participating campaigns</p>
            </div>
            <div className="creator-chart-tabs">
              {CHART_METRICS.map(m => (
                <button
                  key={m.key}
                  className={`creator-chart-tab ${activeChartMetric === m.key ? 'active' : ''}`}
                  onClick={() => setActiveChartMetric(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--hp-border-subtle)" />
                <XAxis dataKey="name" stroke="var(--hp-text-tertiary)" fontSize={12} />
                <YAxis
                  stroke="var(--hp-text-tertiary)"
                  fontSize={12}
                  tickFormatter={activeMetricObj.format}
                />
                <Tooltip
                  formatter={(val) => [activeMetricObj.format(val), activeMetricObj.label]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                  contentStyle={{
                    background: 'var(--hp-bg-card)',
                    border: '1px solid var(--hp-border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Bar dataKey={activeChartMetric} fill={activeMetricObj.color} radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {campaignComparisonData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? 'var(--hp-primary)' : index === 1 ? '#10b981' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Creator All Content Section with Direct Links */}
      <div className="creator-profile-page__section">
        <div className="creator-profile-page__section-header">
          <div>
            <h2 className="creator-profile-page__section-title">
              Generated Content ({filteredContent.length})
            </h2>
            <p className="creator-profile-page__section-subtitle">
              All promotional videos and reels created with direct links to original posts
            </p>
          </div>
          <div className="creator-content-filters">
            <SearchBar placeholder="Search content title..." onSearch={setContentSearch} />
            <FilterDropdown
              label="All Campaigns"
              value={campaignFilter}
              onChange={setCampaignFilter}
              options={campaignBreakdown.map(item => ({
                value: item.campaign.id,
                label: item.campaign.name,
              }))}
            />
          </div>
        </div>

        <div className="creator-content-grid">
          {filteredContent.map(content => {
            const camp = campaignBreakdown.find(b => b.campaign.id === content.campaignId)?.campaign;
            return (
              <div
                key={content.id}
                className="creator-content-card"
                onClick={() => setSelectedContent(content)}
              >
                <div
                  className="creator-content-card__thumb"
                  style={{ background: content.thumbnailColor || '#e0e7ff' }}
                >
                  <FileVideo size={28} style={{ color: 'var(--hp-primary)', opacity: 0.85 }} />
                  <span className="creator-content-card__platform-badge">
                    {content.platform}
                  </span>
                </div>
                <div className="creator-content-card__body">
                  <div className="creator-content-card__camp-tag">
                    {camp?.name || 'Campaign'}
                  </div>
                  <h4 className="creator-content-card__title" title={content.title}>
                    {content.title}
                  </h4>
                  <div className="creator-content-card__date">
                    Published: {formatDate(content.publishedAt)}
                  </div>

                  <div className="creator-content-card__metrics">
                    <div>
                      <span className="label">Views</span>
                      <span className="val">{formatNumber(content.views)}</span>
                    </div>
                    <div>
                      <span className="label">Clicks</span>
                      <span className="val">{formatNumber(content.clicks)}</span>
                    </div>
                    <div>
                      <span className="label">Sales</span>
                      <span className="val">{formatCurrency(content.sales)}</span>
                    </div>
                  </div>

                  <div className="creator-content-card__actions" onClick={(e) => e.stopPropagation()}>
                    {content.contentUrl ? (
                      <a
                        href={content.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary creator-content-card__link-btn"
                      >
                        <ExternalLink size={13} />
                        <span>View Content</span>
                      </a>
                    ) : (
                      <span className="creator-content-card__no-link">
                        <LinkIcon size={13} />
                        URL Unavailable
                      </span>
                    )}
                    <button
                      className="btn btn-secondary creator-content-card__detail-btn"
                      onClick={() => setSelectedContent(content)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Drawer */}
      <ContentDetailDrawer
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
      />
    </div>
  );
}
