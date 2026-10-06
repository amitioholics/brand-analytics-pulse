import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, FileVideo, Eye, MousePointerClick, ShoppingCart, ExternalLink,
  Play, CheckCircle2, XCircle, AlertCircle, Sparkles, Clock, Tag, Send,
  LayoutGrid, BarChart3, Gift, Package, Truck, PackageCheck, FileText, Camera
} from 'lucide-react';
import { getCampaignById } from '../data/campaigns';
import { getCampaignMetrics, getAllCreatorMetricsForCampaign, getPlatformBreakdown, getCampaignTimeSeries } from '../data/metrics';
import { getBarterFulfillmentForCampaign } from '../data/creators';
import { getLivePostsForCampaign, getCampaignSocialKPIs } from '../data/videoSubmissions';
import { productSalesRecords, getProductById, PRODUCTS } from '../data/productSales';
import { formatNumber, formatCurrency, formatDateRange, getInitials, getSocialUrl } from '../utils/formatters';
import { useDeliverables } from '../context/DeliverablesContext';
import VideoReviewModal from '../components/video/VideoReviewModal';
import BarterFulfillmentCard from '../components/campaign/BarterFulfillmentCard';
import BarterCreatorsModal from '../components/campaign/BarterCreatorsModal';
import CampaignOverviewTab from '../components/campaign/CampaignOverviewTab';
import CampaignCreatorsTab from '../components/campaign/CampaignCreatorsTab';
import CampaignLivePostsTab from '../components/campaign/CampaignLivePostsTab';
import CampaignPerformanceTab from '../components/campaign/CampaignPerformanceTab';
import Breadcrumb from '../components/common/Breadcrumb';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import ExportButton from '../components/common/ExportButton';
import ErrorState from '../components/common/ErrorState';
import CampaignPerformanceChart from '../components/campaign/CampaignPerformanceChart';
import ContentSummary from '../components/campaign/ContentSummary';
import './CampaignDashboard.css';

export default function CampaignDashboard() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // PRD 5 Tabs: 'overview' | 'creators' | 'content_review' | 'live_posts' | 'performance'
  const [chartMetric, setChartMetric] = useState('views');
  const [chartTime, setChartTime] = useState('all');
  const [creatorSearch, setCreatorSearch] = useState('');
  const [creatorStatusFilter, setCreatorStatusFilter] = useState('');
  const [creatorPlatformFilter, setCreatorPlatformFilter] = useState('');
  const [campProdTab, setCampProdTab] = useState('content'); // for product sales toggle

  const {
    getSubmissionsByCampaign,
    approveDraft,
    rejectDraft,
    submitLiveLink,
    approveLivePost,
    rejectLivePost,
    approveFinalPayment,
    rejectFinalPayment,
  } = useDeliverables();
  const [deliverableTab, setDeliverableTab] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalRejectMode, setModalRejectMode] = useState(false);

  // Barter Campaign Fulfillment State & Modal
  const [isBarterModalOpen, setIsBarterModalOpen] = useState(false);
  const [barterFilterModal, setBarterFilterModal] = useState('all'); // 'all' | 'delivered' | 'pending'

  const handleOpenBarterModal = useCallback((filter = 'all') => {
    setBarterFilterModal(filter);
    setIsBarterModalOpen(true);
  }, []);

  const campaign = getCampaignById(campaignId);

  if (!campaign) {
    return (
      <div className="campaign-dash fade-in">
        <ErrorState message="Campaign not found." onRetry={() => navigate('/campaigns')} />
      </div>
    );
  }

  const metrics = getCampaignMetrics(campaignId);
  const allCreators = getAllCreatorMetricsForCampaign(campaignId);
  const platformBreakdown = getPlatformBreakdown(campaignId);
  const chartData = getCampaignTimeSeries(campaignId, chartMetric, chartTime);
  const avgViewsPerContent = metrics.contentCount ? Math.round(metrics.views / metrics.contentCount) : 0;
  const avgClicksPerContent = metrics.contentCount ? Math.round(metrics.clicks / metrics.contentCount) : 0;
  const avgSalesPerContent = metrics.contentCount ? Math.round(metrics.sales / metrics.contentCount) : 0;
  const clickThroughRate = metrics.views > 0 ? (metrics.clicks / metrics.views) * 100 : 0;
  const avgPostsPerCreator = metrics.creatorCount ? (metrics.contentCount / metrics.creatorCount).toFixed(1) : '0';

  // Barter fulfillment metrics for Brand Connect campaigns
  const barterFulfillment = useMemo(() => {
    if (campaign?.portalType === 'brand-connect') {
      return getBarterFulfillmentForCampaign(campaignId);
    }
    return null;
  }, [campaign, campaignId]);

  // Product sales aggregated for this campaign — grouped by product × creator
  const campaignProductData = useMemo(() => {
    const rows = productSalesRecords.filter(r => r.campaignId === campaignId);
    // group by productId
    const byProduct = {};
    rows.forEach(r => {
      if (!byProduct[r.productId]) {
        const prod = getProductById(r.productId);
        byProduct[r.productId] = {
          productId: r.productId,
          productName: prod ? prod.name : 'Unknown',
          productCategory: prod ? prod.category : '-',
          unitsSold: 0, salesValue: 0, orders: 0,
          creators: new Set(),
        };
      }
      const prod = getProductById(r.productId);
      byProduct[r.productId].unitsSold  += r.unitsSold;
      byProduct[r.productId].salesValue += prod ? prod.pricePerUnit * r.unitsSold : 0;
      byProduct[r.productId].orders     += r.orders;
      byProduct[r.productId].creators.add(r.creatorId);
    });
    return Object.values(byProduct)
      .map(p => ({ ...p, creatorCount: p.creators.size }))
      .sort((a, b) => b.salesValue - a.salesValue);
  }, [campaignId]);

  const campProdKPIs = useMemo(() => ({
    totalUnits:  campaignProductData.reduce((s, r) => s + r.unitsSold,  0),
    totalValue:  campaignProductData.reduce((s, r) => s + r.salesValue, 0),
    products:    campaignProductData.length,
    creators:    new Set(productSalesRecords.filter(r => r.campaignId === campaignId).map(r => r.creatorId)).size,
  }), [campaignProductData, campaignId]);

  // Submissions for this Brand Connect campaign
  const campaignSubmissions = useMemo(() => {
    return campaign?.portalType === 'brand-connect' ? getSubmissionsByCampaign(campaignId) : [];
  }, [campaign, campaignId, getSubmissionsByCampaign]);

  // Live posts and social KPIs for PRD 8.9 & 8.10
  const livePosts = useMemo(() => {
    return getLivePostsForCampaign(campaignId, campaignSubmissions);
  }, [campaignId, campaignSubmissions]);

  const socialKPIs = useMemo(() => {
    return getCampaignSocialKPIs(campaignId, campaignSubmissions);
  }, [campaignId, campaignSubmissions]);

  const pendingDraftSubmissions = useMemo(() => campaignSubmissions.filter(s => s.stage === 'draft_review'), [campaignSubmissions]);
  const awaitingLiveSubmissions = useMemo(() => campaignSubmissions.filter(s => s.stage === 'awaiting_live_link'), [campaignSubmissions]);
  const pendingFinalSubmissions = useMemo(() => campaignSubmissions.filter(s => s.stage === 'final_review'), [campaignSubmissions]);
  const liveApprovedSubmissions = useMemo(() => campaignSubmissions.filter(s => s.stage === 'live_approved' || s.stage === 'payment_approved'), [campaignSubmissions]);
  const paymentApprovedSubmissions = liveApprovedSubmissions;
  const rejectedSubmissions = useMemo(() => campaignSubmissions.filter(s => s.stage === 'draft_rejected' || s.stage === 'live_rejected'), [campaignSubmissions]);

  const totalActionsNeeded = pendingDraftSubmissions.length + pendingFinalSubmissions.length;

  const displayedSubmissions = useMemo(() => {
    if (deliverableTab === 'draft_review') return pendingDraftSubmissions;
    if (deliverableTab === 'awaiting_live_link') return awaitingLiveSubmissions;
    if (deliverableTab === 'final_review') return pendingFinalSubmissions;
    if (deliverableTab === 'live_approved' || deliverableTab === 'payment_approved') return liveApprovedSubmissions;
    if (deliverableTab === 'rejected') return rejectedSubmissions;
    return campaignSubmissions;
  }, [deliverableTab, campaignSubmissions, pendingDraftSubmissions, awaitingLiveSubmissions, pendingFinalSubmissions, liveApprovedSubmissions, rejectedSubmissions]);

  // Filter creators
  const filteredCreators = useMemo(() => {
    let result = allCreators;
    if (creatorSearch) {
      const q = creatorSearch.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) || c.socialHandle.toLowerCase().includes(q)
      );
    }
    if (creatorStatusFilter) {
      result = result.filter(c => c.status === creatorStatusFilter);
    }
    if (creatorPlatformFilter) {
      result = result.filter(c => c.platform === creatorPlatformFilter);
    }
    return result;
  }, [allCreators, creatorSearch, creatorStatusFilter, creatorPlatformFilter]);

  const handleCreatorSearch = useCallback((val) => setCreatorSearch(val), []);

  const kpiCards = [
    { label: 'Total Creators', value: formatNumber(metrics.creatorCount), icon: Users, color: '#655bef' },
    { label: 'Total Content', value: formatNumber(metrics.contentCount), icon: FileVideo, color: '#3b82f6' },
    { label: 'Total Views', value: formatNumber(metrics.views), icon: Eye, color: '#10b981' },
    { label: 'Total Clicks', value: formatNumber(metrics.clicks), icon: MousePointerClick, color: '#f59e0b' },
    { label: 'Total Sales', value: formatCurrency(metrics.sales), icon: ShoppingCart, color: '#ec4899' },
  ];

  const creatorColumns = [
    {
      key: 'name',
      label: 'Creator',
      width: '220px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: row.avatarColor || 'var(--hp-primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-heading)', flexShrink: 0,
          }}>
            {getInitials(val)}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
            <a
              href={getSocialUrl(row.platform, row.socialHandle)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--hp-text-tertiary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--hp-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--hp-text-tertiary)'; }}
              title={`Open ${row.name}'s ${row.platform} profile`}
            >
              <span>{row.socialHandle}</span>
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'platform',
      label: 'Platform',
      render: (val, row) => {
        const url = getSocialUrl(val, row.socialHandle);
        const isIG = val === 'Instagram';
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`Open ${row.name}'s ${val} profile (${row.socialHandle})`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              color: isIG ? '#e1306c' : '#ef4444',
              background: isIG ? '#fdf2f8' : '#fef2f2',
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textDecoration: 'none',
              border: `1px solid ${isIG ? '#fbcfe8' : '#fecaca'}`,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>{val}</span>
            <ExternalLink size={12} strokeWidth={2.2} />
          </a>
        );
      },
    },
    {
      key: 'contentCount',
      label: 'Content',
      align: 'right',
      render: (val) => formatNumber(val),
    },
    {
      key: 'views',
      label: 'Views',
      align: 'right',
      render: (val) => formatNumber(val),
    },
    {
      key: 'clicks',
      label: 'Clicks',
      align: 'right',
      render: (val) => formatNumber(val),
    },
    {
      key: 'sales',
      label: 'Sales',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    ...(campaign?.portalType === 'brand-connect' && campaign?.isBarter ? [{
      key: 'deliveryStatus',
      label: 'Barter Products',
      render: (val, row) => {
        const isDelivered = row.productReceived || val === 'Delivered';
        const isInTransit = val === 'In Transit';
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenBarterModal(isDelivered ? 'delivered' : 'pending');
            }}
            title={`Click to view barter logistics (AWB: ${row.trackingNumber || 'Pending'})`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              background: isDelivered ? '#ecfdf5' : isInTransit ? '#eff6ff' : '#fefce8',
              color: isDelivered ? '#047857' : isInTransit ? '#1d4ed8' : '#a16207',
              border: `1px solid ${isDelivered ? '#a7f3d0' : isInTransit ? '#bfdbfe' : '#fef08a'}`,
              transition: 'transform 0.15s ease',
            }}
          >
            {isDelivered ? <CheckCircle2 size={12} /> : isInTransit ? <Truck size={12} /> : <Package size={12} />}
            <span>{val || 'Processing'}</span>
          </button>
        );
      },
    }] : []),
  ];

  return (
    <div className="campaign-dash fade-in">
      <Breadcrumb items={[
        { label: campaign.portalType === 'brand-connect' ? 'Collaborations' : 'Reward Programs', to: '/campaigns' },
        { label: campaign.name },
      ]} />

      {/* Campaign Header */}
      <div className="campaign-dash__header">
        <div className="campaign-dash__header-info">
          <div className="campaign-dash__portal-indicator">
            {campaign.portalType === 'brand-connect' ? (
              <span className="campaign-dash__portal-badge campaign-dash__portal-badge--brand">
                <Sparkles size={13} />
                <span>Brand Connect Collaboration</span>
              </span>
            ) : (
              <span className="campaign-dash__portal-badge campaign-dash__portal-badge--reward">
                <Gift size={13} />
                <span>Reward Program</span>
              </span>
            )}
          </div>
          <h1 className="campaign-dash__title">{campaign.name}</h1>
          <div className="campaign-dash__meta">
            <span className="campaign-dash__dates">{formatDateRange(campaign.startDate, campaign.endDate)}</span>
            <StatusBadge status={campaign.status} size="lg" />
          </div>
          {campaign.tags.length > 0 && (
            <div className="campaign-dash__tags">
              {campaign.tags.map(t => (
                <span key={t} className="campaign-dash__tag">{t}</span>
              ))}
            </div>
          )}
        </div>
        <ExportButton />
      </div>

      {/* Brand Connect: 5 Primary Tabs (PRD Section 7) */}
      {campaign.portalType === 'brand-connect' && (
        <div className="campaign-dash__view-switcher">
          <button
            type="button"
            className={`campaign-dash__view-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FileText size={15} />
            <span>1. Overview</span>
          </button>
          <button
            type="button"
            className={`campaign-dash__view-tab ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            <Users size={15} />
            <span>2. Creators ({allCreators.length})</span>
          </button>
          <button
            type="button"
            className={`campaign-dash__view-tab ${activeTab === 'content_review' ? 'active' : ''}`}
            onClick={() => setActiveTab('content_review')}
          >
            <FileVideo size={15} />
            <span>3. Content Review ({campaignSubmissions.length})</span>
            {totalActionsNeeded > 0 && (
              <span className="campaign-dash__view-tab-count">{totalActionsNeeded} Actions</span>
            )}
          </button>
          <button
            type="button"
            className={`campaign-dash__view-tab ${activeTab === 'live_posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('live_posts')}
          >
            <Camera size={15} />
            <span>4. Live Posts ({livePosts.length})</span>
          </button>
          <button
            type="button"
            className={`campaign-dash__view-tab ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <BarChart3 size={15} />
            <span>5. Performance</span>
          </button>
          <button
            type="button"
            className={`campaign-dash__view-tab ${activeTab === 'product_sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('product_sales')}
          >
            <Package size={15} />
            <span>6. Product Sales</span>
          </button>
        </div>
      )}

      {/* ==============================================================
          TAB 1: OVERVIEW (PRD 8.5)
         ============================================================== */}
      {campaign.portalType === 'brand-connect' && activeTab === 'overview' && (
        <CampaignOverviewTab
          campaign={campaign}
          fulfillment={barterFulfillment}
          onOpenBarterModal={handleOpenBarterModal}
          campaignSubmissions={campaignSubmissions}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* ==============================================================
          TAB 2: CREATORS (PRD 8.6)
         ============================================================== */}
      {campaign.portalType === 'brand-connect' && activeTab === 'creators' && (
        <CampaignCreatorsTab
          creators={allCreators}
          campaign={campaign}
          campaignSubmissions={campaignSubmissions}
          onOpenBarterModal={handleOpenBarterModal}
        />
      )}

      {/* ==============================================================
          TAB 4: LIVE POSTS (PRD 8.9)
         ============================================================== */}
      {campaign.portalType === 'brand-connect' && activeTab === 'live_posts' && (
        <CampaignLivePostsTab
          livePosts={livePosts}
          campaign={campaign}
        />
      )}

      {/* ==============================================================
          TAB 5: PERFORMANCE (PRD 8.10)
         ============================================================== */}
      {campaign.portalType === 'brand-connect' && activeTab === 'performance' && (
        <CampaignPerformanceTab
          campaign={campaign}
          socialKPIs={socialKPIs}
          chartData={chartData}
          platformBreakdown={platformBreakdown}
          allCreators={allCreators}
        />
      )}

      {/* ==============================================================
          TAB 6: PRODUCT SALES
         ============================================================== */}
      {campaign.portalType === 'brand-connect' && activeTab === 'product_sales' && (
        <div className="campaign-dash__section fade-in">
          <div className="campaign-dash__section-header" style={{ marginBottom: 'var(--space-5)' }}>
            <div>
              <h2 className="campaign-dash__section-title">Product Sales</h2>
              <p className="campaign-dash__section-subtext">
                Actual product orders generated by creators in this campaign — independent of collection or video revenue.
              </p>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {[
              { label: 'Total Orders',       val: formatNumber(campProdKPIs.totalUnits),   bg: '#ede9fe', color: '#6538ea' },
              { label: 'Total Sales Value',  val: formatCurrency(campProdKPIs.totalValue),  bg: '#ecfdf5', color: '#059669' },
              { label: 'Unique Products',    val: campProdKPIs.products,                    bg: '#eff6ff', color: '#3b82f6' },
              { label: 'Active Creators',    val: campProdKPIs.creators,                    bg: '#fff7ed', color: '#f59e0b' },
            ].map(k => (
              <div key={k.label} style={{
                background: 'var(--hp-bg-card)', border: '1px solid var(--hp-border)',
                borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={20} color={k.color} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--hp-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Products table */}
          {campaignProductData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--hp-text-tertiary)', background: 'var(--hp-bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--hp-border)' }}>
              <Package size={36} style={{ marginBottom: 'var(--space-3)' }} />
              <p>No product sales have been tracked for this campaign yet.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--hp-bg-card)', border: '1px solid var(--hp-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table className="analytics__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Creators Selling</th>
                    <th style={{ textAlign: 'right' }}>Orders</th>
                    <th style={{ textAlign: 'right' }}>Sales Value</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignProductData.map((row, idx) => (
                    <tr key={row.productId}>
                      <td>
                        <div className="analytics__prod-rank" style={{ background: idx < 3 ? '#ede9fe' : 'var(--hp-bg)' }}>
                          <span style={{ color: idx < 3 ? '#6538ea' : 'var(--hp-text-tertiary)', fontWeight: 700, fontSize: '0.7rem' }}>#{idx + 1}</span>
                        </div>
                      </td>
                      <td><div style={{ fontWeight: 600 }}>{row.productName}</div></td>
                      <td><span className="analytics__table-tag">{row.productCategory}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{row.creatorCount} creator{row.creatorCount !== 1 ? 's' : ''}</td>
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

      {/* ==============================================================
          REWARD PROGRAM: Standard Affiliate View
         ============================================================== */}
      {campaign.portalType === 'reward-program' && (
        <>
          <div className="campaign-dash__kpis">
            {kpiCards.map(card => (
              <KPICard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                accentColor={card.color}
              />
            ))}
          </div>

          <div className="campaign-dash__section">
            <CampaignPerformanceChart
              data={chartData}
              selectedMetric={chartMetric}
              selectedTime={chartTime}
              onMetricChange={setChartMetric}
              onTimeFilterChange={setChartTime}
            />
          </div>

          <div className="campaign-dash__section">
            <ContentSummary
              avgViewsPerContent={avgViewsPerContent}
              avgClicksPerContent={avgClicksPerContent}
              avgSalesPerContent={avgSalesPerContent}
              clickThroughRate={clickThroughRate}
              avgPostsPerCreator={avgPostsPerCreator}
              platformBreakdown={platformBreakdown}
            />
          </div>
        </>
      )}

      {/* ==============================================================
          TAB 3: CONTENT REVIEW STUDIO (PRD 8.7)
         ============================================================== */}
      {((campaign.portalType === 'brand-connect' && activeTab === 'content_review') || campaign.portalType === 'reward-program') && (
        <div className="campaign-dash__section campaign-dash__section--deliverables">
          <div className="campaign-dash__deliverables-header">
            <div>
              <div className="campaign-dash__deliverables-title-row">
                <h2 className="campaign-dash__section-title">
                  Creator Video Deliverables & Two-Stage QA
                </h2>
                {totalActionsNeeded > 0 && (
                  <span className="campaign-dash__pending-pulse-badge">
                    <Clock size={13} />
                    {totalActionsNeeded} Decisions Awaiting
                  </span>
                )}
              </div>
              <p className="campaign-dash__section-subtext">
                Two-stage QA process: <strong>Stage 1</strong> reviews creator video drafts; <strong>Stage 2</strong> verifies the live Instagram Reel / YouTube URL before final approval.
              </p>
            </div>

            <div className="campaign-dash__deliverables-actions">
              <button
                type="button"
                className="campaign-dash__view-all-approvals-btn"
                onClick={() => navigate('/approvals')}
                title="Open Global Video Approvals Studio"
              >
                <span>Central QA Studio</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>

          {/* Deliverables Tabs */}
          <div className="campaign-dash__deliverable-tabs">
            <button
              type="button"
              className={`campaign-dash__dtab ${deliverableTab === 'all' ? 'active' : ''}`}
              onClick={() => setDeliverableTab('all')}
            >
              All Deliverables ({campaignSubmissions.length})
            </button>
            <button
              type="button"
              className={`campaign-dash__dtab ${deliverableTab === 'draft_review' ? 'active' : ''}`}
              onClick={() => setDeliverableTab('draft_review')}
            >
              1. Draft QA ({pendingDraftSubmissions.length})
            </button>
            <button
              type="button"
              className={`campaign-dash__dtab ${deliverableTab === 'awaiting_live_link' ? 'active' : ''}`}
              onClick={() => setDeliverableTab('awaiting_live_link')}
            >
              2. Awaiting Live Post ({awaitingLiveSubmissions.length})
            </button>
            <button
              type="button"
              className={`campaign-dash__dtab ${deliverableTab === 'final_review' ? 'active' : ''}`}
              onClick={() => setDeliverableTab('final_review')}
            >
              3. Live Post QA ({pendingFinalSubmissions.length})
            </button>
            <button
              type="button"
              className={`campaign-dash__dtab ${deliverableTab === 'live_approved' ? 'active' : ''}`}
              onClick={() => setDeliverableTab('live_approved')}
            >
              4. Live Posts Approved ({liveApprovedSubmissions.length})
            </button>
            <button
              type="button"
              className={`campaign-dash__dtab ${deliverableTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setDeliverableTab('rejected')}
            >
              Rejections ({rejectedSubmissions.length})
            </button>
          </div>

          {/* Submissions Grid or Empty State */}
          {displayedSubmissions.length === 0 ? (
            <div className="campaign-dash__deliverables-empty">
              <FileVideo size={36} />
              <h4>No deliverables in this category</h4>
              <p>No video submissions match the "{deliverableTab}" filter for this campaign.</p>
            </div>
          ) : (
            <div className="campaign-dash__deliverables-grid">
              {displayedSubmissions.map(sub => {
                const isDraftPending = sub.stage === 'draft_review';
                const isFinalPending = sub.stage === 'final_review';
                const isApproved = sub.stage === 'live_approved' || sub.stage === 'payment_approved';
                const isAwaitingLive = sub.stage === 'awaiting_live_link';
                const isRejected = sub.stage === 'draft_rejected' || sub.stage === 'live_rejected';

                return (
                  <div key={sub.id} className="deliverable-card">
                    {/* Media Preview Box */}
                    <div
                      className="deliverable-card__media"
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setModalRejectMode(false);
                      }}
                    >
                      <video
                        src={sub.videoUrl}
                        preload="metadata"
                        muted
                        playsInline
                        className="deliverable-card__video-preview"
                      />
                      <div className="deliverable-card__overlay">
                        <div className="deliverable-card__play-btn">
                          <Play size={20} fill="#fff" />
                        </div>
                        <span className="deliverable-card__hover-text">Watch & Review</span>
                      </div>

                      <div className="deliverable-card__duration-badge">
                        {sub.duration}
                      </div>

                      <div className="deliverable-card__format-tag">
                        {sub.deliverableType}
                      </div>

                      <div className="deliverable-card__status-pos">
                        <span className={`deliv-status-pill deliv-status-pill--${sub.stage || 'draft-review'}`}>
                          {isApproved && <CheckCircle2 size={12} />}
                          {isRejected && <XCircle size={12} />}
                          {isDraftPending && <Clock size={12} />}
                          {isFinalPending && <Sparkles size={12} />}
                          {isAwaitingLive && <Send size={12} />}
                          <span>{sub.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="deliverable-card__body">
                      <div className="deliverable-card__creator-row">
                        <div
                          className="deliverable-card__avatar"
                          style={{ background: sub.creatorAvatarColor || 'var(--hp-primary)' }}
                        >
                          {getInitials(sub.creatorName)}
                        </div>
                        <div className="deliverable-card__creator-meta">
                          <div className="deliverable-card__creator-name">{sub.creatorName}</div>
                          <div className="deliverable-card__creator-handle">{sub.creatorHandle} • {sub.creatorPlatform}</div>
                        </div>
                        <span className="deliverable-card__format-tag">
                          {sub.deliverableType}
                        </span>
                      </div>

                      <h4 className="deliverable-card__title" title={sub.videoTitle}>
                        {sub.videoTitle}
                      </h4>

                      {sub.caption && (
                        <p className="deliverable-card__caption" title={sub.caption}>
                          {sub.caption}
                        </p>
                      )}

                      {/* Tagged Products */}
                      {sub.taggedProducts?.length > 0 && (
                        <div className="deliverable-card__products">
                          <span className="deliverable-card__products-label">
                            <Tag size={12} /> {sub.taggedProducts.length} Products:
                          </span>
                          <div className="deliverable-card__products-list">
                            {sub.taggedProducts.map((p, idx) => (
                              <span key={idx} className="deliverable-card__product-chip">
                                <span className="deliverable-card__product-name">{p.name}</span>
                                <span className="deliverable-card__product-price">{p.price}</span>
                                <span className="deliverable-card__product-brand">{p.brand}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Live Link Box if available */}
                      {sub.livePostUrl && (
                        <div className="deliverable-card__live-link-pill" onClick={(e) => e.stopPropagation()}>
                          <span>Live Link:</span>
                          <a
                            href={sub.livePostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="deliverable-card__live-link-url"
                          >
                            <span>{sub.livePostUrl}</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}

                      {/* Rejection Details Callout */}
                      {isRejected && (sub.draftRejectionReason || sub.liveRejectionReason) && (
                        <div className="deliverable-card__reason-callout deliverable-card__reason-callout--rejected">
                          <div className="deliverable-card__reason-header">
                            <AlertCircle size={14} />
                            <strong>{sub.stage === 'draft_rejected' ? 'Draft Rejection:' : 'Live Post Rejection:'}</strong>
                          </div>
                          <p className="deliverable-card__reason-text">{sub.draftRejectionReason || sub.liveRejectionReason}</p>
                          {(sub.draftReviewNotes || sub.liveReviewNotes) && (
                            <div className="deliverable-card__reason-notes">
                              <span>Note:</span> {sub.draftReviewNotes || sub.liveReviewNotes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Approved Details Callout */}
                      {isApproved && (
                        <div className="deliverable-card__reason-callout deliverable-card__reason-callout--approved">
                          <div className="deliverable-card__reason-header">
                            <CheckCircle2 size={14} />
                            <strong>Live Post Approved</strong>
                          </div>
                          <p className="deliverable-card__reason-text">
                            {sub.liveReviewNotes || 'Live post verified and approved.'}
                          </p>
                        </div>
                      )}

                      {/* Awaiting Live Callout */}
                      {isAwaitingLive && (
                        <div className="deliverable-card__reason-callout deliverable-card__reason-callout--awaiting">
                          <div className="deliverable-card__reason-header">
                            <Send size={14} />
                            <strong>Draft Approved!</strong>
                          </div>
                          <p className="deliverable-card__reason-text">
                            Waiting for creator to publish on Instagram/YouTube and submit live URL.
                          </p>
                        </div>
                      )}

                      {/* Actions Bar */}
                      <div className="deliverable-card__actions">
                        {/* Stage 1: Draft Pending */}
                        {isDraftPending && (
                          <>
                            <button
                              type="button"
                              className="deliverable-card__review-btn"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setModalRejectMode(false);
                              }}
                            >
                              <Play size={14} fill="currentColor" />
                              <span>Review Draft</span>
                            </button>
                            <button
                              type="button"
                              className="deliverable-card__approve-btn"
                              onClick={() => approveDraft(sub.id, 'Approved via Campaign Studio')}
                              title="Quick Approve Draft"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="deliverable-card__reject-btn"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setModalRejectMode(true);
                              }}
                              title="Reject Draft with Reason"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* Stage 2: Final Live Review */}
                        {isFinalPending && (
                          <>
                            <button
                              type="button"
                              className="deliverable-card__review-btn"
                              style={{ background: '#86198f' }}
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setModalRejectMode(false);
                              }}
                            >
                              <Sparkles size={14} />
                              <span>Review Live Post</span>
                            </button>
                            <button
                              type="button"
                              className="deliverable-card__approve-btn"
                              onClick={() => approveLivePost(sub.id, 'Live post verified and approved.')}
                              title="Approve Live Post"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="deliverable-card__reject-btn"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setModalRejectMode(true);
                              }}
                              title="Reject Live Post with Reason"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* Awaiting Live Link (Creator will post on their end) */}
                        {isAwaitingLive && (
                          <button
                            type="button"
                            className="deliverable-card__re-review-btn"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setModalRejectMode(false);
                            }}
                          >
                            <span>View Draft Details</span>
                          </button>
                        )}

                        {/* Completed / Rejected */}
                        {(isApproved || isRejected) && (
                          <button
                            type="button"
                            className="deliverable-card__re-review-btn"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setModalRejectMode(false);
                            }}
                          >
                            View Decision & Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Creator Performance for Reward Program */}
      {campaign.portalType === 'reward-program' && (
        <div className="campaign-dash__section">
          <div className="campaign-dash__section-header">
            <h2 className="campaign-dash__section-title">Creator Performance</h2>
          </div>

          <div className="campaign-dash__creator-toolbar">
            <SearchBar placeholder="Search creators..." onSearch={handleCreatorSearch} />
            <div className="campaign-dash__creator-filters">
              <FilterDropdown
                label="All Status"
                value={creatorStatusFilter}
                onChange={setCreatorStatusFilter}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Completed', label: 'Completed' },
                ]}
              />
              <FilterDropdown
                label="All Platforms"
                value={creatorPlatformFilter}
                onChange={setCreatorPlatformFilter}
                options={[
                  { value: 'Instagram', label: 'Instagram' },
                  { value: 'YouTube', label: 'YouTube' },
                ]}
              />
            </div>
          </div>

          <DataTable
            columns={creatorColumns}
            data={filteredCreators}
            onRowClick={(row) => navigate(`/campaigns/${campaignId}/creators/${row.creatorId || row.id}`)}
            emptyMessage="No creators have joined this campaign yet."
            pageSize={25}
          />
        </div>
      )}

      {/* Video Review Studio Modal */}
      {selectedSubmission && (
        <VideoReviewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApproveDraft={approveDraft}
          onRejectDraft={rejectDraft}
          onApproveLivePost={approveLivePost}
          onRejectLivePost={rejectLivePost}
          onApproveFinalPayment={approveFinalPayment}
          onRejectFinalPayment={rejectFinalPayment}
          initialRejectMode={modalRejectMode}
        />
      )}

      {/* Barter Creators & Logistics Modal */}
      {isBarterModalOpen && barterFulfillment && (
        <BarterCreatorsModal
          isOpen={isBarterModalOpen}
          onClose={() => setIsBarterModalOpen(false)}
          campaign={campaign}
          fulfillment={barterFulfillment}
          initialFilter={barterFilterModal}
        />
      )}
    </div>
  );
}
