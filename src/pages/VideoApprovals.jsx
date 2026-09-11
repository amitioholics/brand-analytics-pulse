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
            <span className="approvals-page__kpi-label">Stage 1: Drafts to Review</span>
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
          1. Draft QA Pending ({pendingDraftsCount})
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
          3. Live Posts Pending ({pendingLivePostsCount})
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
          placeholder="Search creator name, @handle, video title, or live link..."
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
            const isDraftPending = sub.stage === 'draft_review';
            const isFinalPending = sub.stage === 'final_review';
            const isApproved = sub.stage === 'live_approved' || sub.stage === 'payment_approved';
            const isAwaitingLive = sub.stage === 'awaiting_live_link';
            const isRejected = sub.stage === 'draft_rejected' || sub.stage === 'live_rejected';

            return (
              <div
                key={sub.id}
                className={`approval-card approval-card--${sub.stage}`}
                onClick={() => {
                  setSelectedSubmission(sub);
                  setModalRejectMode(false);
                }}
              >
                {/* Media Preview Box */}
                <div className="approval-card__preview">
                  <video
                    src={sub.videoUrl}
                    className="approval-card__video-thumb"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="approval-card__play-badge">
                    <Play size={18} fill="#ffffff" />
                  </div>
                  <span className="approval-card__duration-badge">{sub.duration}</span>
                  <span className="approval-card__format-badge">{sub.deliverableType}</span>
                </div>

                {/* Card Body */}
                <div className="approval-card__body">
                  {/* Campaign name + Deliverable Tag */}
                  <div className="approval-card__meta-top">
                    <span className="approval-card__campaign-name" title={sub.campaignName}>
                      {sub.campaignName}
                    </span>
                    <span className="approval-card__format-tag">
                      {sub.deliverableType}
                    </span>
                  </div>

                  {/* Stage Pill */}
                  <div className="approval-card__stage-pill-row">
                    <span className={`stage-status-pill stage-status-pill--${sub.stage}`}>
                      {isDraftPending && <Clock size={11} />}
                      {isFinalPending && <Sparkles size={11} />}
                      {isApproved && <CheckCircle2 size={11} />}
                      {isAwaitingLive && <Send size={11} />}
                      {isRejected && <ShieldAlert size={11} />}
                      <span>{sub.status}</span>
                    </span>
                  </div>

                  {/* Video Title */}
                  <h3 className="approval-card__title">{sub.videoTitle}</h3>

                  {/* Creator Header */}
                  <div className="approval-card__creator">
                    <div
                      className="approval-card__avatar"
                      style={{ background: sub.creatorAvatarColor || 'var(--hp-primary)' }}
                    >
                      {sub.creatorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="approval-card__creator-info">
                      <span className="approval-card__creator-name">{sub.creatorName}</span>
                      <span className="approval-card__creator-handle">{sub.creatorHandle} • {sub.creatorPlatform}</span>
                    </div>
                    <span className="approval-card__date">{formatDate(sub.submittedAt)}</span>
                  </div>

                  {/* Live Link Preview if submitted */}
                  {sub.livePostUrl && (
                    <div className="approval-card__live-link-box" onClick={(e) => e.stopPropagation()}>
                      <div className="approval-card__live-link-header">
                        <PlatformIcon platform={sub.livePlatform} size={13} />
                        <span>Live Post URL:</span>
                      </div>
                      <a
                        href={sub.livePostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="approval-card__live-link"
                        title={sub.livePostUrl}
                      >
                        <span>{sub.livePostUrl}</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}

                  {/* Rejection Alert Box */}
                  {isRejected && (
                    <div className="approval-card__rejected-box">
                      <ShieldAlert size={14} color="#ef4444" />
                      <div>
                        <strong>{sub.stage === 'draft_rejected' ? 'Draft Rejection:' : 'Live Post Rejection:'}</strong>
                        <span> {sub.draftRejectionReason || sub.liveRejectionReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Approved Success Box */}
                  {isApproved && (
                    <div className="approval-card__approved-box">
                      <CheckCircle2 size={14} color="#059669" />
                      <div>
                        <strong>Live Post Approved</strong>
                        <span> — Verified & approved by admin</span>
                      </div>
                    </div>
                  )}

                  {/* Awaiting Live Callout */}
                  {isAwaitingLive && (
                    <div className="approval-card__awaiting-box">
                      <Send size={14} color="#0284c7" />
                      <span>Draft approved! Waiting for creator to share live Reel/YouTube URL.</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="approval-card__actions" onClick={(e) => e.stopPropagation()}>
                    {/* Stage 1 Pending Action */}
                    {isDraftPending && (
                      <>
                        <button
                          type="button"
                          className="approval-card__review-btn"
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setModalRejectMode(false);
                          }}
                        >
                          <Eye size={13} />
                          <span>Review Draft</span>
                        </button>
                        <button
                          type="button"
                          className="approval-card__quick-approve-btn"
                          onClick={() => approveDraft(sub.id, 'Draft approved via QA Studio.')}
                          title="Quick Approve Draft"
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          className="approval-card__quick-reject-btn"
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

                    {/* Stage 2 Live Post Review Action */}
                    {isFinalPending && (
                      <>
                        <button
                          type="button"
                          className="approval-card__verify-pay-btn"
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setModalRejectMode(false);
                          }}
                        >
                          <Sparkles size={13} />
                          <span>Review Live Post</span>
                        </button>
                        <button
                          type="button"
                          className="approval-card__quick-approve-btn"
                          onClick={() => approveLivePost(sub.id, 'Live post verified and approved.')}
                          title="Approve Live Post"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          className="approval-card__quick-reject-btn"
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

                    {/* Awaiting Live Link Action (Creator uploads from their end) */}
                    {isAwaitingLive && (
                      <button
                        type="button"
                        className="approval-card__review-btn approval-card__review-btn--secondary"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setModalRejectMode(false);
                        }}
                      >
                        <Eye size={13} />
                        <span>View Draft Details</span>
                      </button>
                    )}

                    {/* Already Approved or Rejected */}
                    {(isApproved || isRejected) && (
                      <button
                        type="button"
                        className="approval-card__review-btn approval-card__review-btn--secondary"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setModalRejectMode(false);
                        }}
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
                    )}
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
