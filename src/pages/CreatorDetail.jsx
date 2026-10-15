import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileVideo, Eye, MousePointerClick, ShoppingCart, ExternalLink,
  LinkIcon, ArrowUpRight, Package, TrendingUp, BarChart2,
  FileText, CheckCircle2, Clock, Receipt
} from 'lucide-react';
import { getCampaignById } from '../data/campaigns';
import { getCreatorById, getCampaignCreatorRelation } from '../data/creators';
import { getContentForCreator } from '../data/content';
import { getCreatorCampaignMetrics, getCreatorSalesAnalytics } from '../data/metrics';
import { productSalesRecords, getProductById } from '../data/productSales';
import { useInvoices } from '../context/InvoiceContext';
import { formatNumber, formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import Breadcrumb from '../components/common/Breadcrumb';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import ErrorState from '../components/common/ErrorState';
import FilterDropdown from '../components/common/FilterDropdown';
import CreatorProfileHeader from '../components/creator/CreatorProfileHeader';
import CreatorPerformanceChart from '../components/creator/CreatorPerformanceChart';
import ContentCard from '../components/content/ContentCard';
import ContentDetailDrawer from '../components/content/ContentDetailDrawer';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import DataTable from '../components/common/DataTable';
import './CreatorDetail.css';

export default function CreatorDetail() {
  const { campaignId, creatorId } = useParams();
  const navigate = useNavigate();
  const [drawerContent, setDrawerContent] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards | table
  const [contentSort, setContentSort] = useState('views');
  const [detailPerfTab, setDetailPerfTab] = useState('content'); // 'content' | 'product'

  const { getInvoicesForCampaign, INVOICE_STATUSES } = useInvoices();
  const creatorCampInvoices = useMemo(() => {
    return getInvoicesForCampaign(campaignId).filter(i => i.creatorId === creatorId);
  }, [campaignId, creatorId, getInvoicesForCampaign]);

  const campaign = getCampaignById(campaignId);
  const creator = getCreatorById(creatorId);
  const relation = getCampaignCreatorRelation(campaignId, creatorId);

  if (!campaign || !creator || !relation) {
    return (
      <div className="creator-detail fade-in">
        <ErrorState message="Unable to load creator performance." onRetry={() => navigate(`/campaigns/${campaignId}`)} />
      </div>
    );
  }

  const metrics = getCreatorCampaignMetrics(campaignId, creatorId);
  const content = getContentForCreator(campaignId, creatorId);
  const salesAnalytics = getCreatorSalesAnalytics(campaignId, creatorId);

  // Product sales for THIS creator in THIS campaign
  const campaignProductRows = useMemo(() => {
    return productSalesRecords
      .filter(r => r.campaignId === campaignId && r.creatorId === creatorId)
      .map(r => {
        const prod = getProductById(r.productId);
        return {
          ...r,
          productName: prod ? prod.name : 'Unknown',
          productCategory: prod ? prod.category : '-',
          salesValue: prod ? prod.pricePerUnit * r.unitsSold : 0,
        };
      });
  }, [campaignId, creatorId]);

  const campaignProductTotals = useMemo(() => ({
    unitsSold:  campaignProductRows.reduce((s, r) => s + r.unitsSold,  0),
    salesValue: campaignProductRows.reduce((s, r) => s + r.salesValue, 0),
    orders:     campaignProductRows.reduce((s, r) => s + r.orders,     0),
  }), [campaignProductRows]);

  // Build chart data with all metrics per date
  const chartDataRaw = {};
  content.forEach(c => {
    const d = c.publishedAt;
    if (!chartDataRaw[d]) chartDataRaw[d] = { date: d, views: 0, clicks: 0, sales: 0 };
    chartDataRaw[d].views += c.views;
    chartDataRaw[d].clicks += c.clicks;
    chartDataRaw[d].sales += c.sales;
  });
  const chartData = Object.values(chartDataRaw).sort((a, b) => a.date.localeCompare(b.date));

  // Sort content
  const sortedContent = useMemo(() => {
    return [...content].sort((a, b) => b[contentSort] - a[contentSort]);
  }, [content, contentSort]);

  const kpiCards = [
    { label: 'Total Content', value: formatNumber(metrics.contentCount), icon: FileVideo, color: '#3b82f6' },
    { label: 'Total Views', value: formatNumber(metrics.views), icon: Eye, color: '#10b981' },
    { label: 'Total Clicks', value: formatNumber(metrics.clicks), icon: MousePointerClick, color: '#f59e0b' },
    { label: 'Total Sales', value: formatCurrency(metrics.sales), icon: ShoppingCart, color: '#ec4899' },
  ];

  const contentTableColumns = [
    {
      key: 'title',
      label: 'Content',
      width: '240px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 32, borderRadius: 4,
            background: row.thumbnailColor || '#e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, flexShrink: 0,
          }}>▶</div>
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{val}</span>
        </div>
      ),
    },
    { key: 'platform', label: 'Platform', render: (val) => val },
    { key: 'publishedAt', label: 'Published', render: (val) => formatDate(val) },
    { key: 'views', label: 'Views', align: 'right', render: (val) => formatNumber(val) },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (val) => formatNumber(val) },
    { key: 'sales', label: 'Sales', align: 'right', render: (val) => formatCurrency(val) },
    { key: 'conversionRate', label: 'Conversion', align: 'right', render: (val) => formatPercent(val) },
    {
      key: 'action',
      label: '',
      sortable: false,
      render: (_, row) => (
        row.contentUrl ? (
          <button
            onClick={(e) => { e.stopPropagation(); window.open(row.contentUrl, '_blank', 'noopener,noreferrer'); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', fontSize: 'var(--text-xs)', fontWeight: 600,
              color: 'var(--hp-primary)', border: '1px solid var(--hp-primary)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none',
              fontFamily: 'var(--font-body)',
            }}
          >
            <ExternalLink size={12} /> View
          </button>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--hp-text-tertiary)', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <LinkIcon size={11} /> Unavailable
          </span>
        )
      ),
    },
  ];

  return (
    <div className="creator-detail fade-in">
      <Breadcrumb items={[
        { label: campaign.portalType === 'brand-connect' ? 'Campaigns' : 'Reward Programs', to: '/campaigns' },
        { label: campaign.name, to: `/campaigns/${campaignId}` },
        { label: 'Creators', to: `/campaigns/${campaignId}` },
        { label: creator.name },
      ]} />

      {/* Profile Header */}
      <div className="creator-detail__profile">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--hp-text-secondary)' }}>
            Campaign-specific analytics for <strong>{campaign.name}</strong>
          </span>
          <Link
            to={`/creators/${creatorId}`}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', padding: '6px 12px' }}
          >
            <span>View All Campaigns & Multi-Program Analytics</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <CreatorProfileHeader creator={creator} status={relation.status} />
      </div>

      {/* KPI Cards */}
      <div className="creator-detail__kpis">
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

      {/* Performance Chart */}
      <div className="creator-detail__section">
        <CreatorPerformanceChart data={chartData} />
      </div>

      {/* Sales & Reward Analytics — with Product Sales toggle */}
      <div className="creator-detail__analytics-row">
        {/* LEFT: Sales Analytics / Product Sales toggle */}
        <div className="creator-detail__analytics-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h3 className="creator-detail__card-title" style={{ marginBottom: 0 }}>Sales Analytics</h3>
            <div className="cp-perf-tabs">
              <button
                className={`cp-perf-tab ${detailPerfTab === 'content' ? 'cp-perf-tab--active' : ''}`}
                onClick={() => setDetailPerfTab('content')}
              >
                <BarChart2 size={13} />
                Content
              </button>
              <button
                className={`cp-perf-tab ${detailPerfTab === 'product' ? 'cp-perf-tab--active' : ''}`}
                onClick={() => setDetailPerfTab('product')}
              >
                <Package size={13} />
                Product Sales
              </button>
            </div>
          </div>

          {detailPerfTab === 'content' && (
            <div className="creator-detail__analytics-grid fade-in">
              <div className="creator-detail__analytics-item">
                <span className="creator-detail__analytics-label">Total Sales</span>
                <span className="creator-detail__analytics-value">{formatCurrency(salesAnalytics.totalSales)}</span>
              </div>
              <div className="creator-detail__analytics-item">
                <span className="creator-detail__analytics-label">Approved Sales</span>
                <span className="creator-detail__analytics-value">{formatCurrency(salesAnalytics.approvedSales)}</span>
              </div>
              <div className="creator-detail__analytics-item">
                <span className="creator-detail__analytics-label">Avg Sales / Post</span>
                <span className="creator-detail__analytics-value">{formatCurrency(Math.round(salesAnalytics.totalSales / (metrics.contentCount || 1)))}</span>
              </div>
              <div className="creator-detail__analytics-item">
                <span className="creator-detail__analytics-label">Active Platform</span>
                <span className="creator-detail__analytics-value">{creator.platform}</span>
              </div>
            </div>
          )}

          {detailPerfTab === 'product' && (
            <div className="fade-in">
              {/* Mini KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ background: '#ede9fe', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: '#6538ea', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Units Sold</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#6538ea' }}>{campaignProductTotals.unitsSold}</div>
                </div>
                <div style={{ background: '#ecfdf5', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sales</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#059669' }}>{formatCurrency(campaignProductTotals.salesValue)}</div>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Products</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#3b82f6' }}>{campaignProductRows.length}</div>
                </div>
              </div>

              {campaignProductRows.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--hp-text-tertiary)', fontSize: 'var(--text-sm)', padding: 'var(--space-4) 0' }}>
                  <Package size={18} />
                  <span>No product sales tracked for this campaign.</span>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="analytics__table" style={{ fontSize: 'var(--text-xs)' }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ textAlign: 'right' }}>Units Sold</th>
                        <th style={{ textAlign: 'right' }}>Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignProductRows.map(row => (
                        <tr key={row.productId}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{row.productName}</div>
                            <span className="analytics__table-tag" style={{ marginTop: 2 }}>{row.productCategory}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.unitsSold}</td>
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

        {/* Engagement & Traffic Analytics */}
        <div className="creator-detail__analytics-card">
          <h3 className="creator-detail__card-title">Engagement & Traffic</h3>
          <div className="creator-detail__analytics-grid">
            <div className="creator-detail__analytics-item">
              <span className="creator-detail__analytics-label">Total Views</span>
              <span className="creator-detail__analytics-value">{formatNumber(metrics.views)}</span>
            </div>
            <div className="creator-detail__analytics-item">
              <span className="creator-detail__analytics-label">Total Clicks</span>
              <span className="creator-detail__analytics-value">{formatNumber(metrics.clicks)}</span>
            </div>
            <div className="creator-detail__analytics-item">
              <span className="creator-detail__analytics-label">Click-Through Rate</span>
              <span className="creator-detail__analytics-value" style={{ color: 'var(--hp-success)' }}>
                {formatPercent((metrics.clicks / (metrics.views || 1)) * 100)}
              </span>
            </div>
            <div className="creator-detail__analytics-item">
              <span className="creator-detail__analytics-label">Avg Views / Content</span>
              <span className="creator-detail__analytics-value">{formatNumber(metrics.avgViewsPerContent)}</span>
            </div>
            <div className="creator-detail__analytics-item">
              <span className="creator-detail__analytics-label">Avg Clicks / Content</span>
              <span className="creator-detail__analytics-value">{formatNumber(metrics.avgClicksPerContent)}</span>
            </div>
            <div className="creator-detail__analytics-item">
              <span className="creator-detail__analytics-label">Engagement Status</span>
              <span className="creator-detail__analytics-value" style={{ color: 'var(--hp-primary)' }}>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="creator-detail__section">
        <div className="creator-detail__content-header">
          <h2 className="creator-detail__section-title">Campaign Content</h2>
          <div className="creator-detail__content-controls">
            <FilterDropdown
              label="Sort by"
              value={contentSort}
              onChange={setContentSort}
              options={[
                { value: 'views', label: 'Views' },
                { value: 'clicks', label: 'Clicks' },
                { value: 'sales', label: 'Sales' },
              ]}
            />
            <div className="creator-detail__view-toggle">
              <button
                className={`creator-detail__view-btn ${viewMode === 'cards' ? 'creator-detail__view-btn--active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
              <button
                className={`creator-detail__view-btn ${viewMode === 'table' ? 'creator-detail__view-btn--active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {sortedContent.length === 0 ? (
          <div style={{
            padding: 40, textAlign: 'center', color: 'var(--hp-text-tertiary)',
            background: 'var(--hp-bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--hp-border)',
          }}>
            No campaign content has been created yet.
          </div>
        ) : viewMode === 'cards' ? (
          <div className="creator-detail__content-cards">
            {sortedContent.map(item => (
              <ContentCard key={item.id} content={item} onClick={(c) => setDrawerContent(c)} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={contentTableColumns}
            data={sortedContent}
            onRowClick={(row) => setDrawerContent(row)}
            paginated={false}
            emptyMessage="No campaign content has been created yet."
          />
        )}
      </div>

      {/* Campaign Reimbursement Invoices */}
      {creatorCampInvoices.length > 0 && (
        <div className="creator-detail__section" style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 className="creator-detail__section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Receipt size={18} color="var(--hp-primary, #6538ea)" />
                <span>Submitted Reimbursement Invoices ({creatorCampInvoices.length})</span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--hp-text-secondary)' }}>
                Reimbursement requests submitted by {creator.name} for this campaign.
              </p>
            </div>
            <Link to={`/invoices?campaign=${campaignId}`} className="btn btn-sm btn-secondary">
              View All Invoices →
            </Link>
          </div>

          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid var(--hp-border)', overflow: 'hidden' }}>
            <table className="analytics__table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Category</th>
                  <th>Submitted Date</th>
                  <th style={{ textAlign: 'right' }}>Claimed Amount</th>
                  <th>Proofs</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {creatorCampInvoices.map(inv => (
                  <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--hp-primary, #6538ea)' }}>
                        Order #{inv.primaryOrderId || inv.invoiceNumber}
                      </div>
                    </td>
                    <td>
                      <span className="analytics__table-tag">{inv.expenseCategory}</span>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>
                      {formatDate(inv.orderDate || inv.invoiceDate)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {formatCurrency(inv.totalOrderAmount || inv.totalAmount)}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: '#475569' }}>{inv.attachments?.length || 0} proofs</span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            inv.status === INVOICE_STATUSES.APPROVED || inv.status === 'Verified' || inv.status === 'Reimbursed'
                              ? '#eef2ff'
                              : inv.status === INVOICE_STATUSES.REJECTED
                              ? '#fef2f2'
                              : '#fffbeb',
                          color:
                            inv.status === INVOICE_STATUSES.APPROVED || inv.status === 'Verified' || inv.status === 'Reimbursed'
                              ? '#4f46e5'
                              : inv.status === INVOICE_STATUSES.REJECTED
                              ? '#dc2626'
                              : '#b45309',
                        }}
                      >
                        {inv.status === 'Reimbursed' ? 'Approved' : (inv.status || 'Under Review')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(inv);
                        }}
                      >
                        Inspect & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Detail Drawer */}
      {drawerContent && (
        <ContentDetailDrawer
          content={drawerContent}
          creatorName={creator.name}
          onClose={() => setDrawerContent(null)}
        />
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
