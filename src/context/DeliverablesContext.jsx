import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SUBMISSIONS } from '../data/videoSubmissions';

const DeliverablesContext = createContext(null);

export function DeliverablesProvider({ children }) {
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('hp_brand_connect_submissions_v16');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_SUBMISSIONS.length) {
          return parsed;
        }
      } catch (e) {
        return INITIAL_SUBMISSIONS;
      }
    }
    return INITIAL_SUBMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem('hp_brand_connect_submissions_v16', JSON.stringify(submissions));
  }, [submissions]);

  // Stage 1: Approve Draft Video
  const approveDraft = (submissionId, reviewNotes = '') => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            stage: 'awaiting_live_link',
            status: 'Awaiting Live Link',
            draftStatus: 'Approved',
            draftRejectionReason: null,
            draftReviewNotes: reviewNotes || 'Content draft approved! Creator notified to publish live.',
            draftReviewedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
  };

  // Stage 1: Reject Draft Video with Reason
  const rejectDraft = (submissionId, reason, reviewNotes = '') => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            stage: 'draft_rejected',
            status: 'Draft Rejected',
            draftStatus: 'Rejected',
            draftRejectionReason: reason,
            draftReviewNotes: reviewNotes || '',
            draftReviewedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
  };

  // Reset Draft Review to pending
  const resetDraftReview = (submissionId) => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            stage: 'draft_review',
            status: 'Raw Video Pending Review',
            draftStatus: 'Pending Review',
            draftRejectionReason: null,
            draftReviewNotes: null,
          };
        }
        return sub;
      })
    );
  };

  // Stage 2: Creator submits live Instagram / YouTube link
  const submitLiveLink = (submissionId, { livePostUrl, livePlatform = 'Instagram', liveCaption = '' }) => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            stage: 'final_review',
            status: 'Live Post Pending Review',
            livePostUrl: livePostUrl || sub.livePostUrl || 'https://www.instagram.com/reel/sample_live_post/',
            livePlatform: livePlatform || sub.livePlatform || 'Instagram',
            livePostCaption: liveCaption || sub.caption,
            livePostSubmittedAt: new Date().toISOString(),
            liveStatus: 'Pending Review',
            liveRejectionReason: null,
            liveReviewNotes: null,
          };
        }
        return sub;
      })
    );
  };

  // Stage 2: Approve Live Post (Admin QA Approval)
  const approveLivePost = (submissionId, reviewNotes = '') => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            stage: 'live_approved',
            status: 'Live Post Approved',
            liveStatus: 'Approved',
            liveRejectionReason: null,
            liveReviewNotes: reviewNotes || 'Live post verified. Hashtags, discount code, and disclosures checked. Live post approved.',
            liveReviewedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
  };

  // Stage 2: Reject Live Post with Reason
  const rejectLivePost = (submissionId, reason, reviewNotes = '') => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            stage: 'live_rejected',
            status: 'Live Post Rejected',
            liveStatus: 'Rejected',
            liveRejectionReason: reason,
            liveReviewNotes: reviewNotes || '',
            liveReviewedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );
  };

  // Backward-compatible aliases
  const approveFinalPayment = approveLivePost;
  const rejectFinalPayment = rejectLivePost;

  // Smart routing wrapper
  const approveSubmission = (submissionId, reviewNotes = '') => {
    const sub = submissions.find(s => s.id === submissionId);
    if (sub && (sub.stage === 'final_review' || sub.stage === 'live_rejected')) {
      approveLivePost(submissionId, reviewNotes);
    } else {
      approveDraft(submissionId, reviewNotes);
    }
  };

  const rejectSubmission = (submissionId, reason, reviewNotes = '') => {
    const sub = submissions.find(s => s.id === submissionId);
    if (sub && (sub.stage === 'final_review' || sub.stage === 'live_rejected')) {
      rejectLivePost(submissionId, reason, reviewNotes);
    } else {
      rejectDraft(submissionId, reason, reviewNotes);
    }
  };

  const getSubmissionsByCampaign = (campaignId) => {
    if (!campaignId) return submissions;
    const filtered = submissions.filter(s => s.campaignId === campaignId);
    return filtered.length > 0 ? filtered : submissions;
  };

  const pendingDraftsCount = submissions.filter(s => s.stage === 'draft_review').length;
  const pendingLivePostsCount = submissions.filter(s => s.stage === 'final_review').length;
  const pendingCount = pendingDraftsCount + pendingLivePostsCount;
  const awaitingLiveLinkCount = submissions.filter(s => s.stage === 'awaiting_live_link').length;
  const liveApprovedCount = submissions.filter(s => s.stage === 'live_approved' || s.stage === 'payment_approved').length;
  const paymentApprovedCount = liveApprovedCount;
  const rejectedCount = submissions.filter(s => s.stage === 'draft_rejected' || s.stage === 'live_rejected').length;

  const resetToDefaults = () => {
    setSubmissions(INITIAL_SUBMISSIONS);
    localStorage.setItem('hp_brand_connect_submissions_v3', JSON.stringify(INITIAL_SUBMISSIONS));
  };

  return (
    <DeliverablesContext.Provider
      value={{
        submissions,
        pendingCount,
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
        approveSubmission,
        rejectSubmission,
        resetDraftReview,
        getSubmissionsByCampaign,
        resetToDefaults,
      }}
    >
      {children}
    </DeliverablesContext.Provider>
  );
}

export function useDeliverables() {
  const context = useContext(DeliverablesContext);
  if (!context) {
    throw new Error('useDeliverables must be used within a DeliverablesProvider');
  }
  return context;
}
