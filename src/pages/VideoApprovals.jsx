import { useState, useMemo } from 'react';
import {
  Play, CheckCircle2, XCircle, Clock, Filter, Sparkles,
  ShieldAlert, Check, MessageSquare, Tag, Eye, ArrowRight, Video,
  DollarSign, Send, ExternalLink, Camera, CheckCircle
} from 'lucide-react';
import { useDeliverables } from '../context/DeliverablesContext';
import { usePortal } from '../context/PortalContext';
import { formatDate, formatNumber } from '../utils/formatters';
import Breadcrumb from '../components/common/Breadcrumb';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import VideoReviewModal from '../components/video/VideoReviewModal';
import PGLogo from '../components/common/PGLogo';
import './VideoApprovals.css';

function PlatformIcon({ platform, size = 13 }) {
  if (platform === 'YouTube') {
    return <Video size={size} color="#ef4444" />;
  }
  return <Camera size={size} color="#e1306c" />;
}

export default function VideoApprovals() {
  const {
    submissions,
    pendingDraftsCount,
    pendingLivePostsCount,
    awaitingLiveLinkCount,
    liveApprovedCount,
    paymentApprovedCount,
    rejectedCount,
    approveDraft,
    rejectDraft,
    submitLiveLink,
    approveLivePost,
    rejectLivePost,
    approveFinalPayment,
    rejectFinalPayment,
  } = useDeliverables();

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalRejectMode, setModalRejectMode] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('All');

  // Available campaigns from submissions
  const activeCampaignOptions = useMemo(() => {
    const map = new Map();
    submissions.forEach(s => map.set(s.campaignId, s.campaignName));
    return [
      { value: 'All', label: 'All Active Campaigns' },
      ...Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name })),
    ];
  }, [submissions]);

  const approvedTotal = liveApprovedCount || paymentApprovedCount || 0;

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (campaignFilter !== 'All' && sub.campaignId !== campaignFilter) return false;

      if (stageFilter === 'draft_review' && sub.stage !== 'draft_review') return false;
      if (stageFilter === 'awaiting_live_link' && sub.stage !== 'awaiting_live_link') return false;
      if (stageFilter === 'final_review' && sub.stage !== 'final_review') return false;
      if ((stageFilter === 'live_approved' || stageFilter === 'payment_approved') && sub.stage !== 'live_approved' && sub.stage !== 'payment_approved') return false;
      if (stageFilter === 'rejected' && sub.stage !== 'draft_rejected' && sub.stage !== 'live_rejected') return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          sub.creatorName.toLowerCase().includes(q) ||
          sub.creatorHandle.toLowerCase().includes(q) ||
          sub.videoTitle.toLowerCase().includes(q) ||
          (sub.livePostUrl && sub.livePostUrl.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [submissions, stageFilter, campaignFilter, search]);

  return (
    <div className="approvals-page fade-in">
      <Breadcrumb
        items={[
          { label: 'Brand Connect', to: '/' },
          { label: 'Video Approvals & QA Studio' },
        ]}
      />

      {/* Header */}
      <div className="approvals-page__header">
        <div>
          <div className="approvals-page__badge">
            <Video size={14} />
            <span>Two-Stage Creator QA Pipeline</span>
          </div>
          <h1 className="approvals-page__title">Video Approvals & QA Studio</h1>
          <p className="approvals-page__subtitle">
            Two-stage review cycle for active Brand Connect campaigns: <strong>Stage 1</strong> reviews creator content draft videos before posting; <strong>Stage 2</strong> verifies the live Instagram Reel or YouTube URL before final approval.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="approvals-page__kpis">
        {/* Stage 1 Pending */}
        <div
          className={`approvals-page__kpi-card approvals-page__kpi-card--pending ${stageFilter === 'draft_review' ? 'approvals-page__kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'draft_review' ? 'all' : 'draft_review')}
        >
          <div className="approvals-page__kpi-icon" style={{ color: '#d97706', background: '#fef3c7' }}>
            <Clock size={20} />
          </div>
          <div className="approvals-page__kpi-content">
            <span className="approvals-page__kpi-val" style={{ color: '#b45309' }}>{pendingDraftsCount}</span>
            <span className="approvals-page__kpi-label">Stage 1: Raw Videos to Review</span>
          </div>
        </div>

        {/* Stage 2 Live Posts Pending */}
        <div
          className={`approvals-page__kpi-card approvals-page__kpi-card--final ${stageFilter === 'final_review' ? 'approvals-page__kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'final_review' ? 'all' : 'final_review')}
        >
          <div className="approvals-page__kpi-icon" style={{ color: '#86198f', background: '#fdf4ff' }}>
            <Sparkles size={20} />
          </div>
          <div className="approvals-page__kpi-content">
            <span className="approvals-page__kpi-val" style={{ color: '#86198f' }}>{pendingLivePostsCount}</span>
            <span className="approvals-page__kpi-label">Stage 2: Live Posts to Review</span>
          </div>
        </div>

        {/* Live Posts Approved */}
        <div
          className={`approvals-page__kpi-card approvals-page__kpi-card--approved ${(stageFilter === 'live_approved' || stageFilter === 'payment_approved') ? 'approvals-page__kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'live_approved' ? 'all' : 'live_approved')}
        >
          <div className="approvals-page__kpi-icon" style={{ color: '#10b981', background: '#d1fae5' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="approvals-page__kpi-content">
            <span className="approvals-page__kpi-val" style={{ color: '#059669' }}>{approvedTotal}</span>
            <span className="approvals-page__kpi-label">Live Posts Approved</span>
          </div>
        </div>

        {/* Rejections */}
        <div
          className={`approvals-page__kpi-card approvals-page__kpi-card--rejected ${stageFilter === 'rejected' ? 'approvals-page__kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'rejected' ? 'all' : 'rejected')}
        >
          <div className="approvals-page__kpi-icon" style={{ color: '#ef4444', background: '#fee2e2' }}>
            <ShieldAlert size={20} />
          </div>
          <div className="approvals-page__kpi-content">
            <span className="approvals-page__kpi-val" style={{ color: '#dc2626' }}>{rejectedCount}</span>
            <span className="approvals-page__kpi-label">Rejections with Reason</span>
          </div>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="approvals-page__stage-tabs">
        <button
          type="button"
          className={`stage-tab ${stageFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStageFilter('all')}
        >
          All Deliverables ({submissions.length})
        </button>
        <button
          type="button"
          className={`stage-tab ${stageFilter === 'draft_review' ? 'active' : ''}`}
          onClick={() => setStageFilter('draft_review')}
        >
          1. Raw Videos to Review ({pendingDraftsCount})
        </button>
        <button
          type="button"
          className={`stage-tab ${stageFilter === 'awaiting_live_link' ? 'active' : ''}`}
          onClick={() => setStageFilter('awaiting_live_link')}
        >
          2. Awaiting Live Post ({awaitingLiveLinkCount})
        </button>
        <button
          type="button"
          className={`stage-tab ${stageFilter === 'final_review' ? 'active' : ''}`}
          onClick={() => setStageFilter('final_review')}
        >
          3. Live Posts to Review ({pendingLivePostsCount})
        </button>
        <button
          type="button"
          className={`stage-tab ${stageFilter === 'live_approved' ? 'active' : ''}`}
          onClick={() => setStageFilter('live_approved')}
        >
          4. Live Posts Approved ({approvedTotal})
        </button>
        <button
          type="button"
          className={`stage-tab ${stageFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => setStageFilter('rejected')}
        >
          Rejections ({rejectedCount})
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="approvals-page__toolbar">
        <SearchBar
          placeholder="Search creator name, @handle..."
          onSearch={(v) => setSearch(v)}
        />
        <div className="approvals-page__filter-group">
          <FilterDropdown
            label="Campaign"
            value={campaignFilter}
            onChange={setCampaignFilter}
            options={activeCampaignOptions}
          />
        </div>
      </div>

      {/* Submissions Grid */}
      {filteredSubmissions.length === 0 ? (
        <div className="approvals-page__empty-state">
          <Video size={42} color="var(--hp-text-tertiary)" />
          <h3>No Deliverables Found in this Filter</h3>
          <p>Try switching to "All Deliverables" or clear your search.</p>
        </div>
      ) : (
        <div className="approvals-page__grid">
          {filteredSubmissions.map((sub) => {
            const initials = sub.creatorName
              ? sub.creatorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'CR';

            return (
              <div
                key={sub.id}
                className="approval-card"
                onClick={() => {
                  setSelectedSubmission(sub);
                  setModalRejectMode(false);
                }}
              >
                {/* Media Preview Box (Dark with pink camera matching Screenshot 2) */}
                <div className="approval-card__preview approval-card__preview--dark">
                  <div className="approval-card__dark-center">
                    <Camera size={32} color="#f43f5e" strokeWidth={1.8} />
                    <div className="approval-card__dark-open-row">
                      <span>{sub.livePostUrl ? 'View Live' : 'Open'}</span>
                      <ExternalLink size={12} color="#ffffff" />
                    </div>
                  </div>
                  <span className="approval-card__format-badge">
                    {sub.deliverableType || 'Raw Video'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="approval-card__body">
                  {/* Campaign name + Deliverable Tag */}
                  <div className="approval-card__meta-top">
                    <span className="approval-card__campaign-name" title={sub.campaignName} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <PGLogo size={14} />
                      <span>{(sub.campaignName || 'HAULPACK X AMAZON HEAD & SHOULDERS').toUpperCase()}</span>
                    </span>
                    <span className="approval-card__format-tag">
                      {sub.deliverableType || 'Raw Video'}
                    </span>
                  </div>

                  {/* Stage Pill */}
                  <div className="approval-card__stage-pill-row">
                    {sub.stage === 'draft_review' && (
                      <span className="approval-card__status-badge-amber">
                        <Clock size={11} />
                        <span>{sub.status || 'Raw Video Pending Review'}</span>
                      </span>
                    )}
                    {sub.stage === 'awaiting_live_link' && (
                      <span className="approval-card__status-badge-purple">
                        <Clock size={11} />
                        <span>{sub.status || 'Awaiting Live Link'}</span>
                      </span>
                    )}
                    {sub.stage === 'final_review' && (
                      <span className="approval-card__status-badge-fuchsia">
                        <Sparkles size={11} />
                        <span>{sub.status || 'Live Post Pending Review'}</span>
                      </span>
                    )}
                    {(sub.stage === 'live_approved' || sub.stage === 'payment_approved') && (
                      <span className="approval-card__status-badge-green">
                        <CheckCircle2 size={11} />
                        <span>{sub.status || 'Live Post Approved'}</span>
                      </span>
                    )}
                    {(sub.stage === 'draft_rejected' || sub.stage === 'live_rejected') && (
                      <span className="approval-card__status-badge-red">
                        <ShieldAlert size={11} />
                        <span>{sub.status || 'Revision Requested'}</span>
                      </span>
                    )}
                  </div>

                  {/* Video Title */}
                  <h3 className="approval-card__title">{sub.videoTitle || 'Raw Video'}</h3>

                  {/* Creator Header */}
                  <div className="approval-card__creator">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        className="approval-card__avatar"
                        style={{ background: sub.creatorAvatarColor || '#ec4899' }}
                      >
                        {initials}
                      </div>
                      <span className="approval-card__creator-name">{sub.creatorName}</span>
                    </div>
                    <span className="approval-card__date">{formatDate(sub.submittedAt)}</span>
                  </div>

                  {/* Action Buttons (Single clean Review button matching deployed Screenshot 2) */}
                  <div className="approval-card__actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="approval-card__review-btn-deployed"
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setModalRejectMode(false);
                      }}
                    >
                      <Eye size={14} />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Review Modal */}
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
    </div>
  );
}
