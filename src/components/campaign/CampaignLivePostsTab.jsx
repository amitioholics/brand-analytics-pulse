import { useState, useMemo } from 'react';
import {
  Video, Eye, Heart, MessageSquare, TrendingUp, ExternalLink,
  Download, Search, Filter, LayoutGrid, List, CheckCircle2,
  AlertCircle, Sparkles, Clock, ArrowUpRight, Camera
} from 'lucide-react';
import { formatNumber } from '../../utils/formatters';
import './CampaignLivePostsTab.css';

export default function CampaignLivePostsTab({
  livePosts = [],
  campaign,
}) {
  const [viewStyle, setViewStyle] = useState('grid'); // 'grid' | 'table' (PRD 8.9 LP-04)
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  const filteredPosts = useMemo(() => {
    return livePosts.filter(p => {
      if (platformFilter !== 'all' && (p.livePlatform || p.creatorPlatform) !== platformFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = p.creatorName?.toLowerCase().includes(q);
        const handleMatch = p.creatorHandle?.toLowerCase().includes(q);
        const titleMatch = p.videoTitle?.toLowerCase().includes(q);
        if (!nameMatch && !handleMatch && !titleMatch) return false;
      }
      return true;
    });
  }, [livePosts, platformFilter, search]);

  // Export post-level performance table as CSV (PRD 8.11 RP-01)
  const handleExportCSV = () => {
    if (!filteredPosts.length) return;
    const headers = [
      'Creator Name',
      'Handle',
      'Platform',
      'Content Title',
      'Deliverable Format',
      'Posted Date',
      'Post Status',
      'Live Post URL',
      'Views',
      'Likes',
      'Comments',
      'Reach',
      'Engagement Rate (%)',
      'Metrics Source',
      'Last Updated',
    ];

    const rows = filteredPosts.map(p => [
      `"${p.creatorName || ''}"`,
      `"${p.creatorHandle || ''}"`,
      `"${p.livePlatform || p.creatorPlatform || 'Instagram'}"`,
      `"${p.videoTitle || ''}"`,
      `"${p.deliverableType || ''}"`,
      `"${p.livePostSubmittedAt ? p.livePostSubmittedAt.slice(0, 10) : '2026-09-06'}"`,
      `"${p.livePostStatus || 'Live'}"`,
      `"${p.livePostUrl || ''}"`,
      p.views || 0,
      p.likes || 0,
      p.comments || 0,
      p.reach || 0,
      p.engagementRate || 0,
      `"${p.metricsSource || 'Auto (API)'}"`,
      `"${p.lastMetricsUpdated || '2026-09-11 12:00 IST'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `live_posts_performance_${campaign.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="campaign-live-posts-tab fade-in">
      {/* Top Controls Toolbar */}
      <div className="live-posts-toolbar">
        <div className="live-posts-toolbar__left">
          <div className="live-posts-search">
            <Search size={15} className="live-posts-search-icon" />
            <input
              type="text"
              className="live-posts-search-input"
              placeholder="Search live posts by creator, handle, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="live-posts-select"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="Instagram">Instagram Reels</option>
            <option value="YouTube">YouTube Shorts</option>
          </select>
        </div>

        <div className="live-posts-toolbar__right">
          {/* Grid vs Table Toggle (LP-04) */}
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewStyle === 'grid' ? 'active' : ''}`}
              onClick={() => setViewStyle('grid')}
              title="Grid View"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewStyle === 'table' ? 'active' : ''}`}
              onClick={() => setViewStyle('table')}
              title="Table View"
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            className="live-posts-export-btn"
            onClick={handleExportCSV}
            title="Export post-level metrics as CSV (RP-01)"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics note disclaimer (PRD 8.10 PV-09) */}
      <div className="live-posts-disclaimer">
        <span>ℹ️ Numbers are collected from Instagram and YouTube and may differ slightly from what you see in the apps due to refresh timing.</span>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="live-posts-empty">
          <Video size={42} />
          <h4>No live posts yet</h4>
          <p>Approved posts will automatically appear here once creators publish and submit their live post URLs.</p>
        </div>
      ) : viewStyle === 'grid' ? (
        /* Grid View (Thumbnails & Metrics Cards) */
        <div className="live-posts-grid">
          {filteredPosts.map(post => {
            const isInstagram = (post.livePlatform || post.creatorPlatform) === 'Instagram';
            const isLive = post.livePostStatus !== 'Unavailable';

            return (
              <div key={post.id} className="live-post-card">
                {/* Media Header with Platform Tag */}
                <div className="live-post-card__media">
                  <div
                    className="live-post-card__thumb-bg"
                    style={{ background: post.thumbnailColor || '#e0e7ff' }}
                  >
                    <Video size={36} className="live-post-card__thumb-icon" />
                    {post.duration && (
                      <span className="live-post-card__duration">{post.duration}</span>
                    )}
                  </div>

                  <div className="live-post-card__badges">
                    <span className={`platform-pill platform-pill--${isInstagram ? 'ig' : 'yt'}`}>
                      {isInstagram ? <Camera size={12} /> : <Video size={12} />}
                      <span>{isInstagram ? 'Instagram Reel' : 'YouTube Short'}</span>
                    </span>

                    <span className={`status-pill status-pill--${isLive ? 'live' : 'unavail'}`}>
                      <span className="pulse-dot" />
                      <span>{isLive ? 'Live' : 'Unavailable'}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="live-post-card__body">
                  <div className="live-post-card__creator">
                    <span className="creator-name">{post.creatorName}</span>
                    <span className="creator-handle">{post.creatorHandle}</span>
                  </div>

                  <h4 className="live-post-card__title" title={post.videoTitle}>
                    {post.videoTitle}
                  </h4>

                  {/* 4 Social Metrics (LP-02) */}
                  <div className="live-post-card__metrics-grid">
                    <div className="metric-box">
                      <div className="metric-box__header">
                        <Eye size={12} />
                        <span>Views</span>
                      </div>
                      <strong className="metric-box__val">{formatNumber(post.views || 0)}</strong>
                    </div>

                    <div className="metric-box">
                      <div className="metric-box__header">
                        <Heart size={12} />
                        <span>Likes</span>
                      </div>
                      <strong className="metric-box__val">{formatNumber(post.likes || 0)}</strong>
                    </div>

                    <div className="metric-box">
                      <div className="metric-box__header">
                        <MessageSquare size={12} />
                        <span>Comments</span>
                      </div>
                      <strong className="metric-box__val">{formatNumber(post.comments || 0)}</strong>
                    </div>

                    <div className="metric-box">
                      <div className="metric-box__header">
                        <TrendingUp size={12} />
                        <span>Engagement</span>
                      </div>
                      <strong className="metric-box__val" style={{ color: '#059669' }}>
                        {post.engagementRate || '7.2'}%
                      </strong>
                    </div>
                  </div>

                  {/* Reach & Source Info */}
                  <div className="live-post-card__sub-info">
                    <span>Unique Reach: <strong>{formatNumber(post.reach || 0)}</strong></span>
                    <span className="source-tag">{post.metricsSource || 'Auto (API)'}</span>
                  </div>
                </div>

                {/* Card Footer: Open Post Button (LP-01) */}
                <div className="live-post-card__footer">
                  <span className="post-date">
                    Posted {post.livePostSubmittedAt ? post.livePostSubmittedAt.slice(0, 10) : '2026-09-06'}
                  </span>

                  {post.livePostUrl && (
                    <a
                      href={post.livePostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-post-btn"
                      title="Open video on platform"
                    >
                      <span>Open Post</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View (LP-04) */
        <div className="live-posts-table-card">
          <table className="live-posts-table">
            <thead>
              <tr>
                <th>Creator & Video</th>
                <th>Platform</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Views</th>
                <th style={{ textAlign: 'right' }}>Likes</th>
                <th style={{ textAlign: 'right' }}>Comments</th>
                <th style={{ textAlign: 'right' }}>Reach</th>
                <th style={{ textAlign: 'right' }}>ER%</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => {
                const isInstagram = (post.livePlatform || post.creatorPlatform) === 'Instagram';
                const isLive = post.livePostStatus !== 'Unavailable';

                return (
                  <tr key={post.id} className="live-table-row">
                    <td>
                      <div>
                        <div className="table-video-title">{post.videoTitle}</div>
                        <div className="table-creator-handle">{post.creatorName} ({post.creatorHandle})</div>
                      </div>
                    </td>

                    <td>
                      <span className={`platform-pill platform-pill--${isInstagram ? 'ig' : 'yt'}`}>
                        {isInstagram ? 'Instagram' : 'YouTube'}
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill status-pill--${isLive ? 'live' : 'unavail'}`}>
                        {isLive ? 'Live' : 'Unavailable'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNumber(post.views || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(post.likes || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(post.comments || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(post.reach || 0)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                      {post.engagementRate || '7.2'}%
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {post.livePostUrl && (
                        <a
                          href={post.livePostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-open-btn"
                          title="Open post in new tab"
                        >
                          <span>Open</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
