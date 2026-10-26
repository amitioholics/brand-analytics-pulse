import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, CheckCircle2, Clock, Sparkles, ShieldAlert,
  Eye, ExternalLink, Copy, Check, LayoutGrid, List,
  Camera, Video, Search, Link2, ChevronRight, ChevronLeft, AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { useDeliverables } from '../../context/DeliverablesContext';
import VideoReviewModal from '../video/VideoReviewModal';
import PGLogo from '../common/PGLogo';
import './CampaignVideoDeliverables.css';

function PlatformIcon({ platform, size = 12 }) {
  if (platform === 'YouTube') {
    return <Video size={size} color="#ef4444" />;
  }
  return <Camera size={size} color="#e1306c" />;
}

export default function CampaignVideoDeliverables({ campaignId, campaignName }) {
  const navigate = useNavigate();
  const {
    getSubmissionsByCampaign,
    approveDraft,
    rejectDraft,
    approveLivePost,
    rejectLivePost,
    approveFinalPayment,
    rejectFinalPayment,
  } = useDeliverables();

  const campaignSubmissions = useMemo(
    () => getSubmissionsByCampaign(campaignId || '6ace2b3abe742272b6135d8e'),
    [campaignId, getSubmissionsByCampaign]
  );

  const [stageFilter, setStageFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Pagination with 10 content items per page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [stageFilter, platformFilter, search]);

  // Stage breakdown counts
  const pendingDraftsCount = useMemo(
    () => campaignSubmissions.filter(s => s.stage === 'draft_review').length,
    [campaignSubmissions]
  );
  const awaitingLiveLinkCount = useMemo(
    () => campaignSubmissions.filter(s => s.stage === 'awaiting_live_link').length,
    [campaignSubmissions]
  );
  const pendingLivePostsCount = useMemo(
    () => campaignSubmissions.filter(s => s.stage === 'final_review').length,
    [campaignSubmissions]
  );
  const liveApprovedCount = useMemo(
    () => campaignSubmissions.filter(s => s.stage === 'live_approved' || s.stage === 'payment_approved').length,
    [campaignSubmissions]
  );
  const rejectedCount = useMemo(
    () => campaignSubmissions.filter(s => s.stage === 'draft_rejected' || s.stage === 'live_rejected').length,
    [campaignSubmissions]
  );

  // Filtered deliverables
  const filteredList = useMemo(() => {
    return campaignSubmissions.filter(sub => {
      // Stage filter
      if (stageFilter === 'draft_review' && sub.stage !== 'draft_review') return false;
      if (stageFilter === 'awaiting_live_link' && sub.stage !== 'awaiting_live_link') return false;
      if (stageFilter === 'final_review' && sub.stage !== 'final_review') return false;
      if (stageFilter === 'live_approved' && sub.stage !== 'live_approved' && sub.stage !== 'payment_approved') return false;
      if (stageFilter === 'rejected' && sub.stage !== 'draft_rejected' && sub.stage !== 'live_rejected') return false;

      // Platform filter
      if (platformFilter !== 'all' && sub.creatorPlatform !== platformFilter) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const cleanQ = q.replace(/^@/, '');
        return (
          sub.creatorName?.toLowerCase().includes(q) ||
          sub.creatorHandle?.toLowerCase().includes(cleanQ) ||
          sub.videoTitle?.toLowerCase().includes(q) ||
          (sub.videoUrl && sub.videoUrl.toLowerCase().includes(q)) ||
          (sub.livePostUrl && sub.livePostUrl.toLowerCase().includes(q)) ||
          sub.caption?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [campaignSubmissions, stageFilter, platformFilter, search]);

  // Pagination calculation (10 content items per page)
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);

  const paginatedList = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, safePage, pageSize]);

  const handleCopyLink = (e, id, url) => {
    e.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  };

  const getMediaUrl = (sub) => {
    const isLive = sub.stage === 'final_review' || sub.stage === 'live_approved' || sub.stage === 'payment_approved';
    return isLive ? (sub.livePostUrl || sub.videoUrl) : sub.videoUrl;
  };

  const getStatusBadge = (sub) => {
    switch (sub.stage) {
      case 'draft_review':
        return {
          label: 'Raw Video Pending Review',
          className: 'cvd-badge--amber',
          icon: Clock,
        };
      case 'awaiting_live_link':
        return {
          label: 'Awaiting Live Post',
          className: 'cvd-badge--purple',
          icon: Clock,
        };
      case 'final_review':
        return {
          label: 'Live Post Pending Review',
          className: 'cvd-badge--fuchsia',
          icon: Sparkles,
        };
      case 'live_approved':
      case 'payment_approved':
        return {
          label: 'Live Post Approved',
          className: 'cvd-badge--green',
          icon: CheckCircle2,
        };
      case 'draft_rejected':
      case 'live_rejected':
        return {
          label: 'Revision Requested',
          className: 'cvd-badge--red',
          icon: ShieldAlert,
        };
      default:
        return {
          label: sub.status || 'Pending Review',
          className: 'cvd-badge--amber',
          icon: Clock,
        };
    }
  };

  return (
    <div className="campaign-pulse__card cvd-card" id="deliverables">
      {/* 1. Header with View Mode Toggle */}
      <div className="cvd-header">
        <div className="cvd-header__left">
          <h2 className="cvd-header__title">
            Content and Video Approvals
            <span className="cvd-header__count">{campaignSubmissions.length}</span>
          </h2>
        </div>

        <div className="cvd-header__right">
          <div className="cvd-view-toggle">
            <button
              type="button"
              className={`cvd-view-btn ${viewMode === 'list' ? 'cvd-view-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Systematic List View"
            >
              <List size={15} />
              <span>List View</span>
            </button>
            <button
              type="button"
              className={`cvd-view-btn ${viewMode === 'grid' ? 'cvd-view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
              <span>Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive KPI Stat Cards (matching Video Approvals Studio) */}
      <div className="cvd-kpis">
        <div
          className={`cvd-kpi-card cvd-kpi-card--pending ${stageFilter === 'draft_review' ? 'cvd-kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'draft_review' ? 'all' : 'draft_review')}
        >
          <div className="cvd-kpi-icon" style={{ color: '#d97706', background: '#fef3c7' }}>
            <Clock size={18} />
          </div>
          <div className="cvd-kpi-content">
            <div className="cvd-kpi-val" style={{ color: '#b45309' }}>{pendingDraftsCount}</div>
            <div className="cvd-kpi-label">Stage 1: Raw Videos to Review</div>
          </div>
        </div>

        <div
          className={`cvd-kpi-card cvd-kpi-card--final ${stageFilter === 'final_review' ? 'cvd-kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'final_review' ? 'all' : 'final_review')}
        >
          <div className="cvd-kpi-icon" style={{ color: '#86198f', background: '#fdf4ff' }}>
            <Sparkles size={18} />
          </div>
          <div className="cvd-kpi-content">
            <div className="cvd-kpi-val" style={{ color: '#86198f' }}>{pendingLivePostsCount}</div>
            <div className="cvd-kpi-label">Stage 2: Live Posts to Review</div>
          </div>
        </div>

        <div
          className={`cvd-kpi-card cvd-kpi-card--approved ${stageFilter === 'live_approved' ? 'cvd-kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'live_approved' ? 'all' : 'live_approved')}
        >
          <div className="cvd-kpi-icon" style={{ color: '#059669', background: '#d1fae5' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="cvd-kpi-content">
            <div className="cvd-kpi-val" style={{ color: '#059669' }}>{liveApprovedCount}</div>
            <div className="cvd-kpi-label">Live Posts Approved</div>
          </div>
        </div>

        <div
          className={`cvd-kpi-card cvd-kpi-card--rejected ${stageFilter === 'rejected' ? 'cvd-kpi-card--active' : ''}`}
          onClick={() => setStageFilter(stageFilter === 'rejected' ? 'all' : 'rejected')}
        >
          <div className="cvd-kpi-icon" style={{ color: '#dc2626', background: '#fee2e2' }}>
            <ShieldAlert size={18} />
          </div>
          <div className="cvd-kpi-content">
            <div className="cvd-kpi-val" style={{ color: '#dc2626' }}>{rejectedCount}</div>
            <div className="cvd-kpi-label">Rejections with Reason</div>
          </div>
        </div>
      </div>

      {/* 3. Stage Filter Pills */}
      <div className="cvd-pills">
        <button
          type="button"
          className={`cvd-pill ${stageFilter === 'all' ? 'cvd-pill--active' : ''}`}
          onClick={() => setStageFilter('all')}
        >
          All Content ({campaignSubmissions.length})
        </button>
        <button
          type="button"
          className={`cvd-pill ${stageFilter === 'draft_review' ? 'cvd-pill--active' : ''}`}
          onClick={() => setStageFilter('draft_review')}
        >
          1. Raw Videos to Review ({pendingDraftsCount})
        </button>
        <button
          type="button"
          className={`cvd-pill ${stageFilter === 'awaiting_live_link' ? 'cvd-pill--active' : ''}`}
          onClick={() => setStageFilter('awaiting_live_link')}
        >
          2. Awaiting Live Post ({awaitingLiveLinkCount})
        </button>
        <button
          type="button"
          className={`cvd-pill ${stageFilter === 'final_review' ? 'cvd-pill--active' : ''}`}
          onClick={() => setStageFilter('final_review')}
        >
          3. Live Posts to Review ({pendingLivePostsCount})
        </button>
        <button
          type="button"
          className={`cvd-pill ${stageFilter === 'live_approved' ? 'cvd-pill--active' : ''}`}
          onClick={() => setStageFilter('live_approved')}
        >
          4. Live Posts Approved ({liveApprovedCount})
        </button>
        <button
          type="button"
          className={`cvd-pill ${stageFilter === 'rejected' ? 'cvd-pill--active' : ''}`}
          onClick={() => setStageFilter('rejected')}
        >
          Rejections ({rejectedCount})
        </button>
      </div>

      {/* 4. Toolbar: Search & Platform Filter */}
      <div className="cvd-toolbar">
        <div className="cvd-search-wrap">
          <Search size={14} className="cvd-search-icon" />
          <input
            type="text"
            className="cvd-search-input"
            placeholder="Search creator name, @handle, video link, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="cvd-search-clear"
              onClick={() => setSearch('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="cvd-platform-filters">
          <button
            type="button"
            className={`cvd-plat-btn ${platformFilter === 'all' ? 'cvd-plat-btn--active' : ''}`}
            onClick={() => setPlatformFilter('all')}
          >
            All Platforms
          </button>
          <button
            type="button"
            className={`cvd-plat-btn ${platformFilter === 'Instagram' ? 'cvd-plat-btn--active' : ''}`}
            onClick={() => setPlatformFilter('Instagram')}
          >
            <Camera size={12} color="#e1306c" />
            <span>Instagram</span>
          </button>
          <button
            type="button"
            className={`cvd-plat-btn ${platformFilter === 'YouTube' ? 'cvd-plat-btn--active' : ''}`}
            onClick={() => setPlatformFilter('YouTube')}
          >
            <Video size={12} color="#ef4444" />
            <span>YouTube</span>
          </button>
        </div>
      </div>

      {/* 5. Main Content: Systematic List View (Table) OR Grid View */}
      {filteredList.length === 0 ? (
        <div className="cvd-empty">
          <Video size={36} color="#94a3b8" />
          <div className="cvd-empty__title">No Deliverables Found</div>
          <div className="cvd-empty__sub">
            No submissions matched your stage or search filter. Try selecting "All Deliverables" or clear the search.
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* Systematic List View (Table) */
        <div className="cvd-table-container">
          <table className="cvd-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>PREVIEW</th>
                <th style={{ width: '260px', textAlign: 'left' }}>CREATOR</th>
                <th style={{ minWidth: '320px', textAlign: 'left' }}>SUBMISSION LINK & MEDIA</th>
                <th style={{ width: '140px', textAlign: 'left' }}>SUBMITTED</th>
                <th style={{ width: '200px', textAlign: 'left' }}>QA STATUS</th>
                <th style={{ width: '130px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map(sub => {
                const initials = sub.creatorName
                  ? sub.creatorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                  : 'CR';
                const mediaUrl = getMediaUrl(sub);
                const badge = getStatusBadge(sub);
                const BadgeIcon = badge.icon;
                const isCopied = copiedId === sub.id;

                return (
                  <tr
                    key={sub.id}
                    className="cvd-row"
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    {/* 1. PREVIEW THUMBNAIL */}
                    <td style={{ textAlign: 'center' }}>
                      <div
                        className="cvd-thumb"
                        title="Click to preview video"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(sub);
                        }}
                      >
                        <div className="cvd-thumb__bg">
                          <Play size={14} color="#ffffff" fill="#ffffff" />
                        </div>
                        <span className="cvd-thumb__duration">
                          {sub.duration || '0:45'}
                        </span>
                      </div>
                    </td>

                    {/* 2. CREATOR */}
                    <td
                      onClick={(e) => {
                        if (sub.creatorId) {
                          e.stopPropagation();
                          navigate(`/creators/${sub.creatorId}`);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                      title={`View ${sub.creatorName}'s profile`}
                    >
                      <div className="cvd-creator cvd-creator--clickable">
                        <div
                          className="cvd-creator__avatar"
                          style={{ background: sub.creatorAvatarColor || '#6538ea' }}
                        >
                          {initials}
                        </div>
                        <div className="cvd-creator__info">
                          <div className="cvd-creator__name cvd-creator__name--hover">{sub.creatorName}</div>
                          <div className="cvd-creator__sub-row">
                            <span className="cvd-creator__handle">{sub.creatorHandle}</span>
                            <span className="cvd-creator__sep">•</span>
                            <span className="cvd-creator__plat" title={sub.creatorPlatform}>
                              <PlatformIcon platform={sub.creatorPlatform} size={11} />
                              <span>{sub.creatorPlatform || 'Instagram'}</span>
                            </span>
                          </div>
                          {sub.followerCount && (
                            <div className="cvd-creator__followers">
                              {(sub.followerCount / 1000).toFixed(0)}K followers
                            </div>
                          )}
                        </div>
                      </div>
                    </td>



                    {/* 4. SUBMISSION LINK & MEDIA */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="cvd-link-box">
                        <div className="cvd-link-box__top">
                          <Link2 size={12} className="cvd-link-box__icon" />
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cvd-link-box__url"
                            title={mediaUrl}
                          >
                            {mediaUrl ? mediaUrl.replace('https://', '') : 'No URL provided'}
                          </a>
                        </div>
                        <div className="cvd-link-box__actions">
                          <button
                            type="button"
                            className={`cvd-link-btn ${isCopied ? 'cvd-link-btn--copied' : ''}`}
                            onClick={(e) => handleCopyLink(e, sub.id, mediaUrl)}
                            title="Copy link to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check size={11} color="#059669" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          {mediaUrl && (
                            <a
                              href={mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cvd-link-btn cvd-link-btn--open"
                              title="Open original video URL in new tab"
                            >
                              <span>Open URL</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 5. SUBMITTED DATE */}
                    <td>
                      <div className="cvd-date">
                        <div className="cvd-date__day">{formatDate(sub.submittedAt)}</div>
                        <div className="cvd-date__time">
                          {new Date(sub.submittedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>

                    {/* 6. QA STAGE & STATUS */}
                    <td>
                      <span className={`cvd-badge ${badge.className}`}>
                        <BadgeIcon size={12} />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* 7. ACTION */}
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="cvd-review-btn"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="cvd-grid">
          {paginatedList.map(sub => {
            const initials = sub.creatorName
              ? sub.creatorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'CR';
            const mediaUrl = getMediaUrl(sub);
            const badge = getStatusBadge(sub);
            const BadgeIcon = badge.icon;
            const isCopied = copiedId === sub.id;

            return (
              <div
                key={sub.id}
                className="cvd-card-item"
                onClick={() => setSelectedSubmission(sub)}
              >
                {/* Media Preview Box */}
                <div className="cvd-card-item__preview">
                  <div className="cvd-card-item__preview-center">
                    <Camera size={28} color="#f43f5e" strokeWidth={1.8} />
                    <div className="cvd-card-item__preview-open">
                      <span>{sub.livePostUrl ? 'View Live' : 'Open Video'}</span>
                      <ExternalLink size={11} color="#ffffff" />
                    </div>
                  </div>
                  <span className="cvd-card-item__format-tag">
                    {sub.deliverableType || 'Raw Video'}
                  </span>
                  <span className="cvd-card-item__duration">
                    {sub.duration || '0:45'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="cvd-card-item__body">
                  <div className="cvd-card-item__campaign-bar">
                    <span className="cvd-card-item__campaign-name">
                      <PGLogo size={12} />
                      <span>{campaignName || 'HAULPACK X AMAZON HEAD & SHOULDERS'}</span>
                    </span>
                  </div>

                  <div className="cvd-card-item__status-bar">
                    <span className={`cvd-badge ${badge.className}`}>
                      <BadgeIcon size={11} />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <h3 className="cvd-card-item__title">{sub.videoTitle || 'Head & Shoulders Scalp Routine'}</h3>

                  {/* Creator */}
                  <div
                    className="cvd-card-item__creator cvd-card-item__creator--clickable"
                    onClick={(e) => {
                      if (sub.creatorId) {
                        e.stopPropagation();
                        navigate(`/creators/${sub.creatorId}`);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    title={`View ${sub.creatorName}'s profile`}
                  >
                    <div
                      className="cvd-creator__avatar cvd-creator__avatar--sm"
                      style={{ background: sub.creatorAvatarColor || '#6538ea' }}
                    >
                      {initials}
                    </div>
                    <div className="cvd-card-item__creator-text">
                      <div className="cvd-card-item__creator-name cvd-card-item__creator-name--hover">{sub.creatorName}</div>
                      <div className="cvd-card-item__creator-handle">{sub.creatorHandle}</div>
                    </div>
                  </div>

                  {/* Link Row */}
                  <div className="cvd-card-item__link-row" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="cvd-card-item__copy-btn"
                      onClick={(e) => handleCopyLink(e, sub.id, mediaUrl)}
                    >
                      {isCopied ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    {mediaUrl && (
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cvd-card-item__link-url"
                        title={mediaUrl}
                      >
                        <span>{mediaUrl}</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="cvd-card-item__actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="cvd-review-btn cvd-review-btn--full"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      <Eye size={13} />
                      <span>Review Video</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pagination Controls (10 content items per page) */}
      {filteredList.length > 0 && (
        <div className="cvd-pagination">
          <div className="cvd-pagination__info">
            <span>
              Showing <strong className="cvd-pagination__num">{(safePage - 1) * pageSize + 1}</strong> to <strong className="cvd-pagination__num">{Math.min(safePage * pageSize, filteredList.length)}</strong> of <strong className="cvd-pagination__num">{filteredList.length}</strong> content items
            </span>
            <span className="cvd-pagination__badge">10 per page</span>
          </div>

          {totalPages > 1 && (
            <div className="cvd-pagination__controls">
              <button
                type="button"
                className="cvd-pagination__btn"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                title="Previous page"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <div className="cvd-pagination__pages">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`cvd-pagination__page-btn ${safePage === pageNum ? 'cvd-pagination__page-btn--active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="cvd-pagination__btn"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
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
        />
      )}
    </div>
  );
}
