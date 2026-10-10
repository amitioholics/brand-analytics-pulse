import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Eye,
  MousePointerClick,
  ShoppingCart,
  FileVideo,
  Sparkles,
  Gift,
  ArrowRightLeft,
  FileText,
  Landmark,
  Receipt,
} from 'lucide-react';
import { getCampaignsByPortal } from '../data/campaigns';
import { getCampaignMetrics } from '../data/metrics';
import { formatNumber, formatCurrency, formatDate } from '../utils/formatters';
import { usePortal } from '../context/PortalContext';
import { useDeliverables } from '../context/DeliverablesContext';
import { useInvoices } from '../context/InvoiceContext';
import StatusBadge from '../components/common/StatusBadge';
import './Dashboard.css';

export default function Dashboard() {
  const { portal, togglePortal, currentConfig, isBrandConnect } = usePortal();
  const { pendingCount, pendingDraftsCount, pendingLivePostsCount } = useDeliverables();
  const { pendingCount: pendingInvoicesCount, totalPendingAmount } = useInvoices();

  // Filter campaigns strictly for the active portal mode
  const portalCampaigns = useMemo(() => {
    return getCampaignsByPortal(portal);
  }, [portal]);

  const activeCampaigns = portalCampaigns.filter(c => c.status === 'Active');
  const scheduledCampaigns = portalCampaigns.filter(c => c.status === 'Scheduled');
  const completedCampaigns = portalCampaigns.filter(c => c.status === 'Completed');

  // Summary stats across active portal campaigns
  const allMetrics = portalCampaigns.map(c => getCampaignMetrics(c.id));
  const totalContent = allMetrics.reduce((s, m) => s + m.contentCount, 0);
  const totalViews = allMetrics.reduce((s, m) => s + m.views, 0);
  const totalClicks = allMetrics.reduce((s, m) => s + m.clicks, 0);
  const totalSales = allMetrics.reduce((s, m) => s + m.sales, 0);

  const summaryCards = [
    {
      label: isBrandConnect ? 'Total Collabs' : 'Total Programs',
      value: portalCampaigns.length,
      icon: isBrandConnect ? Sparkles : Megaphone,
      color: currentConfig.accentColor,
      bg: currentConfig.secondaryColor,
    },
    {
      label: isBrandConnect ? 'Active Collabs' : 'Active Programs',
      value: activeCampaigns.length,
      icon: TrendingUp,
      color: '#10b981',
      bg: '#e8fbf3',
    },
    {
      label: isBrandConnect ? 'Scheduled Launches' : 'Scheduled',
      value: scheduledCampaigns.length,
      icon: Clock,
      color: '#d97706',
      bg: '#fef7e6',
    },
    {
      label: 'Completed',
      value: completedCampaigns.length,
      icon: CheckCircle,
      color: '#475569',
      bg: '#f1f3f9',
    },
  ];

  return (
    <div className={`dashboard fade-in dashboard--${portal}`}>
      <div className="dashboard__header">
        <div>
          <div className="dashboard__header-top">
            <h1 className="dashboard__title">
              {currentConfig.name} Dashboard
            </h1>
            <span className={`dashboard__mode-pill dashboard__mode-pill--${portal}`}>
              {isBrandConnect ? <Sparkles size={13} /> : <Gift size={13} />}
              <span>{currentConfig.tag}</span>
            </span>
          </div>
          <p className="dashboard__subtitle">
            {isBrandConnect
              ? 'Real-time influencer collaborations, deliverables, and brand media reach.'
              : 'Real-time creator catalog hauls, affiliate conversion, and gross sales attribution.'}
          </p>
        </div>

        <button
          type="button"
          onClick={togglePortal}
          className="dashboard__switch-toggle-btn"
          title={`Switch view to ${isBrandConnect ? 'Reward Program' : 'Brand Connect'}`}
        >
          <ArrowRightLeft size={14} />
          <span>Switch to {isBrandConnect ? 'Reward Program' : 'Brand Connect'}</span>
        </button>
      </div>

      {/* HaulPack Banner */}
      <div className={`dashboard__haulpack-banner dashboard__haulpack-banner--${portal}`}>
        <div className="dashboard__banner-content">
          <div className="dashboard__banner-badge">
            <span>{currentConfig.badgeText}</span>
          </div>
          <h2 className="dashboard__banner-title">
            {currentConfig.bannerTitle}
          </h2>
          <p className="dashboard__banner-subtitle">
            {currentConfig.bannerSubtitle}
          </p>
        </div>
        <div className="dashboard__banner-actions">
          <Link to="/campaigns" className="dashboard__banner-btn">
            {currentConfig.primaryActionText}
          </Link>
          <Link to="/creators" className="dashboard__banner-btn dashboard__banner-btn--secondary">
            Creator Directory
          </Link>
        </div>
      </div>

      {/* Brand Connect: Action Items Card (PRD 8.3 HM-01) */}
      {isBrandConnect && (
        <div className="dashboard__action-items-card" style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fbfaff 100%)',
          border: '1.5px solid #ddd6fe',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
          boxShadow: '0 4px 14px rgba(101, 91, 239, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileVideo size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {pendingCount > 0 ? `${pendingCount} Content Pieces Awaiting Brand Review` : 'All Content Reviewed!'}
                </h3>
                {pendingCount > 0 && (
                  <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    <span>2 items close to SLA (less than 12h left)</span>
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                {pendingDraftsCount} video drafts need your creative approval • {pendingLivePostsCount} published links awaiting live post verification.
              </p>
            </div>
          </div>

          <Link
            to="/approvals"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--hp-primary, #655bef)',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(101, 91, 239, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Review Now</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Creator Invoices & Reimbursement Action Alert */}
      {pendingInvoicesCount > 0 && (
        <div className="dashboard__action-items-card" style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fffbf5 100%)',
          border: '1.5px solid #fed7aa',
          borderRadius: 12,
          padding: '18px 24px',
          marginBottom: 24,
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Receipt size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {pendingInvoicesCount} Creator Reimbursement {pendingInvoicesCount === 1 ? 'Invoice' : 'Invoices'} Awaiting Verification
                </h3>
                <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>{formatCurrency(totalPendingAmount)} Total Claimed</span>
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Creators have submitted receipts and tax invoices for product purchases, studio equipment, and campaign logistics.
              </p>
            </div>
          </div>

          <Link
            to="/invoices?status=pending"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#d97706',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Verify Invoices</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="dashboard__summary">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="dashboard__summary-card" style={{ background: card.bg }}>
              <div className="dashboard__summary-icon" style={{ color: card.color }}>
                <Icon size={20} />
              </div>
              <div className="dashboard__summary-value" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="dashboard__summary-label">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Aggregate Performance Overview */}
      {isBrandConnect ? (
        /* Brand Connect: Social Performance Roll-up (PRD 8.3 HM-03) */
        <div className="dashboard__performance-bar">
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: '#3b82f6', background: '#eff6ff' }}>
              <FileVideo size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">LIVE POSTS</span>
              <span className="dashboard__perf-val">24 Posts</span>
            </div>
          </div>
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: '#10b981', background: '#ecfdf5' }}>
              <Eye size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">TOTAL VIEWS</span>
              <span className="dashboard__perf-val">{formatNumber(totalViews)}</span>
            </div>
          </div>
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: '#655bef', background: '#eef2ff' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">TOTAL REACH</span>
              <span className="dashboard__perf-val">{formatNumber(Math.round(totalViews * 0.82))}</span>
            </div>
          </div>
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: '#059669', background: '#e8fbf3' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">AVG. ENGAGEMENT RATE</span>
              <span className="dashboard__perf-val" style={{ color: '#059669' }}>7.4%</span>
            </div>
          </div>
        </div>
      ) : (
        /* Reward Program: Sales/Affiliate Performance Roll-up */
        <div className="dashboard__performance-bar">
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: currentConfig.accentColor, background: currentConfig.secondaryColor }}>
              <FileVideo size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">{currentConfig.metricLabels.content}</span>
              <span className="dashboard__perf-val">{formatNumber(totalContent)}</span>
            </div>
          </div>
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: '#655bef', background: 'var(--hp-primary-lighter)' }}>
              <Eye size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">{currentConfig.metricLabels.reach}</span>
              <span className="dashboard__perf-val">{formatNumber(totalViews)}</span>
            </div>
          </div>
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: '#10b981', background: '#d1fae5' }}>
              <MousePointerClick size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">{currentConfig.metricLabels.engagement}</span>
              <span className="dashboard__perf-val">{formatNumber(totalClicks)}</span>
            </div>
          </div>
          <div className="dashboard__perf-item">
            <div className="dashboard__perf-icon" style={{ color: '#059669', background: '#e8fbf3' }}>
              <ShoppingCart size={18} />
            </div>
            <div>
              <span className="dashboard__perf-label">{currentConfig.metricLabels.value}</span>
              <span className="dashboard__perf-val" style={{ color: '#059669' }}>{formatCurrency(totalSales)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Active Campaigns (HM-02) & Recent Activity Feed (HM-04) */}
      <div style={{ display: 'grid', gridTemplateColumns: isBrandConnect ? '2fr 1fr' : '1fr', gap: 24 }}>
        {/* Recent Campaigns / Collabs */}
        <div className="dashboard__section" style={{ margin: 0 }}>
          <div className="dashboard__section-header">
            <div>
              <h2 className="dashboard__section-title">
                {isBrandConnect ? 'Active Brand Collaborations' : 'Recent Reward Programs'}
              </h2>
              <p className="dashboard__section-subtitle">
                {isBrandConnect
                  ? 'Campaign progress, deliverable pipelines, and verified live posts'
                  : 'Performance affiliate milestones and sales attribution'}
              </p>
            </div>
            <Link to="/campaigns" className="dashboard__view-all">
              View all {isBrandConnect ? 'collaborations' : 'campaigns'} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="dashboard__campaigns">
            {portalCampaigns.map(campaign => {
              const metrics = getCampaignMetrics(campaign.id);
              return (
                <Link
                  key={campaign.id}
                  to={`/campaigns/${campaign.id}`}
                  className="dashboard__campaign-row"
                >
                  <div className="dashboard__campaign-info">
                    <div className={`dashboard__campaign-icon ${isBrandConnect ? 'dashboard__campaign-icon--brand' : ''}`}>
                      {isBrandConnect ? <Sparkles size={16} /> : <Megaphone size={16} />}
                    </div>
                    <div>
                      <div className="dashboard__campaign-name">{campaign.name}</div>
                      <div className="dashboard__campaign-meta">
                        {campaign.compensationType && (
                          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            {campaign.compensationType}
                          </span>
                        )}
                        {campaign.tags.map(t => (
                          <span key={t} className="dashboard__campaign-tag">{t}</span>
                        ))}
                        <span className="dashboard__campaign-date">📅 {formatDate(campaign.startDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard__campaign-stats">
                    <div className="dashboard__campaign-metric">
                      <span className="dashboard__metric-label">{isBrandConnect ? 'DELIVERABLES' : 'CONTENT'}</span>
                      <span className="dashboard__metric-value">{formatNumber(metrics.contentCount)}</span>
                    </div>
                    <div className="dashboard__campaign-metric">
                      <span className="dashboard__metric-label">{isBrandConnect ? 'REACH' : 'VIEWS'}</span>
                      <span className="dashboard__metric-value">{formatNumber(metrics.views)}</span>
                    </div>
                    <div className="dashboard__campaign-metric">
                      <span className="dashboard__metric-label">{isBrandConnect ? 'ENGAGEMENT' : 'CLICKS'}</span>
                      <span className="dashboard__metric-value">{formatNumber(metrics.clicks)}</span>
                    </div>
                    <div className="dashboard__campaign-status">
                      <StatusBadge status={campaign.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* PRD 8.3 HM-04: Recent Activity Feed */}
        {isBrandConnect && (
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--hp-border, #e2e8f0)',
            borderRadius: 12,
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0f172a' }}>Recent Activity Feed</h3>
              <span style={{ fontSize: 11, color: '#64748b' }}>Live Updates</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <strong>@aditisharma</strong> submitted reimbursement invoice <strong>INV-2026-AW-0104</strong> for ₹8,398.
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>20 mins ago • 2 receipts attached</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#655bef', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <strong>@aditisharma</strong> submitted Reel 1 draft for Autumn/Winter Runway Collab.
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>35 minutes ago • 18h left in SLA</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <strong>Haulpack Team</strong> verified and approved live Reel by @karanmehta_.
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>2 hours ago • Live on Instagram</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginTop: 5, flexShrink: 0 }} />
                <div>
                  Barter hamper delivered to <strong>@priyapatel</strong> via BlueDart.
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>4 hours ago • POD Verified</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <strong>@rahulverma_yt</strong> submitted YouTube Short draft for Gen-Z Streetwear Spotlight.
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>6 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
