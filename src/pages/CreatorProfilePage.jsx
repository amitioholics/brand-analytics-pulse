import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, FileVideo, Eye, Heart, Sparkles, Megaphone,
  ArrowUpDown, ExternalLink, ArrowLeft,
  CheckCircle2, Clock, Camera, Package
} from 'lucide-react';
import { getCreatorById } from '../data/creators';
import { getCreatorOverallMetrics, getCreatorCampaignBreakdown } from '../data/metrics';
import { getAllContentForCreator } from '../data/content';
import { getProductSalesForCreator } from '../data/productSales';
import { formatNumber, formatCurrency, formatCompactNumber, formatDateRange, formatDate, getInitials } from '../utils/formatters';
import { usePortal } from '../context/PortalContext';
import { useDeliverables } from '../context/DeliverablesContext';
import VideoReviewModal from '../components/video/VideoReviewModal';
import './CreatorProfilePage.css';

export default function CreatorProfilePage() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { portal } = usePortal();
  const { submissions, approveDraft, rejectDraft, approveLivePost, rejectLivePost } = useDeliverables();
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const creator = useMemo(() => getCreatorById(creatorId), [creatorId]);
  const overallMetrics = useMemo(() => getCreatorOverallMetrics(creatorId, portal), [creatorId, portal]);
  const campaignBreakdown = useMemo(() => getCreatorCampaignBreakdown(creatorId, portal), [creatorId, portal]);
  const allContent = useMemo(() => getAllContentForCreator(creatorId, portal), [creatorId, portal]);

  // Approved live posts for this creator
  const approvedLivePosts = useMemo(() => {
    return allContent.filter(c => c.status === 'Live' || c.status === 'Approved' || c.status === 'Published');
  }, [allContent]);

  const handleOpenVideo = (p) => {
    const matched = (submissions || []).find(
      s => s.creatorId === creatorId || s.id === p?.id || s.livePostUrl === p?.contentUrl
    );

    if (matched) {
      setSelectedSubmission(matched);
    } else {
      setSelectedSubmission({
        id: p?.id || `sub_${creatorId}`,
        creatorId: creator?.id || creatorId,
        creatorName: creator?.name || 'Creator',
        creatorHandle: creator?.socialHandle || `@${(creator?.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
        creatorPlatform: p?.platform || 'Instagram',
        creatorAvatarColor: creator?.avatarColor || '#ec4899',
        campaignName: 'HaulPack x Amazon Head & Shoulders',
        videoTitle: p?.title || 'Head & Shoulders Scalp Care Routine',
        deliverableType: p?.contentType || 'Instagram Reel',
        videoUrl: p?.contentUrl || p?.livePostUrl || 'https://instagram.com/reel/C8kF9xXyZ01',
        livePostUrl: p?.contentUrl || p?.livePostUrl || 'https://instagram.com/reel/C8kF9xXyZ01',
        previewVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-lights-40112-large.mp4',
        caption: `${p?.title || 'Deliverable'} ✨ Obsessed with these fresh essentials from the P&G Brand Spotlight! Use my code PG10 for an extra discount. @pg #PGFamily #Ad #PGSpotlight`,
        stage: 'live_approved',
        status: 'Live Post Approved',
        submittedAt: p?.publishedAt || '2026-10-14',
        livePostSubmittedAt: p?.publishedAt || '2026-10-14',
        liveReviewedAt: p?.publishedAt || '2026-10-15',
        socialMetrics: {
          views: p?.views || 145000,
          clicks: p?.clicks || 7250,
          er: '5.0%',
          sales: p?.sales || (attributedSales[0]?.sales) || 21000,
          orders: p?.orders || (attributedSales[0]?.unitsSold) || 42,
        },
      });
    }
  };

  if (!creator) {
    return (
      <div className="campaign-pulse fade-in">
        <p>Creator not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/campaigns')}>
          Back to Campaigns
        </button>
      </div>
    );
  }

  // Attributed product sales for this creator
  const attributedSales = useMemo(() => {
    return getProductSalesForCreator(creatorId);
  }, [creatorId]);

  // Campaigns participated count & social metrics
  const isBhumi = creatorId === 'cr_bhumi';
  const campaignsCount = 1;
  const followersCount = isBhumi ? 211000 : (creator.followerCount || 250000);
  const livePostsCount = isBhumi ? 0 : approvedLivePosts.length;
  const reachCount = isBhumi ? 0 : (overallMetrics.views || (approvedLivePosts.length > 0 ? approvedLivePosts[0].views : (creator.views || 0)));
  const engagementsCount = isBhumi ? 0 : ((livePostsCount > 0 || reachCount > 0)
    ? (overallMetrics.clicks || Math.round(reachCount * 0.05))
    : 0);
  const likesCount = Math.round(engagementsCount * 0.93);
  const commentsCount = Math.round(engagementsCount * 0.044);
  const sharesCount = Math.max(0, engagementsCount - likesCount - commentsCount);
  const avgER = isBhumi ? '0.0' : (reachCount > 0 && engagementsCount > 0 ? ((engagementsCount / reachCount) * 100).toFixed(1) : '0.0');

  // Handle campaign list
  const displayCampaigns = useMemo(() => {
    return [
      {
        campaign: {
          id: '6ace2b3abe742272b6135d8e',
          name: 'HaulPack x Amazon Head & Shoulders',
          compensationType: 'Paid Collab',
          startDate: '2026-10-13',
          endDate: '2026-10-23',
          status: 'Active',
        },
        contentCount: livePostsCount,
        views: reachCount,
        clicks: engagementsCount,
      }
    ];
  }, [livePostsCount, reachCount, engagementsCount]);

  return (
    <div className="campaign-pulse fade-in">
      {/* Breadcrumbs */}
      <div className="campaign-pulse__breadcrumbs">
        <span
          className="campaign-pulse__breadcrumb-link"
          onClick={() => navigate('/campaigns')}
        >
          Campaigns
        </span>
        <span className="campaign-pulse__breadcrumb-sep">&gt;</span>
        <span
          className="campaign-pulse__breadcrumb-link"
          onClick={() => navigate(`/campaigns/${displayCampaigns[0]?.campaign?.id || '6ace2b3abe742272b6135d8e'}`)}
        >
          {displayCampaigns[0]?.campaign?.name || 'HaulPack x Amazon Head & Shoulders'}
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
      </div>

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
          <div className="campaign-pulse__kpi-val">{formatCompactNumber(followersCount)}</div>
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
          <div className="campaign-pulse__kpi-val">{formatCompactNumber(reachCount)}</div>
        </div>

        {/* 5. ENGAGEMENTS */}
        <div className="campaign-pulse__kpi-card">
          <div className="campaign-pulse__kpi-top">
            <div className="campaign-pulse__kpi-icon-box">
              <Heart size={16} />
            </div>
            <span className="campaign-pulse__kpi-label">ENGAGEMENTS</span>
          </div>
          <div className="campaign-pulse__kpi-val">{formatCompactNumber(engagementsCount)}</div>
          <div className="campaign-pulse__kpi-subtext">
            {engagementsCount > 0 ? (
              `${formatCompactNumber(likesCount)} likes • ${formatCompactNumber(commentsCount)} comments • ${formatCompactNumber(sharesCount)} shares`
            ) : (
              '0 likes • 0 comments • 0 shares'
            )}
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

      {/* Section: Approved Live Posts */}
      <div className="campaign-pulse__card creator-live-posts__card">
        <div className="creator-live-posts__header">
          <div>
            <h2 className="campaign-pulse__card-title" style={{ marginBottom: 4 }}>
              Approved Live Posts ({approvedLivePosts.length})
            </h2>
            <p className="creator-live-posts__subtitle">
              Verified live deliverables published on social channels for Pulse brand campaigns.
            </p>
          </div>
          {approvedLivePosts.length > 0 && (
            <div className="creator-live-posts__badge">
              <CheckCircle2 size={14} color="#10b981" />
              <span>{approvedLivePosts.length} Live Verified</span>
            </div>
          )}
        </div>

        {approvedLivePosts.length === 0 ? (
          <div className="creator-live-posts__empty">
            <div className="creator-live-posts__empty-icon">
              <Clock size={24} color="#6538ea" />
            </div>
            <div className="creator-live-posts__empty-title">No approved live posts yet</div>
            <div className="creator-live-posts__empty-desc">
              Deliverable draft is approved and creator is awaiting social media link publication.
            </div>
          </div>
        ) : (
          <div className="campaign-pulse__table-container">
            <table className="campaign-pulse__table creator-live-posts__table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', width: '36%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>DELIVERABLE / TITLE</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'left', width: '14%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>PLATFORM</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'left', width: '16%' }}>
                    <span>LIVE URL</span>
                  </th>
                  <th style={{ textAlign: 'right', width: '11%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>REACH</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'right', width: '11%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>ENGAGEMENTS</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'right', width: '12%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <span>SALES DRIVEN</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvedLivePosts.map(p => {
                  const isIG = p.platform === 'Instagram' || !p.platform?.includes('YouTube');
                  const postUrl = p.contentUrl || p.livePostUrl || p.url;
                  const viewsVal = p.views || 0;
                  const engVal = p.clicks || Math.round(viewsVal * 0.05);
                  const salesVal = p.sales || (p.salesAmount) || (attributedSales.length > 0 ? Math.round(attributedSales.reduce((s, a) => s + (a.sales || 0), 0) / Math.max(1, approvedLivePosts.length)) : 0);
                  const ordersVal = p.orders || (attributedSales.length > 0 ? Math.round(attributedSales.reduce((s, a) => s + (a.unitsSold || 0), 0) / Math.max(1, approvedLivePosts.length)) : 0);

                  return (
                    <tr
                      key={p.id}
                      className="creator-live-post__row"
                      onClick={() => handleOpenVideo(p)}
                      title="Click to review / watch video"
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'left' }}>
                        <div className="creator-live-post__cell">
                          <div className="creator-live-post__thumb">
                            <FileVideo size={18} color="#6538ea" />
                            <span className="creator-live-post__thumb-badge">9:16</span>
                          </div>
                          <div className="creator-live-post__info">
                            <div className="creator-live-post__title">{p.title}</div>
                            <div className="creator-live-post__meta">
                              <span className="creator-live-post__content-type">
                                {p.contentType || (isIG ? 'Instagram Reel' : 'YouTube Short')}
                              </span>
                              <span className="creator-live-post__dot">•</span>
                              <span className="creator-live-post__date">
                                Published {formatDate(p.publishedAt || '2026-10-14')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span className={`creators-platform-tag ${isIG ? 'creators-platform-tag--ig' : 'creators-platform-tag--yt'}`}>
                          {p.platform || (isIG ? 'Instagram' : 'YouTube')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="creator-live-post__link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenVideo(p);
                            }}
                          >
                            <Eye size={12} />
                            <span>Review Video</span>
                          </button>
                          {postUrl && (
                            <a
                              href={postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="creator-live-post__ext-link"
                              onClick={(e) => e.stopPropagation()}
                              title={`Open live post on ${isIG ? 'Instagram' : 'YouTube'}`}
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                          {formatCompactNumber(viewsVal)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>views</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                          {formatCompactNumber(engVal)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                          5.0% ER
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: salesVal > 0 ? '#059669' : '#94a3b8', fontSize: '13.5px' }}>
                          {salesVal > 0 ? formatCurrency(salesVal) : '—'}
                        </div>
                        {ordersVal > 0 && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {ordersVal} orders
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Product Sales Attributed matching Screenshot 4 */}
      {attributedSales.length > 0 && (
        <div className="campaign-pulse__card">
          <h2 className="campaign-pulse__card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={16} color="var(--hp-primary, #6538ea)" />
            <span>Product Sales Attributed ({attributedSales.length})</span>
          </h2>

          <div className="campaign-pulse__table-container">
            <table className="campaign-pulse__table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', width: '45%' }}>PRODUCT</th>
                  <th style={{ textAlign: 'left', width: '25%' }}>CATEGORY</th>
                  <th style={{ textAlign: 'right', width: '15%' }}>UNITS SOLD</th>
                  <th style={{ textAlign: 'right', width: '15%' }}>SALES</th>
                </tr>
              </thead>
              <tbody>
                {attributedSales.map((prod) => {
                  const catBg = prod.category === 'Fashion' ? '#f5f3ff' : prod.category === 'Footwear' ? '#fdf2f8' : '#eff6ff';
                  const catColor = prod.category === 'Fashion' ? '#7c3aed' : prod.category === 'Footwear' ? '#db2777' : '#2563eb';
                  return (
                    <tr key={prod.productId}>
                      <td style={{ textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        {prod.name}
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: catBg,
                          color: catColor,
                        }}>
                          {prod.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        {prod.unitsSold}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '13.5px' }}>
                        {prod.salesDisplay || formatCurrency(prod.sales)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
        />
      )}

    </div>
  );
}
