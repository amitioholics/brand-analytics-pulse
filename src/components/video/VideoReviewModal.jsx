import { useState, useRef, useEffect } from 'react';
import {
  X, CheckCircle, XCircle, AlertCircle, Play, Pause, Volume2,
  VolumeX, Tag, Calendar, User, ExternalLink, MessageSquare,
  Sparkles, ShieldAlert, Check, CheckCircle2, Camera, Video,
  Award, Clock, ArrowRight, RotateCcw
} from 'lucide-react';
import { DRAFT_REJECTION_REASONS, LIVE_POST_REJECTION_REASONS } from '../../data/videoSubmissions';
import { formatDate } from '../../utils/formatters';
import './VideoReviewModal.css';

function PlatformIcon({ platform, size = 15 }) {
  if (platform === 'YouTube') {
    return <Video size={size} color="#ef4444" />;
  }
  return <Camera size={size} color="#e1306c" />;
}

export default function VideoReviewModal({
  submission,
  onClose,
  onApproveDraft,
  onRejectDraft,
  onApproveLivePost,
  onRejectLivePost,
  onApproveFinalPayment,
  onRejectFinalPayment,
  onApprove,
  onReject,
  initialRejectMode = false,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeSideTab, setActiveSideTab] = useState('decision'); // 'decision' | 'brief_checklist'
  const [showRejectForm, setShowRejectForm] = useState(initialRejectMode || false);
  const [selectedReasonId, setSelectedReasonId] = useState('');
  const [customReasonText, setCustomReasonText] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(null);

  const videoRef = useRef(null);

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!submission) return null;

  const isStageFinal = submission.stage === 'final_review' || submission.stage === 'live_rejected';
  const isAwaitingLiveLink = submission.stage === 'awaiting_live_link';
  const isLiveApproved = submission.stage === 'live_approved' || submission.stage === 'payment_approved';
  const isDraftStage = submission.stage === 'draft_review' || submission.stage === 'draft_rejected' || !submission.stage;
  const isDraftRejected = submission.stage === 'draft_rejected';
  const isLiveRejected = submission.stage === 'live_rejected';

  const activeRejectionReasons = isStageFinal ? LIVE_POST_REJECTION_REASONS : DRAFT_REJECTION_REASONS;

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Stage 1: Admin Approves Draft Video
  const handleApproveDraftAction = () => {
    if (onApproveDraft) {
      onApproveDraft(submission.id, reviewNote);
    } else if (onApprove) {
      onApprove(submission.id, reviewNote);
    }
    setShowSuccessBanner('draft_approved');
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  // Stage 1: Admin Rejects Draft Video with Reason
  const handleRejectDraftAction = () => {
    const selectedObj = activeRejectionReasons.find(r => r.id === selectedReasonId);
    let finalReason = selectedObj ? selectedObj.label : '';
    if (selectedReasonId.startsWith('custom') || !finalReason) {
      finalReason = customReasonText;
    } else if (customReasonText) {
      finalReason = `${finalReason}: ${customReasonText}`;
    }
    if (!finalReason.trim()) return;

    if (onRejectDraft) {
      onRejectDraft(submission.id, finalReason, customReasonText);
    } else if (onReject) {
      onReject(submission.id, finalReason, customReasonText);
    }
    setShowSuccessBanner('draft_rejected');
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  // Stage 2: Admin Approves Live Post
  const handleApproveLivePostAction = () => {
    if (onApproveLivePost) {
      onApproveLivePost(submission.id, reviewNote);
    } else if (onApproveFinalPayment) {
      onApproveFinalPayment(submission.id, reviewNote);
    } else if (onApprove) {
      onApprove(submission.id, reviewNote);
    }
    setShowSuccessBanner('live_approved');
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  // Stage 2: Admin Rejects Live Post with Reason
  const handleRejectLivePostAction = () => {
    const selectedObj = activeRejectionReasons.find(r => r.id === selectedReasonId);
    let finalReason = selectedObj ? selectedObj.label : '';
    if (selectedReasonId.startsWith('custom') || !finalReason) {
      finalReason = customReasonText;
    } else if (customReasonText) {
      finalReason = `${finalReason}: ${customReasonText}`;
    }
    if (!finalReason.trim()) return;

    if (onRejectLivePost) {
      onRejectLivePost(submission.id, finalReason, customReasonText);
    } else if (onRejectFinalPayment) {
      onRejectFinalPayment(submission.id, finalReason, customReasonText);
    } else if (onReject) {
      onReject(submission.id, finalReason, customReasonText);
    }
    setShowSuccessBanner('live_rejected');
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  const isRejectDisabled = !selectedReasonId || (selectedReasonId.startsWith('custom') && !customReasonText.trim());

  // Stepper calculations (Strictly QA & Approval: No "Upload" steps)
  const isDraftApproved = submission.draftStatus === 'Approved' || isAwaitingLiveLink || isStageFinal || isLiveApproved;
  const isLiveSubmitted = !!submission.livePostUrl || isStageFinal || isLiveApproved;

  const step1Status = isDraftRejected
    ? 'review-step--rejected'
    : isDraftApproved
    ? 'review-step--done'
    : 'review-step--active';

  const step1Done = isDraftApproved && !isDraftRejected;

  const step2Status = isLiveSubmitted
    ? 'review-step--done'
    : isAwaitingLiveLink
    ? 'review-step--active'
    : 'review-step--upcoming';

  const step2Done = isLiveSubmitted;

  const step3Status = isLiveApproved
    ? 'review-step--done'
    : isLiveRejected
    ? 'review-step--rejected'
    : isStageFinal
    ? 'review-step--active'
    : 'review-step--upcoming';

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="video-modal__header">
          <div className="video-modal__header-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="video-modal__campaign-tag">
                <Sparkles size={13} />
                {submission.campaignName}
              </span>
              <span className="video-modal__sla-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                <Clock size={12} />
                <span>18h left in SLA</span>
              </span>
            </div>
            <h2 className="video-modal__title">{submission.videoTitle}</h2>
          </div>
          <button className="video-modal__close-btn" onClick={onClose} title="Close Studio">
            <X size={20} />
          </button>
        </div>

        {/* 3-Step Approval Pipeline Stepper */}
        <div className="review-stepper">
          {/* Step 1: Draft QA */}
          <div className={`review-step ${step1Status}`}>
            <div className="review-step__circle">
              {step1Status === 'review-step--done' ? (
                <Check size={13} strokeWidth={3} />
              ) : step1Status === 'review-step--rejected' ? (
                <X size={13} strokeWidth={3} />
              ) : (
                '1'
              )}
            </div>
            <div className="review-step__text">
              <span className="review-step__number">Stage 1</span>
              <span className="review-step__title">
                {step1Status === 'review-step--done'
                  ? 'Draft QA Approved'
                  : step1Status === 'review-step--rejected'
                  ? 'Draft Revision'
                  : 'Draft Video QA'}
              </span>
            </div>
          </div>

          <div className={`review-stepper__line ${step1Done ? 'review-stepper__line--done' : ''}`} />

          {/* Step 2: Creator Live Post */}
          <div className={`review-step ${step2Status}`}>
            <div className="review-step__circle">
              {step2Status === 'review-step--done' ? (
                <Check size={13} strokeWidth={3} />
              ) : (
                '2'
              )}
            </div>
            <div className="review-step__text">
              <span className="review-step__number">Creator</span>
              <span className="review-step__title">
                {step2Status === 'review-step--done'
                  ? 'Live Post Published'
                  : step2Status === 'review-step--active'
                  ? 'Publishing Live...'
                  : 'Creator Live Post'}
              </span>
            </div>
          </div>

          <div className={`review-stepper__line ${step2Done ? 'review-stepper__line--done' : ''}`} />

          {/* Step 3: Live Post QA */}
          <div className={`review-step ${step3Status}`}>
            <div className="review-step__circle">
              {step3Status === 'review-step--done' ? (
                <Check size={13} strokeWidth={3} />
              ) : step3Status === 'review-step--rejected' ? (
                <X size={13} strokeWidth={3} />
              ) : (
                '3'
              )}
            </div>
            <div className="review-step__text">
              <span className="review-step__number">Stage 2</span>
              <span className="review-step__title">
                {step3Status === 'review-step--done'
                  ? 'Live QA Approved'
                  : step3Status === 'review-step--rejected'
                  ? 'Live Revision'
                  : 'Live Post QA'}
              </span>
            </div>
          </div>
        </div>

        {/* Temporary Success Banners */}
        {showSuccessBanner === 'draft_approved' && (
          <div className="video-modal__status-banner video-modal__status-banner--success">
            <CheckCircle size={20} />
            <div>
              <strong>Content Draft Approved!</strong>
              <span>Creator has been notified to publish the post live on {submission.creatorPlatform || 'Instagram'}.</span>
            </div>
          </div>
        )}
        {showSuccessBanner === 'draft_rejected' && (
          <div className="video-modal__status-banner video-modal__status-banner--danger">
            <XCircle size={20} />
            <div>
              <strong>Draft Rejected with Feedback</strong>
              <span>Revision guidance has been sent to the creator.</span>
            </div>
          </div>
        )}
        {showSuccessBanner === 'live_approved' && (
          <div className="video-modal__status-banner video-modal__status-banner--success">
            <CheckCircle2 size={20} />
            <div>
              <strong>Live Post Approved!</strong>
              <span>The live post compliance has been verified and successfully approved.</span>
            </div>
          </div>
        )}
        {showSuccessBanner === 'live_rejected' && (
          <div className="video-modal__status-banner video-modal__status-banner--danger">
            <ShieldAlert size={20} />
            <div>
              <strong>Live Post Rejected with Reason</strong>
              <span>Creator requested to update live post caption/disclosures.</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="video-modal__body">
          {/* Left Column: Video Draft Player */}
          <div className="video-modal__player-section">
            <div className="video-modal__player-wrapper">
              <video
                ref={videoRef}
                src={submission.videoUrl}
                className="video-modal__video"
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {!isPlaying && (
                <button
                  type="button"
                  className="video-modal__player-center-play"
                  onClick={handlePlayToggle}
                  aria-label="Play video"
                >
                  <Play size={26} fill="#ffffff" color="#ffffff" style={{ marginLeft: '3px' }} />
                </button>
              )}

              <div className="video-modal__player-controls">
                <button
                  type="button"
                  className="video-modal__control-btn"
                  onClick={handlePlayToggle}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                </button>
                <button
                  type="button"
                  className="video-modal__control-btn"
                  onClick={handleMuteToggle}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <span className="video-modal__player-time">{submission.duration}</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '1px 3px', gap: 2 }}>
                  {[1, 1.5, 2].map(spd => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedChange(spd)}
                      style={{
                        background: playbackSpeed === spd ? 'var(--hp-primary, #655bef)' : 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                      title={`Play at ${spd}x speed`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
                <span className="video-modal__player-pill">{submission.deliverableType}</span>
              </div>
            </div>

            {/* Video Meta Highlight Tags */}
            <div className="video-modal__video-tags">
              <div className="video-tag">
                <PlatformIcon platform={submission.creatorPlatform} size={13} />
                <span>{submission.creatorPlatform}</span>
              </div>
              <div className="video-tag">
                <Calendar size={13} />
                <span>Submitted {formatDate(submission.submittedAt)}</span>
              </div>
              <div className="video-tag video-tag--highlight">
                <Award size={13} />
                <span>{submission.deliverableType}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Review Details & Dynamic Stage Actions */}
          <div className="video-modal__info-section">
            {/* Creator Row */}
            <div className="video-modal__creator-card">
              <div
                className="video-modal__creator-avatar"
                style={{ background: submission.creatorAvatarColor || 'var(--hp-primary)' }}
              >
                {submission.creatorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="video-modal__creator-info">
                <div className="video-modal__creator-name-row">
                  <h4 className="video-modal__creator-name">{submission.creatorName}</h4>
                  <span className="video-modal__creator-badge">
                    <PlatformIcon platform={submission.creatorPlatform} size={12} />
                    <span>{submission.creatorHandle}</span>
                  </span>
                </div>
                <div className="video-modal__creator-sub">
                  <span>{(submission.followerCount || 100000).toLocaleString()} followers</span>
                  <span className="video-modal__dot-sep">•</span>
                  <span>{submission.deliverableType}</span>
                </div>
              </div>
            </div>

            {/* ==============================================================
                STAGE STATUS CALLOUT BOXES (Tailored per stage)
               ============================================================== */}

            {/* State 1: Draft Pending Review */}
            {submission.stage === 'draft_review' && (
              <div className="status-stage-callout status-stage-callout--draft-review">
                <div className="status-stage-callout__badge">
                  <Clock size={13} />
                  <span>Stage 1: Content Draft QA Pending</span>
                </div>
                <h4>Review Creator Video Draft</h4>
                <p>
                  Watch the draft video, inspect brand logo placement, audio, and caption copy below. Once satisfied, click <strong>Approve Draft</strong> to notify creator to publish live, or <strong>Reject Draft</strong> with feedback.
                </p>
              </div>
            )}

            {/* State 2: Draft Rejected */}
            {isDraftRejected && (
              <div className="status-stage-callout status-stage-callout--rejected">
                <div className="status-stage-callout__badge">
                  <AlertCircle size={13} />
                  <span>Draft Revision Requested</span>
                </div>
                <h4>Feedback Sent to Creator</h4>
                <div className="status-stage-callout__detail-item">
                  <strong>Rejection Reason:</strong>
                  <span>{submission.draftRejectionReason}</span>
                </div>
                {submission.draftReviewNotes && (
                  <div className="status-stage-callout__detail-item">
                    <strong>Admin Guidance:</strong>
                    <span>{submission.draftReviewNotes}</span>
                  </div>
                )}
                <div className="status-stage-callout__re-action-row">
                  <button
                    type="button"
                    className="status-stage-callout__re-btn"
                    onClick={handleApproveDraftAction}
                  >
                    <Check size={13} />
                    <span>Re-Approve Draft Instead</span>
                  </button>
                </div>
              </div>
            )}

            {/* State 3: Awaiting Live Link (Draft Approved, creator needs to publish) */}
            {isAwaitingLiveLink && (
              <div className="status-stage-callout status-stage-callout--awaiting">
                <div className="status-stage-callout__badge">
                  <CheckCircle2 size={13} />
                  <span>Stage 1 Draft Approved</span>
                </div>
                <h4>Waiting for Creator to Post & Share Live Link</h4>
                <p>
                  Content draft was approved on {formatDate(submission.draftReviewedAt || submission.submittedAt)}. The creator has been notified to publish the post live on {submission.creatorPlatform || 'Instagram'} with campaign hashtags.
                </p>
                <div className="status-stage-callout__sub-card">
                  <Clock size={16} />
                  <div>
                    <strong>Next QA Milestone:</strong> The creator will submit their live post link directly from the creator app. Once submitted, it will appear here for <strong>Stage 2: Live Post QA</strong> to verify compliance and approve.
                  </div>
                </div>
              </div>
            )}

            {/* State 4: Live Post Pending Review (Stage 2) */}
            {submission.stage === 'final_review' && (
              <div className="status-stage-callout status-stage-callout--live-review">
                <div className="status-stage-callout__badge">
                  <Sparkles size={13} />
                  <span>Stage 2: Live Post QA Pending</span>
                </div>
                <h4>Verify Published Live Post</h4>
                <p>
                  The creator has published the video live on {submission.livePlatform || 'Instagram'} and shared the public link below. Verify compliance and approve or reject the live post.
                </p>

                {/* Clickable Live Link Card */}
                <div className="live-link-card">
                  <div className="live-link-card__icon">
                    <PlatformIcon platform={submission.livePlatform} size={22} />
                  </div>
                  <div className="live-link-card__info">
                    <div className="live-link-card__label">Published Live Post URL</div>
                    <a
                      href={submission.livePostUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="live-link-card__url"
                      title="Open Live Post in New Tab"
                    >
                      <span>{submission.livePostUrl || 'https://instagram.com/reel/sample'}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <a
                    href={submission.livePostUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="live-link-card__action-btn"
                  >
                    Open Post ↗
                  </a>
                </div>

                {/* Live Post Compliance Checklist */}
                <div className="live-compliance-checklist">
                  <span className="live-compliance-checklist__title">Verification Checklist:</span>
                  <div className="checklist-items">
                    <div className="checklist-item">
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Draft video approved on schedule</span>
                    </div>
                    <div className="checklist-item">
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Affiliate discount code present in live caption</span>
                    </div>
                    <div className="checklist-item">
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Mandatory #ad / #collab disclosure clearly visible</span>
                    </div>
                    <div className="checklist-item">
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Brand collaborator tag accepted on post</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* State 5: Live Post Rejected */}
            {isLiveRejected && (
              <div className="status-stage-callout status-stage-callout--rejected">
                <div className="status-stage-callout__badge">
                  <AlertCircle size={13} />
                  <span>Live Post Revision Requested</span>
                </div>
                <h4>Live Post Compliance Issue</h4>
                <div className="status-stage-callout__detail-item">
                  <strong>Rejection Reason:</strong>
                  <span>{submission.liveRejectionReason}</span>
                </div>
                {submission.liveReviewNotes && (
                  <div className="status-stage-callout__detail-item">
                    <strong>Admin Guidance:</strong>
                    <span>{submission.liveReviewNotes}</span>
                  </div>
                )}
                {submission.livePostUrl && (
                  <div className="status-stage-callout__re-action-row">
                    <a
                      href={submission.livePostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="status-stage-callout__re-link"
                    >
                      <span>Check Live URL Again ↗</span>
                    </a>
                    <button
                      type="button"
                      className="status-stage-callout__re-btn"
                      onClick={handleApproveLivePostAction}
                    >
                      <Check size={13} />
                      <span>Approve Live Post Instead</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* State 6: Live Post Approved (Completed) */}
            {isLiveApproved && (
              <div className="status-stage-callout status-stage-callout--approved">
                <div className="status-stage-callout__badge">
                  <CheckCircle2 size={13} />
                  <span>Live Post QA Approved</span>
                </div>
                <h4>Live Post Verified & Approved</h4>
                <p>
                  {submission.liveReviewNotes || 'Live post link verified on Instagram/YouTube and approved by admin.'}
                </p>
                {submission.livePostUrl && (
                  <a
                    href={submission.livePostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="status-stage-callout__link-btn"
                  >
                    <span>View Approved Live Post ↗</span>
                  </a>
                )}
              </div>
            )}

            {/* Draft Details: Caption and Products */}
            <div className="video-modal__details">
              <div className="video-modal__field">
                <label className="video-modal__field-label">
                  <MessageSquare size={13} />
                  <span>Caption & Copy</span>
                </label>
                <div className="video-modal__caption-box">
                  {submission.caption || 'No caption provided.'}
                </div>
              </div>

              {submission.taggedProducts?.length > 0 && (
                <div className="video-modal__field">
                  <label className="video-modal__field-label">
                    <Tag size={13} />
                    <span>Tagged Campaign Products ({submission.taggedProducts.length})</span>
                  </label>
                  <div className="video-modal__products-grid">
                    {submission.taggedProducts.map((p, idx) => (
                      <div key={idx} className="video-modal__product-chip">
                        <div className="video-modal__product-name">{p.name}</div>
                        <div className="video-modal__product-meta">
                          <span className="video-modal__product-price">{p.price}</span>
                          <span className="video-modal__product-brand">{p.brand}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ==============================================================
                ACTIONS AREA: Only for actionable stages (draft_review or final_review)
               ============================================================== */}
            {(!isLiveApproved && !isAwaitingLiveLink && !isDraftRejected && !isLiveRejected) && (
              <div className="video-modal__actions-wrapper">
                {!showRejectForm ? (
                  /* Standard Decision Buttons */
                  <div className="video-modal__decision-box">
                    <div className="video-modal__notes-input-wrapper">
                      <label className="video-modal__notes-label">
                        <MessageSquare size={13} />
                        <span>{isStageFinal ? 'QA Verification Notes (Optional)' : 'Review Notes / Feedback (Optional)'}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isStageFinal
                            ? 'e.g., Live Reel verified, discount code and #ad disclosure present. Approved.'
                            : 'e.g., Excellent visual pacing and lighting, approved for publishing live.'
                        }
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="video-modal__notes-input"
                      />
                    </div>

                    <div className="video-modal__btn-row">
                      {isStageFinal ? (
                        <button
                          type="button"
                          className="video-modal__btn video-modal__btn--approve"
                          onClick={handleApproveLivePostAction}
                        >
                          <CheckCircle2 size={16} />
                          <span>Approve Live Post</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="video-modal__btn video-modal__btn--approve"
                          onClick={handleApproveDraftAction}
                        >
                          <Check size={16} />
                          <span>Approve Draft & Request Live Post</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="video-modal__btn video-modal__btn--reject-trigger"
                        onClick={() => setShowRejectForm(true)}
                      >
                        <XCircle size={16} />
                        <span>{isStageFinal ? 'Reject Live Post with Reason' : 'Reject Draft with Reason'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Rejection Feedback Studio Form */
                  <div className="video-modal__reject-studio">
                    <div className="video-modal__reject-header">
                      <div className="video-modal__reject-title">
                        <ShieldAlert size={16} color="#ef4444" />
                        <span>{isStageFinal ? 'Reject Live Post — Select Reason' : 'Reject Draft — Select Reason'}</span>
                      </div>
                      <button
                        type="button"
                        className="video-modal__reject-cancel-link"
                        onClick={() => setShowRejectForm(false)}
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="video-modal__reject-hint">
                      {isStageFinal
                        ? 'Select why this live post cannot be approved. The creator will receive this guidance to make fixes.'
                        : 'Choose why this draft video does not meet brand specifications. The creator will be required to edit or re-film.'}
                    </p>

                    {/* Radio Options */}
                    <div className="video-modal__reasons-list">
                      {activeRejectionReasons.map(r => (
                        <label
                          key={r.id}
                          className={`video-modal__reason-option ${selectedReasonId === r.id ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="rejectReason"
                            value={r.id}
                            checked={selectedReasonId === r.id}
                            onChange={() => setSelectedReasonId(r.id)}
                          />
                          <span>{r.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Custom note textarea */}
                    <div className="video-modal__custom-reason">
                      <label className="video-modal__custom-label">
                        Detailed Guidance / Specific Revision Instructions:
                      </label>
                      <textarea
                        rows={2}
                        placeholder={
                          isStageFinal
                            ? 'e.g. Please update your Instagram caption to include the discount code and tag @myntra before this post can be approved.'
                            : 'e.g. Please re-shoot the intro with clear logo placement and include the coupon code in the text overlay.'
                        }
                        value={customReasonText}
                        onChange={(e) => setCustomReasonText(e.target.value)}
                        className="video-modal__textarea"
                      />
                    </div>

                    {/* Creator Feedback Advisory (PRD 8.7.2 CRS-08) */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0' }}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>This feedback will be shared with the creator. Please keep it clear and respectful.</span>
                    </div>

                    {/* Confirm Rejection Button */}
                    <div className="video-modal__reject-actions">
                      <button
                        type="button"
                        className="video-modal__btn video-modal__btn--cancel"
                        onClick={() => setShowRejectForm(false)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="video-modal__btn video-modal__btn--confirm-reject"
                        disabled={isRejectDisabled}
                        onClick={isStageFinal ? handleRejectLivePostAction : handleRejectDraftAction}
                      >
                        <XCircle size={16} />
                        <span>Confirm Rejection with Reason</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
