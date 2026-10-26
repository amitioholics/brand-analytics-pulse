import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Eye,
  FileVideo,
} from 'lucide-react';
import { campaigns } from '../data/campaigns';
import { getCampaignMetrics } from '../data/metrics';
import { formatDate, formatCompactNumber, formatNumber } from '../utils/formatters';
import { useDeliverables } from '../context/DeliverablesContext';
import PGLogo from '../components/common/PGLogo';
import PulseLogo from '../components/common/PulseLogo';
import './Dashboard.css';

export default function Dashboard() {
  const { pendingCount, pendingDraftsCount, pendingLivePostsCount, liveApprovedCount } = useDeliverables();

  // Exactly 1 P&G campaign on Dashboard
  const portalCampaigns = [campaigns[0]];
  const singleCampaign = portalCampaigns[0];
  const metrics = useMemo(() => getCampaignMetrics(singleCampaign?.id), [singleCampaign]);

  const activeCampaigns = useMemo(() => {
    return portalCampaigns.filter(c => c.status === 'Active');
  }, [portalCampaigns]);

  const scheduledCampaigns = useMemo(() => {
    return portalCampaigns.filter(c => c.status === 'Scheduled');
  }, [portalCampaigns]);

  const completedCampaigns = useMemo(() => {
    return portalCampaigns.filter(c => c.status === 'Completed');
  }, [portalCampaigns]);

  return (
    <div className="dashboard fade-in">
      {/* 1. Header */}
      <div className="dashboard__header">
        <div className="dashboard__header-inner">
          <div className="dashboard__header-left">
            <div className="dashboard__header-top">
              <h1 className="dashboard__title">Pulse Dashboard</h1>
              <span className="dashboard__direct-collabs-pill">
                <PGLogo size={16} />
                <span>DIRECT COLLABS</span>
              </span>
            </div>
            <p className="dashboard__subtitle">
              Real-time influencer campaigns, deliverables, and brand media reach.
            </p>
          </div>

          {/* Big P&G Brand Lockup on the far right */}
          <div className="dashboard__header-brand-card" title="Procter & Gamble — Verified Brand Partner">
            <div className="dashboard__header-brand-logo-wrap">
              <PGLogo size={48} />
            </div>
            <div className="dashboard__header-brand-details">
              <div className="dashboard__header-brand-name-row">
                <span className="dashboard__header-brand-name">Procter &amp; Gamble</span>
                <span className="dashboard__header-brand-pill">
                  <CheckCircle2 size={11} />
                  <span>Verified</span>
                </span>
              </div>
              <span className="dashboard__header-brand-caption">
                Official Brand Partner • Collabs Portal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Dark Purple Banner */}
      <div className="dashboard__hero-banner">
        <div className="dashboard__hero-content">
          <div className="dashboard__hero-pill">
            <Sparkles size={12} />
            <span>Pulse</span>
          </div>
          <h2 className="dashboard__hero-title">
            Creator Campaigns & Influencer Partnerships
          </h2>
          <p className="dashboard__hero-subtitle">
            Direct brand activations, sponsored campaign deliverables, creator reach, and content engagement analytics.
          </p>
        </div>
        <div className="dashboard__hero-actions">
          <Link to="/campaigns" className="dashboard__hero-btn dashboard__hero-btn--white">
            View All Campaigns
          </Link>
          <Link to="/campaigns/6ace2b3abe742272b6135d8e#reimbursements" className="dashboard__hero-btn dashboard__hero-btn--purple">
            Creator Reimbursements
          </Link>
        </div>
      </div>

      {/* 3. Review Alert Card */}
      <div className="dashboard__review-alert-card">
        <div className="dashboard__review-alert-left">
          <div className="dashboard__review-alert-icon">
            <FileVideo size={22} />
          </div>
          <div>
            <h3 className="dashboard__review-alert-title">
              All Content Reviewed!
            </h3>
            <p className="dashboard__review-alert-sub">
              0 video drafts need your creative approval • 0 published links awaiting live post verification.
            </p>
          </div>
        </div>

        <Link to="/campaigns/6ace2b3abe742272b6135d8e#deliverables" className="dashboard__review-alert-btn">
          <span>Review Now</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* 4. Top KPI 4 Cards Grid */}
      <div className="dashboard__kpi-grid">
        <div className="dashboard__kpi-card dashboard__kpi-card--purple">
          <div className="dashboard__kpi-icon">
            <Sparkles size={18} />
          </div>
          <div className="dashboard__kpi-value">{portalCampaigns.length}</div>
          <div className="dashboard__kpi-label">Total Campaigns</div>
        </div>

        <div className="dashboard__kpi-card dashboard__kpi-card--green">
          <div className="dashboard__kpi-icon">
            <TrendingUp size={18} />
          </div>
          <div className="dashboard__kpi-value">{activeCampaigns.length}</div>
          <div className="dashboard__kpi-label">Active Campaigns</div>
        </div>

        <div className="dashboard__kpi-card dashboard__kpi-card--amber">
          <div className="dashboard__kpi-icon">
            <Clock size={18} />
          </div>
          <div className="dashboard__kpi-value">{scheduledCampaigns.length}</div>
          <div className="dashboard__kpi-label">Scheduled Launches</div>
        </div>

        <div className="dashboard__kpi-card dashboard__kpi-card--slate">
          <div className="dashboard__kpi-icon">
            <CheckCircle2 size={18} />
          </div>
          <div className="dashboard__kpi-value">{completedCampaigns.length}</div>
          <div className="dashboard__kpi-label">Completed</div>
        </div>
      </div>

      {/* 5. Media Reach / Deliverables Metric Bar */}
      <div className="dashboard__perf-bar">
        <div className="dashboard__perf-col">
          <div className="dashboard__perf-icon" style={{ color: '#3b82f6', background: '#eff6ff' }}>
            <FileVideo size={18} />
          </div>
          <div>
            <span className="dashboard__perf-label">LIVE POSTS</span>
            <span className="dashboard__perf-val">0 Posts</span>
          </div>
        </div>

        <div className="dashboard__perf-col">
          <div className="dashboard__perf-icon" style={{ color: '#10b981', background: '#ecfdf5' }}>
            <Eye size={18} />
          </div>
          <div>
            <span className="dashboard__perf-label">TOTAL VIEWS</span>
            <span className="dashboard__perf-val">0</span>
          </div>
        </div>

        <div className="dashboard__perf-col">
          <div className="dashboard__perf-icon" style={{ color: '#6366f1', background: '#eef2ff' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="dashboard__perf-label">TOTAL ENGAGEMENTS</span>
            <span className="dashboard__perf-val">0</span>
          </div>
        </div>

        <div className="dashboard__perf-col">
          <div className="dashboard__perf-icon" style={{ color: '#059669', background: '#ecfdf5' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <span className="dashboard__perf-label">AVG. ENGAGEMENT RATE</span>
            <span className="dashboard__perf-val" style={{ color: '#059669' }}>
              0.0%
            </span>
          </div>
        </div>
      </div>

      {/* 6. Active Brand Campaigns (Single P&G Campaign) */}
      <div className="dashboard__campaigns-section">
        <div className="dashboard__campaigns-header">
          <div>
            <h2 className="dashboard__campaigns-title">Active Brand Campaigns</h2>
            <p className="dashboard__campaigns-subtitle">
              Campaign progress, deliverable pipelines, and verified live posts
            </p>
          </div>
          <Link to="/campaigns" className="dashboard__campaigns-view-all">
            <span>View all campaigns</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="dashboard__campaigns-list">
          {portalCampaigns.map(campaign => (
            <Link
              key={campaign.id}
              to={`/campaigns/${campaign.id}`}
              className="dashboard__campaign-row-card"
            >
              <div className="dashboard__campaign-card-left">
                <div className="dashboard__campaign-card-icon" style={{ background: '#5b21b6', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', width: '52px', height: '34px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={campaign.imageUrl || '/campaign-banner.png'}
                    alt={campaign.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div className="dashboard__campaign-card-name">{campaign.name}</div>
                  <div className="dashboard__campaign-card-meta">
                    {campaign.compensationType && (
                      <span className="dashboard__campaign-card-badge">
                        {campaign.compensationType}
                      </span>
                    )}
                    <span className="dashboard__campaign-card-date">
                      📅 {formatDate(campaign.startDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dashboard__campaign-card-stats">
                <div className="dashboard__campaign-stat-item">
                  <span className="dashboard__stat-label">DELIVERABLES</span>
                  <span className="dashboard__stat-value">{campaign.deliverablesCount || 418}</span>
                </div>
                <div className="dashboard__campaign-stat-item">
                  <span className="dashboard__stat-label">VIEWS</span>
                  <span className="dashboard__stat-value">0</span>
                </div>
                <div className="dashboard__campaign-stat-item">
                  <span className="dashboard__stat-label">ENGAGEMENT</span>
                  <span className="dashboard__stat-value">0</span>
                </div>
                <div className="dashboard__campaign-card-status">
                  <span className="dashboard__status-pill">Active</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
