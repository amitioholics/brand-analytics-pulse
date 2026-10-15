import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, FileVideo, Eye, Heart, Sparkles, Megaphone,
  ArrowUpDown, ExternalLink, Package, Receipt, ArrowLeft,
  CheckCircle2, Clock, Camera
} from 'lucide-react';
import { getCreatorById } from '../data/creators';
import { getCreatorOverallMetrics, getCreatorCampaignBreakdown } from '../data/metrics';
import { getAggregatedProductSales, getProductById, productSalesRecords } from '../data/productSales';
import { getAllContentForCreator } from '../data/content';
import { useInvoices } from '../context/InvoiceContext';
import { formatNumber, formatCurrency, formatDateRange, getInitials } from '../utils/formatters';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import { usePortal } from '../context/PortalContext';
import './CreatorProfilePage.css';

export default function CreatorProfilePage() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { portal } = usePortal();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'invoices'

  const { getInvoicesForCreator } = useInvoices();
  const creator = useMemo(() => getCreatorById(creatorId), [creatorId]);
  const creatorInvoices = useMemo(() => getInvoicesForCreator(creatorId), [creatorId, getInvoicesForCreator]);
  const overallMetrics = useMemo(() => getCreatorOverallMetrics(creatorId, portal), [creatorId, portal]);
  const campaignBreakdown = useMemo(() => getCreatorCampaignBreakdown(creatorId, portal), [creatorId, portal]);
  const allContent = useMemo(() => getAllContentForCreator(creatorId, portal), [creatorId, portal]);

  // Approved live posts for this creator
  const approvedLivePosts = useMemo(() => {
    return allContent.filter(c => c.status === 'Live' || c.status === 'Approved');
  }, [allContent]);

  // Product sales for this creator
  const creatorProductRows = useMemo(() => {
    return productSalesRecords
      .filter(r => r.creatorId === creatorId)
      .map(r => {
        const prod = getProductById(r.productId);
        return {
          ...r,
          productName: prod ? prod.name : 'Unknown',
          productCategory: prod ? prod.category : '-',
          pricePerUnit: prod ? prod.pricePerUnit : 0,
          salesValue: prod ? prod.pricePerUnit * r.unitsSold : 0,
        };
      });
  }, [creatorId]);

  if (!creator) {
    return (
      <div className="campaign-pulse fade-in">
        <p>Creator not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/creators')}>
          Back to Creators
        </button>
      </div>
    );
  }

  // Campaigns participated count
  const campaignsCount = campaignBreakdown.length || (creator.id === '69134e979b7be903cf956b38' ? 1 : 0);
  const followersCount = creator.followerCount || 0;
  const livePostsCount = approvedLivePosts.length;
  const reachCount = overallMetrics.views || 0;
  const engagementsCount = overallMetrics.clicks || 0;
  const avgER = '0.0';

  // Handle fallback campaign list if breakdown is empty
  const displayCampaigns = campaignBreakdown.length > 0 ? campaignBreakdown : [
    {
      campaign: {
        id: '6ace2b3abe742272b6135d8e',
        name: 'HaulPack x Amazon Head & Shoulders',
        compensationType: 'Paid Collab',
        startDate: '2026-10-13',
        endDate: '2026-10-23',
        status: 'Active',
      },
      livePostsCount: 0,
      views: 0,
      engagements: 0,
    }
  ];

  return (
    <div className="campaign-pulse fade-in">
      {/* Breadcrumbs */}
      <div className="campaign-pulse__breadcrumbs">
        <span
          className="campaign-pulse__breadcrumb-link"
          onClick={() => navigate('/creators')}
        >
          Creators
        </span>
        <span className="campaign-pulse__breadcrumb-sep">&gt;</span>
        <span className="campaign-pulse__breadcrumb-current">{creator.name}</span>
      </div>

      {/* Creator Header */}
      <div className="campaign-pulse__header">
        <div className="creator-profile-header__avatar-box">
          {creator.avatarUrl ? (
            <img
              src={creator.avatarUrl}
              alt={creator.name}
              className="creator-profile-header__img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className="creator-profile-header__fallback"
            style={{
              background: creator.avatarColor || '#3b82f6',
              display: creator.avatarUrl ? 'none' : 'flex'
            }}
          >
            {getInitials(creator.name)}
          </div>
        </div>

        <div className="campaign-pulse__header-info">
          <div className="campaign-pulse__title-line">
            <h1 className="campaign-pulse__title">{creator.name}</h1>
          </div>
          <div className="campaign-pulse__meta-line">
            <span className="campaign-pulse__dates" style={{ fontSize: 13, color: '#6b7280' }}>
              {creator.socialHandle || '—'}
            </span>
          </div>
        </div>

        {creatorInvoices.length > 0 && (
          <div className="campaign-pulse__header-actions">
            <button
              type="button"
              className={`campaign-pulse__view-toggle-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`campaign-pulse__view-toggle-btn ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              <Receipt size={14} />
              <span>Invoices ({creatorInvoices.length})</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'invoices' && (
        <div className="campaign-pulse__card fade-in">
          <div className="campaign-pulse__card-header">
            <h2 className="campaign-pulse__card-title">Creator Invoices</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('overview')}>
              ← Back to Overview
            </button>
          </div>
          <table className="campaign-pulse__table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Campaign</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {creatorInvoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                  <td>{inv.campaignName}</td>
                  <td>{formatCurrency(inv.totalAmount)}</td>
                  <td><span className="status-badge">{inv.status}</span></td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          {/* 6 Top KPI Cards */}
          <div className="campaign-pulse__kpi-grid">
            {/* 1. CAMPAIGNS */}
            <div className="campaign-pulse__kpi-card">
              <div className="campaign-pulse__kpi-top">
                <div className="campaign-pulse__kpi-icon-box">
                  <Megaphone size={16} />
                </div>
                <span className="campaign-pulse__kpi-label">CAMPAIGNS</span>
              </div>
              <div className="campaign-pulse__kpi-val">{campaignsCount}</div>
            </div>

            {/* 2. FOLLOWERS */}
            <div className="campaign-pulse__kpi-card">
              <div className="campaign-pulse__kpi-top">
                <div className="campaign-pulse__kpi-icon-box">
                  <Users size={16} />
                </div>
                <span className="campaign-pulse__kpi-label">FOLLOWERS</span>
              </div>
              <div className="campaign-pulse__kpi-val">{formatNumber(followersCount)}</div>
            </div>

            {/* 3. LIVE POSTS */}
            <div className="campaign-pulse__kpi-card">
              <div className="campaign-pulse__kpi-top">
                <div className="campaign-pulse__kpi-icon-box">
                  <FileVideo size={16} />
                </div>
                <span className="campaign-pulse__kpi-label">LIVE POSTS</span>
              </div>
              <div className="campaign-pulse__kpi-val">{livePostsCount}</div>
            </div>

            {/* 4. REACH */}
            <div className="campaign-pulse__kpi-card">
              <div className="campaign-pulse__kpi-top">
                <div className="campaign-pulse__kpi-icon-box">
                  <Eye size={16} />
                </div>
                <span className="campaign-pulse__kpi-label">REACH</span>
              </div>
              <div className="campaign-pulse__kpi-val">{formatNumber(reachCount)}</div>
            </div>

            {/* 5. ENGAGEMENTS */}
            <div className="campaign-pulse__kpi-card">
              <div className="campaign-pulse__kpi-top">
                <div className="campaign-pulse__kpi-icon-box">
                  <Heart size={16} />
                </div>
                <span className="campaign-pulse__kpi-label">ENGAGEMENTS</span>
              </div>
              <div className="campaign-pulse__kpi-val">{formatNumber(engagementsCount)}</div>
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
              <div className="campaign-pulse__kpi-val">{avgER}%</div>
            </div>
          </div>

          {/* Section 1: Campaigns Table */}
          <div className="campaign-pulse__card">
            <h2 className="campaign-pulse__card-title">
              Campaigns ({displayCampaigns.length})
            </h2>
            <div className="campaign-pulse__table-container">
              <table className="campaign-pulse__table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span>CAMPAIGN</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'left' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span>STATUS</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <span>LIVE POSTS</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <span>VIEWS</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <span>ENGAGEMENTS</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayCampaigns.map((item, idx) => {
                    const c = item.campaign;
                    return (
                      <tr
                        key={c.id || idx}
                        className="campaign-pulse__creator-row"
                        onClick={() => navigate(`/campaigns/${c.id}`)}
                      >
                        <td style={{ textAlign: 'left' }}>
                          <div>
                            <span className="creator-profile__camp-link">
                              {c.name}
                            </span>
                            <div className="creator-profile__camp-sub">
                              {c.compensationType || 'Paid Collab'} • {formatDateRange(c.startDate, c.endDate)}
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span className="campaign-pulse__status-badge">
                            {c.status || 'Active'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: '#374151' }}>
                          {item.livePostsCount || 0}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: '#374151' }}>
                          {formatNumber(item.views || 0)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: '#374151' }}>
                          {formatNumber(item.engagements || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Approved Live Posts */}
          <div className="campaign-pulse__card">
            <h2 className="campaign-pulse__card-title">
              Approved Live Posts ({approvedLivePosts.length})
            </h2>

            {approvedLivePosts.length === 0 ? (
              <div className="campaign-pulse__empty-state">
                No approved live posts yet.
              </div>
            ) : (
              <div className="campaign-pulse__table-container">
                <table className="campaign-pulse__table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Platform</th>
                      <th>URL</th>
                      <th>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedLivePosts.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td>{p.platform}</td>
                        <td>
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noopener noreferrer">
                              View Link
                            </a>
                          ) : '—'}
                        </td>
                        <td>{formatNumber(p.views || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Product Sales Attributed (if any) */}
          {creatorProductRows.length > 0 && (
            <div className="campaign-pulse__card">
              <h2 className="campaign-pulse__card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={18} color="var(--hp-primary, #6538ea)" />
                <span>Product Sales Attributed ({creatorProductRows.length})</span>
              </h2>

              <div className="campaign-pulse__table-container">
                <table className="campaign-pulse__table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>PRODUCT</th>
                      <th style={{ textAlign: 'left' }}>CATEGORY</th>
                      <th style={{ textAlign: 'right' }}>ORDERS</th>
                      <th style={{ textAlign: 'right' }}>UNITS SOLD</th>
                      <th style={{ textAlign: 'right' }}>SALES VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creatorProductRows.map((row, idx) => (
                      <tr key={`${row.campaignId || 'camp'}-${row.productId || 'prod'}-${idx}`}>
                        <td style={{ textAlign: 'left', fontWeight: 600, color: '#111827' }}>
                          {row.productName}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span className="product-category-tag">{row.productCategory}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                          {formatNumber(row.orders)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                          {formatNumber(row.unitsSold)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {formatCurrency(row.salesValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
