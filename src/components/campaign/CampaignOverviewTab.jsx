import {
  FileText, CheckCircle2, ShieldCheck, Mail, Phone,
  Calendar, Check, X, Tag, Sparkles, Clock, ArrowRight,
  Package, Users, Send, Video, ExternalLink
} from 'lucide-react';
import BarterFulfillmentCard from './BarterFulfillmentCard';
import './CampaignOverviewTab.css';

export default function CampaignOverviewTab({
  campaign,
  fulfillment,
  onOpenBarterModal,
  campaignSubmissions = [],
  onNavigateTab,
}) {
  const brief = campaign.brief || {};
  const guidelines = brief.guidelines || {};
  const accountManager = campaign.accountManager || {
    name: 'Aanya Singhania',
    email: 'aanya.s@haulpack.com',
    role: 'Senior Brand Solutions Lead',
  };

  // Funnel calculations based on live submissions and creators
  const creatorsApprovedCount = fulfillment?.totalRegistered || 25;
  const contentSubmittedCount = campaignSubmissions.length || 16;
  const contentApprovedCount = campaignSubmissions.filter(
    s => s.stage === 'awaiting_live_link' || s.stage === 'final_review' || s.stage === 'live_approved' || s.stage === 'payment_approved'
  ).length || 12;
  const postsLiveCount = campaignSubmissions.filter(
    s => s.stage === 'live_approved' || s.stage === 'payment_approved'
  ).length || 8;
  const campaignCompletedCount = fulfillment?.creators?.filter(c => c.status === 'Completed').length || 4;

  const funnelSteps = [
    { label: 'Creators Approved', count: creatorsApprovedCount, icon: Users, tab: 'creators' },
    { label: 'Content Submitted', count: contentSubmittedCount, icon: Send, tab: 'content_review' },
    { label: 'Content Approved', count: contentApprovedCount, icon: CheckCircle2, tab: 'content_review' },
    { label: 'Posts Live', count: postsLiveCount, icon: Video, tab: 'live_posts' },
    { label: 'Completed', count: campaignCompletedCount, icon: Sparkles, tab: 'creators' },
  ];

  return (
    <div className="campaign-overview-tab fade-in">
      {/* 1. Approval Mode & SLA Banner (PRD 8.5 CO-03) */}
      <div className="overview-banner">
        <div className="overview-banner__left">
          <div className="overview-banner__mode-badge">
            <ShieldCheck size={16} />
            <span>Approval Mode: {campaign.approvalMode || 'Either'}</span>
          </div>
          <div className="overview-banner__text">
            <strong>Shared Decision Workflow:</strong> Content drafts can be approved or rejected by{' '}
            <strong>your brand team</strong> or the <strong>Haulpack team</strong>. The first decision recorded is final.
          </div>
        </div>
        <div className="overview-banner__right">
          <div className="overview-sla-badge">
            <Clock size={14} />
            <span>Target Review SLA: <strong>{campaign.reviewSlaHours || 48} Hours</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Progress Funnel (PRD 8.5 CO-02) */}
      <div className="overview-funnel-card">
        <div className="overview-funnel-card__header">
          <div>
            <h3 className="overview-section-title">Campaign Progress Funnel</h3>
            <p className="overview-section-sub">
              Live lifecycle conversion from onboarded creators to published and verified live posts.
            </p>
          </div>
        </div>

        <div className="overview-funnel">
          {funnelSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="funnel-step"
                onClick={() => onNavigateTab && onNavigateTab(step.tab)}
                role="button"
                tabIndex={0}
                title={`Click to view ${step.label}`}
              >
                <div className="funnel-step__icon-box">
                  <Icon size={16} />
                </div>
                <div className="funnel-step__content">
                  <span className="funnel-step__count">{step.count}</span>
                  <span className="funnel-step__label">{step.label}</span>
                </div>
                {idx < funnelSteps.length - 1 && <div className="funnel-step__connector" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Barter Fulfillment Tracker (PRD 8.5 CO-05) */}
      {campaign.isBarter && fulfillment && (
        <BarterFulfillmentCard
          campaign={campaign}
          fulfillment={fulfillment}
          onCardClick={onOpenBarterModal}
        />
      )}

      {/* 4. Grid: Campaign Brief & Account Manager Support */}
      <div className="overview-grid">
        {/* Left Column: Comprehensive Brief (PRD 8.5 CO-01) */}
        <div className="overview-card overview-card--brief">
          <div className="overview-card__header">
            <div className="overview-card__header-icon">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="overview-card__title">Campaign Creative Brief & Guidelines</h3>
              <p className="overview-card__sub">Published guidelines, deliverables, and hashtags shared with participating creators.</p>
            </div>
          </div>

          <div className="brief-section">
            <h4 className="brief-section__heading">Deliverables Required</h4>
            <p className="brief-section__summary">{brief.deliverablesSummary || '1x Instagram Reel (30-60s) + 1x Story'}</p>
            {brief.deliverablesList && (
              <ul className="brief-checklist">
                {brief.deliverablesList.map((d, i) => (
                  <li key={i}>
                    <CheckCircle2 size={14} className="brief-check-icon" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {brief.productDetails && (
            <div className="brief-section">
              <h4 className="brief-section__heading">Featured Product / Collection</h4>
              <p className="brief-text">{brief.productDetails}</p>
            </div>
          )}

          {/* Guidelines Details */}
          <div className="brief-guidelines-grid">
            <div className="guideline-block">
              <span className="guideline-block__label">Required Hashtags:</span>
              <div className="guideline-tags">
                {(guidelines.requiredHashtags || ['#PGFamily', '#PGSpotlight', '#Ad']).map(t => (
                  <span key={t} className="guideline-tag">{t}</span>
                ))}
              </div>
            </div>

            <div className="guideline-block">
              <span className="guideline-block__label">Handles to Tag:</span>
              <div className="guideline-tags">
                {(guidelines.handlesToTag || ['@pg', '@proctergamble']).map(h => (
                  <span key={h} className="guideline-tag guideline-tag--handle">{h}</span>
                ))}
              </div>
            </div>

            <div className="guideline-block">
              <span className="guideline-block__label">Legal Disclosure:</span>
              <span className="guideline-disclosure">{guidelines.disclosureLabel || '#Ad or #Collab in caption'}</span>
            </div>

            <div className="guideline-block">
              <span className="guideline-block__label">Duration Limit:</span>
              <span className="guideline-duration">{guidelines.durationLimit || '30 to 60 seconds'}</span>
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="brief-dos-donts">
            <div className="dos-box">
              <div className="dos-donts-header dos-header">
                <Check size={14} />
                <span>Do's</span>
              </div>
              <ul>
                {(guidelines.dos || [
                  'Film in natural soft daylight with crisp audio',
                  'Show at least 2 styling transitions',
                  'Keep product in upper 70% of screen',
                ]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="donts-box">
              <div className="dos-donts-header donts-header">
                <X size={14} />
                <span>Don'ts</span>
              </div>
              <ul>
                {(guidelines.donts || [
                  'No mention of competing marketplaces',
                  'No blurry clips or unlicensed music',
                  'Do not post without Draft Approval',
                ]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Support & Key Dates */}
        <div className="overview-sidebar">
          {/* Support Account Manager Card (PRD 8.5 CO-04) */}
          <div className="overview-card overview-card--support">
            <div className="overview-card__header">
              <div className="overview-card__header-icon overview-card__header-icon--support">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="overview-card__title">Haulpack Support Lead</h3>
                <p className="overview-card__sub">Dedicated campaign solutions manager</p>
              </div>
            </div>

            <div className="support-lead-profile">
              <div className="support-lead-avatar" style={{ background: accountManager.avatarColor || '#655bef' }}>
                {accountManager.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="support-lead-info">
                <h4 className="support-lead-name">{accountManager.name}</h4>
                <p className="support-lead-role">{accountManager.role}</p>
                <div className="support-lead-contacts">
                  <a href={`mailto:${accountManager.email}`} className="support-contact-link">
                    <Mail size={13} />
                    <span>{accountManager.email}</span>
                  </a>
                  {accountManager.phone && (
                    <a href={`tel:${accountManager.phone}`} className="support-contact-link">
                      <Phone size={13} />
                      <span>{accountManager.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="support-note">
              <span>💡 Need revisions or assistance with creator deliverables? Contact your support lead anytime.</span>
            </div>
          </div>

          {/* Campaign Timeline Milestones */}
          {brief.timeline && (
            <div className="overview-card overview-card--timeline">
              <div className="overview-card__header">
                <div className="overview-card__header-icon">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="overview-card__title">Campaign Schedule</h3>
                  <p className="overview-card__sub">Milestones and delivery windows</p>
                </div>
              </div>

              <div className="timeline-items">
                <div className="timeline-item">
                  <span className="timeline-dot" />
                  <div className="timeline-content">
                    <strong>Registration Deadline:</strong>
                    <span>{brief.timeline.registrationDeadline}</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <span className="timeline-dot" />
                  <div className="timeline-content">
                    <strong>Product Dispatch Window:</strong>
                    <span>{brief.timeline.productDispatch}</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <span className="timeline-dot" />
                  <div className="timeline-content">
                    <strong>Draft Submission Deadline:</strong>
                    <span>{brief.timeline.draftSubmissionDeadline}</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <span className="timeline-dot timeline-dot--green" />
                  <div className="timeline-content">
                    <strong>Live Posting Window:</strong>
                    <span>{brief.timeline.goLiveWindow}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
