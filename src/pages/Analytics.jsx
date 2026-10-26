import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { campaigns } from '../data/campaigns';
import { getCampaignMetrics, getPlatformBreakdown } from '../data/metrics';
import { formatNumber, formatCurrency, formatCompactNumber, formatDate } from '../utils/formatters';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import {
  Users, FileVideo, Eye, ShoppingCart, MousePointerClick,
  ArrowUpRight, Sparkles, Smartphone, Video, Award, Target, TrendingUp,
  BarChart2, Package, Hash,
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getProductSalesKPIs, getProductWiseSales } from '../data/productSales';
import './Analytics.css';

const PLATFORM_COLORS = {
  Instagram: '#e1306c',
  YouTube: '#ff0000',
};

const METRIC_TABS = [
  { id: 'views', label: 'Views', color: '#6538ea', bg: '#f2edfc', icon: Eye },
  { id: 'clicks', label: 'Clicks', color: '#10b981', bg: '#e8fbf3', icon: MousePointerClick },
  { id: 'sales', label: 'Sales Driven', color: '#059669', bg: '#e8fbf3', icon: ShoppingCart },
  { id: 'contentCount', label: 'Content Count', color: '#3b82f6', bg: '#eff6ff', icon: FileVideo },
];

const TIME_RANGES = ['All Time', 'Last 30 Days', 'Last 14 Days', 'Last 7 Days'];

export default function Analytics() {
  const { portal, currentConfig, isBrandConnect } = usePortal();
  const [analyticsTab, setAnalyticsTab] = useState('contentPerformance');
  const [selectedMetric, setSelectedMetric] = useState('clicks');
  const [timeRange, setTimeRange] = useState('All Time');

  const productKPIs = useMemo(() => getProductSalesKPIs(), []);
  const productWiseList = useMemo(() => getProductWiseSales(), []);

  // Aggregated campaign metrics for current portal
  const portalCampaigns = useMemo(() => {
    return campaigns.filter(c => c.portalType === portal);
  }, [portal]);

  const allMetrics = useMemo(() => {
    return portalCampaigns.map(c => ({
      ...c,
      ...getCampaignMetrics(c.id),
    }));
  }, [portalCampaigns]);

  // Top level totals
  const totals = useMemo(() => {
    const creators = allMetrics.reduce((s, m) => s + m.creatorCount, 0);
    const content = allMetrics.reduce((s, m) => s + m.contentCount, 0);
    const views = allMetrics.reduce((s, m) => s + m.views, 0);
    const clicks = allMetrics.reduce((s, m) => s + m.clicks, 0);
    const sales = allMetrics.reduce((s, m) => s + m.sales, 0);
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const avgViewsPerContent = content > 0 ? Math.round(views / content) : 0;
    const avgClicksPerContent = content > 0 ? Math.round(clicks / content) : 0;
    const avgSalesPerContent = content > 0 ? Math.round(sales / content) : 0;
    const revenuePerClick = clicks > 0 ? (sales / clicks) : 0;

    return {
      creators,
      content,
      views,
      clicks,
      sales,
      ctr,
      avgViewsPerContent,
      avgClicksPerContent,
      avgSalesPerContent,
      revenuePerClick,
    };
  }, [allMetrics]);



  // Combined platform breakdown across campaigns
  const platformData = useMemo(() => {
    const combined = {};
    portalCampaigns.forEach(c => {
      const bd = getPlatformBreakdown(c.id);
      bd.forEach(p => {
        if (!combined[p.platform]) {
          combined[p.platform] = {
            platform: p.platform,
            count: 0,
            views: 0,
            clicks: 0,
            sales: 0,
          };
        }
        combined[p.platform].count += p.count;
        combined[p.platform].views += p.views;
        combined[p.platform].clicks += p.clicks;
        combined[p.platform].sales += p.sales;
      });
    });

    const totalViewsCombined = Object.values(combined).reduce((s, p) => s + p.views, 0);
    const totalContentCombined = Object.values(combined).reduce((s, p) => s + p.count, 0);

    return Object.values(combined).map(p => ({
      ...p,
      viewShare: totalViewsCombined > 0 ? ((p.views / totalViewsCombined) * 100).toFixed(1) : 0,
      contentShare: totalContentCombined > 0 ? ((p.count / totalContentCombined) * 100).toFixed(1) : 0,
      ctr: p.views > 0 ? ((p.clicks / p.views) * 100).toFixed(2) : 0,
    }));
  }, [portalCampaigns]);

  // Campaign comparison data for dynamic metric switcher
  const campaignCompareData = useMemo(() => {
    const totalVal = allMetrics.reduce((sum, m) => sum + (m[selectedMetric] || 0), 0);
    return allMetrics.map(m => {
      const val = m[selectedMetric] || 0;
      const share = totalVal > 0 ? ((val / totalVal) * 100).toFixed(1) : 0;
      return {
        id: m.id,
        name: m.name,
        shortName: m.name.replace('P&G ', '').replace('Myntra ', ''),
        value: val,
        share,
        status: m.status,
        creators: m.creatorCount,
      };
    });
  }, [allMetrics, selectedMetric]);

  // Current metric config
  const currentMetricConfig = METRIC_TABS.find(t => t.id === selectedMetric) || METRIC_TABS[0];

  const formatMetricVal = (val) => {
    if (selectedMetric === 'sales') return formatCurrency(val);
    return formatNumber(val);
  };

  return (
    <div className="analytics fade-in">
      {/* Page Header with Actions & Time Filter */}
      <div className="analytics__header">
        <div className="analytics__header-left">
          <div className="analytics__badge">
            <Sparkles size={14} />
            <span>Pulse • {currentConfig.name}</span>
          </div>
          <h1 className="analytics__title">Pulse</h1>
          <p className="analytics__subtitle">
            Holistic cross-campaign performance, creator distribution, audience funnel conversion, and platform revenue.
          </p>
        </div>
        <div className="analytics__header-right">
          <div className="analytics__time-filters">
            {TIME_RANGES.map(range => (
              <button
                key={range}
                className={`analytics__time-btn ${timeRange === range ? 'analytics__time-btn--active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Analytics Tab Switcher */}
      <div className="analytics__perf-header">
        <h2 className="analytics__perf-title">Performance Analytics</h2>
        <div className="analytics__perf-tabs">
          <button
            type="button"
            className={`analytics__perf-tab ${analyticsTab === 'content' ? 'analytics__perf-tab--active' : ''}`}
            onClick={() => setAnalyticsTab('content')}
          >
            <BarChart2 size={15} />
            <span>Content Performance</span>
          </button>
          <button
            type="button"
            className={`analytics__perf-tab ${analyticsTab === 'productSales' ? 'analytics__perf-tab--active' : ''}`}
            onClick={() => setAnalyticsTab('productSales')}
          >
            <Package size={15} />
            <span>Product Sales</span>
          </button>
        </div>
      </div>

      {analyticsTab === 'productSales' ? (
        <div className="analytics__product-section fade-in">
          {/* 3 KPI Summary Cards */}
          <div className="analytics__product-kpis">
            <div className="analytics__prod-kpi-card">
              <div className="analytics__prod-kpi-icon" style={{ background: '#f5f3ff', color: '#6538ea' }}>
                <Package size={22} />
              </div>
              <div>
                <div className="analytics__prod-kpi-label">TOTAL UNITS SOLD</div>
                <div className="analytics__prod-kpi-val">{productKPIs.totalUnitsSold}</div>
                <div className="analytics__prod-kpi-sub">Units sold across all products</div>
              </div>
            </div>

            <div className="analytics__prod-kpi-card">
              <div className="analytics__prod-kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="analytics__prod-kpi-label">TOTAL PRODUCT SALES VALUE</div>
                <div className="analytics__prod-kpi-val">₹3.9L</div>
                <div className="analytics__prod-kpi-sub">Gross GMV from tracked products</div>
              </div>
            </div>

            <div className="analytics__prod-kpi-card">
              <div className="analytics__prod-kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <Hash size={22} />
              </div>
              <div>
                <div className="analytics__prod-kpi-label">ACTIVE PRODUCTS</div>
                <div className="analytics__prod-kpi-val">{productKPIs.activeProducts}</div>
                <div className="analytics__prod-kpi-sub">Unique products with tracked sales</div>
              </div>
            </div>
          </div>

          {/* Overall Product Sales Overview Table */}
          <div className="analytics__card">
            <div className="analytics__card-header" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <h2 className="analytics__card-title">Overall Product Sales Overview</h2>
                <p className="analytics__card-subtitle">
                  Aggregated product sales performance across all campaigns — tracking volume, creator adoption, and gross revenue per product.
                </p>
              </div>
            </div>

            <div className="analytics__table-wrap">
              <table className="analytics__table">
                <thead>
                  <tr>
                    <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                    <th style={{ textAlign: 'left' }}>PRODUCT</th>
                    <th style={{ textAlign: 'left' }}>CATEGORY</th>
                    <th style={{ textAlign: 'left' }}>CAMPAIGN</th>
                    <th style={{ textAlign: 'right' }}>CREATORS</th>
                    <th style={{ textAlign: 'right' }}>UNITS SOLD</th>
                    <th style={{ textAlign: 'right' }}>SALES</th>
                  </tr>
                </thead>
                <tbody>
                  {productWiseList.map((prod, idx) => {
                    const catBg = prod.productCategory === 'Fashion' ? '#f5f3ff' : prod.productCategory === 'Footwear' ? '#fdf2f8' : '#eff6ff';
                    const catColor = prod.productCategory === 'Fashion' ? '#7c3aed' : prod.productCategory === 'Footwear' ? '#db2777' : '#2563eb';
                    return (
                      <tr key={prod.productId}>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: '#f5f3ff',
                            color: '#6538ea',
                          }}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {prod.productName}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: catBg,
                            color: catColor,
                          }}>
                            {prod.productCategory}
                          </span>
                        </td>
                        <td style={{ color: '#475569', fontSize: '13px' }}>
                          {prod.campaignName}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                          {prod.creatorCount}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                          {prod.unitsSold}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '13.5px' }}>
                          {formatCurrency(prod.salesValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-in">
          {/* 5 KPI Summary Cards */}
          <div className="analytics__kpis">
            <KPICard
              label="Total Creators"
              value={formatNumber(totals.creators)}
              icon={Users}
              accentColor="#6538ea"
            />
            <KPICard
              label="Total Content"
              value={formatNumber(totals.content)}
              icon={FileVideo}
              accentColor="#3b82f6"
            />
            <KPICard
              label="Total Views"
              value={formatNumber(totals.views)}
              icon={Eye}
              accentColor="#10b981"
            />
            <KPICard
              label="Total Clicks"
              value={formatNumber(totals.clicks)}
              icon={MousePointerClick}
              accentColor="#f59e0b"
            />
            <KPICard
              label="Total Sales Driven"
              value={formatCurrency(totals.sales)}
              icon={ShoppingCart}
              accentColor="#ec4899"
            />
          </div>

          {/* Campaign Comparison with Interactive Metric Tabs */}
          <div className="analytics__card analytics__campaign-compare">
            <div className="analytics__card-header">
              <div>
                <h2 className="analytics__card-title">Campaign Benchmark & Comparison</h2>
                <p className="analytics__card-subtitle">
                  Compare performance metrics across active and completed P&G programs.
                </p>
              </div>
              <div className="analytics__metric-tabs">
                {METRIC_TABS.map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = selectedMetric === tab.id;
                  return (
                    <button
                      key={tab.id}
                      className={`analytics__metric-tab ${isActive ? 'analytics__metric-tab--active' : ''}`}
                      onClick={() => setSelectedMetric(tab.id)}
                      style={isActive ? { borderColor: tab.color, color: tab.color, background: tab.bg } : undefined}
                    >
                      <TabIcon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="analytics__chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={campaignCompareData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hp-border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'var(--hp-text-secondary)', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => selectedMetric === 'sales' ? formatCompactNumber(val) : formatCompactNumber(val)}
                    tick={{ fontSize: 12, fill: 'var(--hp-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(101, 56, 234, 0.04)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="analytics__tooltip">
                          <div className="analytics__tooltip-title">{data.name}</div>
                          <div className="analytics__tooltip-row">
                            <span className="analytics__tooltip-label">{currentMetricConfig.label}:</span>
                            <span className="analytics__tooltip-value" style={{ color: currentMetricConfig.color }}>
                              {formatMetricVal(data.value)}
                            </span>
                          </div>
                          <div className="analytics__tooltip-row">
                            <span className="analytics__tooltip-label">Campaign Share:</span>
                            <span className="analytics__tooltip-value">{data.share}%</span>
                          </div>
                          <div className="analytics__tooltip-row">
                            <span className="analytics__tooltip-label">Creators Enrolled:</span>
                            <span className="analytics__tooltip-value">{data.creators}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill={currentMetricConfig.color}
                    barSize={54}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Content Unit Economics & Efficiency */}
          <div className="analytics__card">
            <div className="analytics__card-header">
              <div>
                <h2 className="analytics__card-title">Content Unit Economics & Efficiency</h2>
                <p className="analytics__card-subtitle">
                  Efficiency indicators and revenue yield averaged across all {formatNumber(totals.content)} creator posts.
                </p>
              </div>
              <Award size={18} color="var(--hp-primary)" />
            </div>

            <div className="analytics__economics-grid">
              <div className="analytics__econ-box">
                <span className="analytics__econ-label">Avg Views / Post</span>
                <span className="analytics__econ-val">{formatNumber(totals.avgViewsPerContent)}</span>
                <span className="analytics__econ-sub">Impressions per post</span>
              </div>
              <div className="analytics__econ-box">
                <span className="analytics__econ-label">Avg Clicks / Post</span>
                <span className="analytics__econ-val">{formatNumber(totals.avgClicksPerContent)}</span>
                <span className="analytics__econ-sub">Inbound product traffic</span>
              </div>
              <div className="analytics__econ-box">
                <span className="analytics__econ-label">Avg Sales / Post</span>
                <span className="analytics__econ-val" style={{ color: '#059669' }}>{formatCurrency(totals.avgSalesPerContent)}</span>
                <span className="analytics__econ-sub">Gross GMV per post</span>
              </div>
              <div className="analytics__econ-box">
                <span className="analytics__econ-label">Revenue / Click</span>
                <span className="analytics__econ-val" style={{ color: '#6538ea' }}>₹{totals.revenuePerClick.toFixed(1)}</span>
                <span className="analytics__econ-sub">Affiliate traffic value</span>
              </div>
            </div>

            <div className="analytics__econ-highlight">
              <Target size={18} color="#6538ea" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>High Performing Creator Multiplier</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--hp-text-secondary)', marginTop: 2 }}>
                  Top 20% creators deliver 64% of total gross sales with an average conversion CTR of 4.2%.
                </div>
              </div>
            </div>
          </div>

          {/* Platform Deep-Dive (Instagram vs YouTube) */}
          <div className="analytics__card">
            <div className="analytics__card-header">
              <div>
                <h2 className="analytics__card-title">Platform Channel Performance</h2>
                <p className="analytics__card-subtitle">
                  Comparison between Instagram Reels/Stories and YouTube Long-form/Shorts hauls.
                </p>
              </div>
            </div>

            <div className="analytics__platform-layout">
              {/* Chart column */}
              <div className="analytics__platform-donut-col">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      dataKey="views"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={6}
                    >
                      {platformData.map((entry) => (
                        <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || '#6538ea'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${formatNumber(val)} views`, name]}
                      contentStyle={{ borderRadius: 8, fontSize: 13, border: '1px solid var(--hp-border)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="analytics__donut-center">
                  <div className="analytics__donut-val">{formatNumber(totals.views)}</div>
                  <div className="analytics__donut-sub">Total Views</div>
                </div>
              </div>

              {/* Cards column */}
              <div className="analytics__platform-cards-col">
                {platformData.map((plat) => {
                  const isIG = plat.platform === 'Instagram';
                  return (
                    <div key={plat.platform} className="analytics__plat-card">
                      <div className="analytics__plat-card-header">
                        <div className="analytics__plat-icon-wrap" style={{ background: isIG ? '#fdf2f8' : '#fef2f2' }}>
                          {isIG ? <Smartphone size={20} color="#e1306c" /> : <Video size={20} color="#ff0000" />}
                        </div>
                        <div>
                          <div className="analytics__plat-name">{plat.platform}</div>
                          <div className="analytics__plat-meta">{plat.contentShare}% of total content ({formatNumber(plat.count)} posts)</div>
                        </div>
                      </div>

                      <div className="analytics__plat-stats-grid">
                        <div>
                          <span className="analytics__plat-stat-label">Views</span>
                          <span className="analytics__plat-stat-val">{formatNumber(plat.views)}</span>
                          <span className="analytics__plat-stat-sub">{plat.viewShare}% share</span>
                        </div>
                        <div>
                          <span className="analytics__plat-stat-label">Clicks</span>
                          <span className="analytics__plat-stat-val">{formatNumber(plat.clicks)}</span>
                          <span className="analytics__plat-stat-sub">{plat.ctr}% CTR</span>
                        </div>
                        <div>
                          <span className="analytics__plat-stat-label">Sales Driven</span>
                          <span className="analytics__plat-stat-val" style={{ color: '#059669' }}>{formatCurrency(plat.sales)}</span>
                          <span className="analytics__plat-stat-sub">Affiliate GMV</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cross-Campaign Performance Matrix Table */}
          <div className="analytics__card">
            <div className="analytics__card-header">
              <div>
                <h2 className="analytics__card-title">Cross-Campaign Performance Matrix</h2>
                <p className="analytics__card-subtitle">
                  Detailed side-by-side performance audit across all active and finished P&G campaigns.
                </p>
              </div>
              <Link to="/campaigns" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}>
                <span>View All Programs</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="analytics__table-wrap">
              <table className="analytics__table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Creators</th>
                    <th style={{ textAlign: 'right' }}>Content</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                    <th style={{ textAlign: 'right' }}>Clicks</th>
                    <th style={{ textAlign: 'right' }}>Sales Driven</th>
                    <th style={{ textAlign: 'right' }}>CTR</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allMetrics.map(camp => {
                    const ctr = camp.views > 0 ? ((camp.clicks / camp.views) * 100).toFixed(2) : 0;
                    return (
                      <tr key={camp.id}>
                        <td>
                          <div className="analytics__table-camp-info">
                            <div className="analytics__table-camp-name">{camp.name}</div>
                            <div className="analytics__table-camp-tags">
                              {camp.tags.slice(0, 2).map(t => (
                                <span key={t} className="analytics__table-tag">{t}</span>
                              ))}
                              <span className="analytics__table-date">{formatDate(camp.startDate)}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={camp.status} />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(camp.creatorCount)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(camp.contentCount)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(camp.views)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(camp.clicks)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{formatCurrency(camp.sales)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{ctr}%</td>
                        <td style={{ textAlign: 'center' }}>
                          <Link
                            to={`/campaigns/${camp.id}`}
                            className="analytics__table-link"
                          >
                            Explore <ArrowUpRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
