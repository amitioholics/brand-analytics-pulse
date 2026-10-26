import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Sparkles, Clock, Camera, ExternalLink, Play, RotateCcw,
  CheckCircle2, XCircle, Check
} from 'lucide-react';
import { formatDate, formatDateTime, formatCurrency, formatCompactNumber } from '../../utils/formatters';
import { useDeliverables } from '../../context/DeliverablesContext';
import './VideoReviewModal.css';

export default function VideoReviewModal({
  submission,
  onClose,
  onApproveDraft: propApproveDraft,
  onRejectDraft: propRejectDraft,
  onApproveLivePost: propApproveLivePost,
  onRejectLivePost: propRejectLivePost,
  initialRejectMode = false
}) {
  const navigate = useNavigate();
  const {
    submissions,
    approveDraft,
    rejectDraft,
    approveLivePost,
    rejectLivePost,
    resetDraftReview
  } = useDeliverables();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(initialRejectMode);
  const [rejectReason, setRejectReason] = useState('Missing Mandatory Disclosures (#Ad / #Collab)');
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!submission) return null;

  // Resolve current submission state from context
  const currentSubmission = (submissions && submissions.find(s => s.id === submission.id)) || submission;

  const isStage2 = currentSubmission.stage === 'final_review' ||
    currentSubmission.stage === 'live_approved' ||
    currentSubmission.stage === 'payment_approved' ||
    currentSubmission.stage === 'live_rejected';

  const isStage1Approved = currentSubmission.stage !== 'draft_review' && currentSubmission.stage !== 'draft_rejected';

  const isAwaitingLiveLink = currentSubmission.stage === 'awaiting_live_link';

  const isApproved = isStage2
    ? (currentSubmission.stage === 'live_approved' || currentSubmission.stage === 'payment_approved' || currentSubmission.liveStatus === 'Approved')
    : (currentSubmission.stage === 'awaiting_live_link' || currentSubmission.draftStatus === 'Approved');

  const isLiveApproved = isStage2 && (currentSubmission.stage === 'live_approved' || currentSubmission.stage === 'payment_approved' || currentSubmission.liveStatus === 'Approved');

  const isRejected = isStage2
    ? (currentSubmission.stage === 'live_rejected' || currentSubmission.liveStatus === 'Rejected')
    : (currentSubmission.stage === 'draft_rejected' || currentSubmission.draftStatus === 'Rejected');

  const handleApprove = () => {
    if (isStage2) {
      if (propApproveLivePost) {
        propApproveLivePost(currentSubmission.id, 'Live post verified by Brand Team.');
      } else if (approveLivePost) {
        approveLivePost(currentSubmission.id, 'Live post verified by Brand Team.');
      }
    } else {
      if (propApproveDraft) {
        propApproveDraft(currentSubmission.id, 'Content approved by Brand Team.');
      } else if (approveDraft) {
        approveDraft(currentSubmission.id, 'Content approved by Brand Team.');
      }
    }
  };

  const handleConfirmReject = () => {
    const reasonText = rejectReason || 'Revision requested from creator.';
    if (isStage2) {
      if (propRejectLivePost) {
        propRejectLivePost(currentSubmission.id, reasonText, rejectNotes);
      } else if (rejectLivePost) {
        rejectLivePost(currentSubmission.id, reasonText, rejectNotes);
      }
    } else {
      if (propRejectDraft) {
        propRejectDraft(currentSubmission.id, reasonText, rejectNotes);
      } else if (rejectDraft) {
        rejectDraft(currentSubmission.id, reasonText, rejectNotes);
      }
    }
    setShowRejectForm(false);
  };

  const handleUndo = () => {
    if (resetDraftReview) {
      resetDraftReview(currentSubmission.id);
    }
  };

  const initials = currentSubmission.creatorName
    ? currentSubmission.creatorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CR';

  const campaignTitle = (currentSubmission.campaignName || 'HAULPACK X AMAZON HEAD & SHOULDERS').toUpperCase();
  const displayUrl = isStage2
    ? (currentSubmission.livePostUrl || currentSubmission.socialMediaUrl || currentSubmission.videoUrl)
    : (currentSubmission.videoUrl || `https://storage.googleapis.com/haulpack-demo-media/creators/${currentSubmission.id}_raw.mp4`);

  const views = currentSubmission.socialMetrics?.views ?? currentSubmission.views ?? (currentSubmission.followerCount ? Math.round(currentSubmission.followerCount * 5.29) : 101900);
  const er = currentSubmission.socialMetrics?.er ?? currentSubmission.er ?? '10.1%';
  const sales = currentSubmission.socialMetrics?.sales ?? currentSubmission.sales ?? 0;

  // Stage Timeline Timestamps & Status Text
  const step1Time = currentSubmission.draftReviewedAt || (isStage1Approved ? currentSubmission.submittedAt : null);
  const step1TimeText = isStage1Approved
    ? formatDateTime(step1Time)
    : (currentSubmission.stage === 'draft_rejected'
        ? (currentSubmission.draftReviewedAt ? `Rejected ${formatDateTime(currentSubmission.draftReviewedAt)}` : 'Draft Rejected')
        : (currentSubmission.submittedAt ? `Submitted ${formatDateTime(currentSubmission.submittedAt)}` : 'Pending Review'));

  const step2Time = currentSubmission.livePostSubmittedAt || (isStage2 ? currentSubmission.submittedAt : null);
  const step2TimeText = isStage2
    ? formatDateTime(step2Time)
    : (isStage1Approved
        ? 'Awaiting Live Post'
        : 'Pending Stage 1');

  const step3Time = currentSubmission.liveReviewedAt;
  const step3TimeText = isLiveApproved
    ? formatDateTime(step3Time || step2Time)
    : (currentSubmission.stage === 'live_rejected'
        ? (currentSubmission.liveReviewedAt ? `Rejected ${formatDateTime(currentSubmission.liveReviewedAt)}` : 'Live Rejected')
        : (currentSubmission.stage === 'final_review'
            ? 'Pending QA Review'
            : 'Pending'));

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="video-modal__header">
          <div className="video-modal__header-info">
            <span className="video-modal__campaign-tag">
              <Sparkles size={13} color="#6538ea" />
              <span>{campaignTitle}</span>
            </span>
            <h2 className="video-modal__title">{currentSubmission.deliverableType || 'Instagram Reel'}</h2>
          </div>
          <button className="video-modal__close-btn" onClick={onClose} title="Close Studio">
            <X size={20} />
          </button>
        </div>

        {/* 3-Step Approval Pipeline Stepper with Stage Timelines */}
        <div className="review-stepper">
          {/* Step 1: Raw Video QA */}
          <div className={`review-step ${isStage1Approved ? 'review-step--completed' : (currentSubmission.stage === 'draft_rejected' ? 'review-step--rejected' : 'review-step--active')}`}>
            <div className={`review-step__circle ${
              isStage1Approved
                ? 'review-step__circle--green'
                : (currentSubmission.stage === 'draft_rejected'
                    ? 'review-step__circle--red'
                    : 'review-step__circle--purple')
            }`}>
              {isStage1Approved ? <Check size={14} strokeWidth={2.5} /> : (currentSubmission.stage === 'draft_rejected' ? <X size={14} strokeWidth={2.5} /> : '1')}
            </div>
            <div className="review-step__text">
              <span className="review-step__number">STAGE 1</span>
              <span className={`review-step__title ${
                isStage1Approved
                  ? 'review-step__title--dark'
                  : (currentSubmission.stage === 'draft_rejected'
                      ? 'review-step__title--red'
                      : 'review-step__title--purple')
              }`}>
                {isStage1Approved
                  ? 'Raw Video Approved'
                  : (currentSubmission.stage === 'draft_rejected' ? 'Draft Rejected' : 'Raw Video QA')}
              </span>
              <span className="review-step__time">
                {step1TimeText}
              </span>
            </div>
          </div>

          <div className={`review-stepper__line ${isStage2 ? 'review-stepper__line--green' : ''}`} />

          {/* Step 2: Creator Live Post */}
          <div className={`review-step ${isStage2 ? 'review-step--completed' : (isStage1Approved ? 'review-step--active' : 'review-step--upcoming')}`}>
            <div className={`review-step__circle ${isStage2 ? 'review-step__circle--green' : (isStage1Approved ? 'review-step__circle--purple' : '')}`}>
              {isStage2 ? <Check size={14} strokeWidth={2.5} /> : '2'}
            </div>
            <div className="review-step__text">
              <span className="review-step__number">CREATOR</span>
              <span className={`review-step__title ${isStage2 ? 'review-step__title--dark' : (isStage1Approved ? 'review-step__title--purple' : '')}`}>
                {isStage2 ? 'Live Post Published' : 'Creator Live Post'}
              </span>
              <span className="review-step__time">
                {step2TimeText}
              </span>
            </div>
          </div>

          <div className={`review-stepper__line ${isLiveApproved ? 'review-stepper__line--green' : ''}`} />

          {/* Step 3: Live Post QA */}
          <div className={`review-step ${
            isLiveApproved
              ? 'review-step--completed'
              : (currentSubmission.stage === 'live_rejected'
                  ? 'review-step--rejected'
                  : (currentSubmission.stage === 'final_review' ? 'review-step--active' : 'review-step--upcoming'))
          }`}>
            <div className={`review-step__circle ${
              isLiveApproved
                ? 'review-step__circle--green'
                : (currentSubmission.stage === 'live_rejected'
                    ? 'review-step__circle--red'
                    : (currentSubmission.stage === 'final_review' ? 'review-step__circle--purple' : ''))
            }`}>
              {isLiveApproved ? <Check size={14} strokeWidth={2.5} /> : (currentSubmission.stage === 'live_rejected' ? <X size={14} strokeWidth={2.5} /> : '3')}
            </div>
            <div className="review-step__text">
              <span className="review-step__number">STAGE 2</span>
              <span className={`review-step__title ${
                isLiveApproved
                  ? 'review-step__title--dark'
                  : (currentSubmission.stage === 'live_rejected'
                      ? 'review-step__title--red'
                      : (currentSubmission.stage === 'final_review' ? 'review-step__title--purple' : ''))
              }`}>
                {isLiveApproved
                  ? 'Live Post Approved'
                  : (currentSubmission.stage === 'live_rejected' ? 'Live Post Rejected' : 'Live Post QA')}
              </span>
              <span className="review-step__time">
                {step3TimeText}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="video-modal__body">
          {/* Left Column: Dark Preview Box */}
          <div className="video-modal__dark-preview">
            {isPlaying && currentSubmission.previewVideoUrl ? (
              <div className="video-modal__player-box">
                <video
                  src={currentSubmission.previewVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="video-modal__video-element"
                />
                <button
                  type="button"
                  className="video-modal__player-toggle-btn"
                  onClick={() => setIsPlaying(false)}
                >
                  <RotateCcw size={12} />
                  <span>Show Link View</span>
                </button>
              </div>
            ) : (
              <div className="video-modal__dark-center">
                <div
                  className="video-modal__camera-icon-wrapper"
                  onClick={() => currentSubmission.previewVideoUrl && setIsPlaying(true)}
                  style={{ cursor: currentSubmission.previewVideoUrl ? 'pointer' : 'default' }}
                  title={currentSubmission.previewVideoUrl ? 'Click to play demo video' : ''}
                >
                  <Camera size={26} color="#f43f5e" strokeWidth={1.8} />
                </div>
                <h3 className="video-modal__dark-heading">
                  {isStage2 ? 'Open Live Post Link' : 'Open Video Link'}
                </h3>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-modal__dark-url-link"
                >
                  <span>{displayUrl}</span>
                  <ExternalLink size={11} />
                </a>

                {currentSubmission.previewVideoUrl && (
                  <button
                    type="button"
                    className="video-modal__play-preview-pill"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Watch Preview Clip</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom Meta Row inside dark box matching Screenshot */}
            <div className="video-modal__dark-footer">
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-modal__dark-bar-link"
              >
                <div className="video-modal__dark-bar-left">
                  <Camera size={13} color="#f43f5e" />
                  <span>{currentSubmission.deliverableType || 'Instagram Reel'}</span>
                </div>
                <div className="video-modal__dark-bar-right">
                  <span>Open Link</span>
                  <ExternalLink size={10} />
                </div>
              </a>

              <div className="video-modal__dark-bubble">
                <Camera size={11} color="#f43f5e" />
                <span>{currentSubmission.creatorPlatform || 'Instagram'}</span>
              </div>

              <div className="video-modal__dark-bubble video-modal__dark-bubble--muted">
                <span>Submitted {formatDate(isStage2 ? (currentSubmission.livePostSubmittedAt || currentSubmission.submittedAt) : currentSubmission.submittedAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Creator Info, Social Metrics & Brand Action Options */}
          <div className="video-modal__right-col">
            <div className="video-modal__right-top">
              {/* Creator Row Card matching Screenshot */}
              <div
                className="video-modal__creator-row-card video-modal__creator-row-card--clickable"
                onClick={() => {
                  if (currentSubmission.creatorId) {
                    if (onClose) onClose();
                    navigate(`/creators/${currentSubmission.creatorId}`);
                  }
                }}
                title={`View ${currentSubmission.creatorName}'s profile`}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="video-modal__creator-avatar-circle"
                  style={{ background: currentSubmission.creatorAvatarColor || '#6366f1' }}
                >
                  {initials}
                </div>
                <div className="video-modal__creator-meta">
                  <div className="video-modal__creator-name-line">
                    <span className="video-modal__creator-name-text">{currentSubmission.creatorName}</span>
                    <span className="video-modal__handle-pill">
                      <Camera size={11} color="#6d28d9" />
                      <span>{currentSubmission.creatorHandle || '@onestop_classic'}</span>
                    </span>
                  </div>
                  <span className="video-modal__creator-sub-text">
                    {Number(currentSubmission.followerCount || 19260).toLocaleString()} followers • {currentSubmission.deliverableType || 'Instagram Reel'}
                  </span>
                </div>
              </div>

              {/* Live Post QA Approved Card (Screenshot Match) */}
              {isLiveApproved ? (
                <div className="video-modal__live-approved-card">
                  <div className="video-modal__qa-approved-badge">
                    <CheckCircle2 size={13} color="#15803d" />
                    <span>LIVE POST QA APPROVED</span>
                  </div>
                  <h3 className="video-modal__qa-approved-heading">Live Post Verified & Approved</h3>
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-modal__btn-view-live-post"
                  >
                    <span>View Approved Live Post</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              ) : isStage2 && currentSubmission.stage === 'final_review' ? (
                <div className="video-modal__status-box">
                  <span className="video-modal__status-tag">
                    <Clock size={13} />
                    <span>STAGE 2: BRAND LIVE POST VERIFICATION</span>
                  </span>
                  <h4 className="video-modal__status-title">Verify Creator Live Post</h4>
                  <p className="video-modal__status-desc">
                    Creator has published live on social media. Verify video content, required hashtags (#PGFamily #Ad), and link before giving final approval.
                  </p>
                </div>
              ) : isApproved ? (
                <div className="video-modal__status-box video-modal__status-box--approved">
                  <span className="video-modal__status-tag video-modal__status-tag--green">
                    <CheckCircle2 size={13} />
                    <span>STAGE 1: DRAFT APPROVED</span>
                  </span>
                  <h4 className="video-modal__status-title">Draft Approved — Awaiting Live Post</h4>
                  <p className="video-modal__status-desc">
                    Creative draft was approved. Creator is notified to publish live post on social media within SLA.
                  </p>
                </div>
              ) : (
                <div className="video-modal__status-box">
                  <span className="video-modal__status-tag">
                    <Clock size={13} />
                    <span>STAGE 1: BRAND CONTENT REVIEW</span>
                  </span>
                  <h4 className="video-modal__status-title">Review Creator Raw Video</h4>
                  <p className="video-modal__status-desc">
                    Admin pre-screening verified. Review creator raw video above and choose to approve for live publishing or reject with feedback.
                  </p>
                </div>
              )}

              {/* 3-Column Metrics Card (Screenshot Match) */}
              {isStage2 && (
                <div className="video-modal__metrics-container">
                  <div className="video-modal__metric-block">
                    <div className="video-modal__metric-label">REACH / VIEWS</div>
                    <div className="video-modal__metric-value video-modal__metric-value--dark">
                      {formatCompactNumber(views)}
                    </div>
                  </div>
                  <div className="video-modal__metric-block">
                    <div className="video-modal__metric-label">ENGAGEMENT</div>
                    <div className="video-modal__metric-value video-modal__metric-value--purple">
                      {er}
                    </div>
                  </div>
                  <div className="video-modal__metric-block">
                    <div className="video-modal__metric-label">SALES DRIVEN</div>
                    <div className="video-modal__metric-value video-modal__metric-value--green">
                      {formatCurrency(sales)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Brand Action Controls (when pending review and not awaiting live post) */}
            {!isLiveApproved && !isAwaitingLiveLink && (
              <div className="video-modal__brand-actions-container">
                {isRejected ? (
                  <div className="video-modal__rejected-banner">
                    <div className="video-modal__banner-left">
                      <XCircle size={18} color="#dc2626" />
                      <div>
                        <div className="video-modal__banner-title" style={{ color: '#991b1b' }}>
                          {isStage2 ? 'Live Link Rejected by Brand' : 'Content Rejected by Brand'}
                        </div>
                        <div className="video-modal__banner-sub" style={{ color: '#b91c1c' }}>
                          Reason: {currentSubmission.liveRejectionReason || currentSubmission.draftRejectionReason || 'Revision requested from creator.'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="video-modal__btn-undo"
                      onClick={handleUndo}
                      title="Undo and re-evaluate"
                    >
                      Re-evaluate
                    </button>
                  </div>
                ) : showRejectForm ? (
                  <div className="video-modal__reject-form">
                    <div className="video-modal__reject-header">
                      <span className="video-modal__reject-title">Select Rejection Reason</span>
                      <button
                        type="button"
                        className="video-modal__reject-close-btn"
                        onClick={() => setShowRejectForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                    <select
                      className="video-modal__reject-select"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    >
                      {isStage2 ? (
                        <>
                          <option value="Caption Guideline Violation (Missing @pg / #PGFamily)">Caption Guideline Violation (Missing @pg / #PGFamily)</option>
                          <option value="Missing Mandatory Disclosures (#Ad / #Collab)">Missing Mandatory Disclosures (#Ad / #Collab)</option>
                          <option value="Missing or Incorrect Promo Code">Missing or Incorrect Promo Code</option>
                          <option value="Broken / Missing Live Link">Broken / Missing Live Link</option>
                          <option value="Other Live Link Revision Feedback">Other Live Link Revision Feedback</option>
                        </>
                      ) : (
                        <>
                          <option value="Missing Mandatory Disclosures (#Ad / #Collab)">Missing Mandatory Disclosures (#Ad / #Collab)</option>
                          <option value="Video Length Mismatch">Video Length Mismatch</option>
                          <option value="Audio / Background Noise Issues">Audio / Background Noise Issues</option>
                          <option value="Poor Lighting or Framing">Poor Lighting or Framing</option>
                          <option value="Other Custom Revision Feedback">Other Custom Revision Feedback</option>
                        </>
                      )}
                    </select>
                    <textarea
                      className="video-modal__reject-textarea"
                      placeholder="Provide specific revision notes for the creator..."
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      rows={2}
                    />
                    <div className="video-modal__reject-actions">
                      <button
                        type="button"
                        className="video-modal__btn-cancel"
                        onClick={() => setShowRejectForm(false)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="video-modal__btn-confirm-reject"
                        onClick={handleConfirmReject}
                      >
                        <XCircle size={14} />
                        <span>Confirm Rejection</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="video-modal__action-bar">
                    <button
                      type="button"
                      className="video-modal__btn-approve"
                      onClick={handleApprove}
                    >
                      <CheckCircle2 size={17} />
                      <span>{isStage2 ? 'Approve Live Post' : 'Approve Content'}</span>
                    </button>
                    <button
                      type="button"
                      className="video-modal__btn-reject"
                      onClick={() => setShowRejectForm(true)}
                    >
                      <XCircle size={17} />
                      <span>{isStage2 ? 'Reject Live Post' : 'Reject Content'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {(isLiveApproved || isAwaitingLiveLink) && (
              <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <button
                  type="button"
                  className="video-modal__btn-undo-subtle"
                  onClick={handleUndo}
                  title={isAwaitingLiveLink ? 'Re-open draft review' : 'Re-open review'}
                >
                  {isAwaitingLiveLink ? 'Re-open Draft Review' : 'Re-open Review'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
