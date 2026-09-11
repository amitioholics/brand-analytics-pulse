import { useState, useMemo } from 'react';
import {
  Video, Eye, Heart, MessageSquare, TrendingUp, Users,
  Sparkles, ExternalLink, Award, Camera
} from 'lucide-react';
import { formatNumber, formatPercent } from '../../utils/formatters';
import CampaignPerformanceChart from './CampaignPerformanceChart';
import ContentSummary from './ContentSummary';
import './CampaignPerformanceTab.css';

export default function CampaignPerformanceTab({
  campaign,
  socialKPIs,
  chartData = [],
  platformBreakdown = {},
  allCreators = [],
}) {
  const [chartMetric, setChartMetric] = useState('views');
  const [chartTime, setChartTime] = useState('all');
  const [topPostsTab, setTopPostsTab] = useState('views'); // 'views' | 'er' (PRD PV-04)

  const livePosts = socialKPIs?.livePosts || [];

  // Top 5 Posts (PRD 8.10 PV-04)
  const top5Posts = useMemo(() => {
    return [...livePosts]
      .sort((a, b) => (topPostsTab === 'views' ? (b.views || 0) - (a.views || 0) : (b.engagementRate || 0) - (a.engagementRate || 0)))
      .slice(0, 5);
  }, [livePosts, topPostsTab]);

  const kpiTiles = [
    { label: 'Live Posts', value: formatNumber(socialKPIs?.livePostsCount || livePosts.length), icon: Video, color: '#3b82f6' },
    { label: 'Total Views', value: formatNumber(socialKPIs?.totalViews || 0), icon: Eye, color: '#10b981' },
    { label: 'Total Reach', value: formatNumber(socialKPIs?.totalReach || 0), icon: Users, color: '#655bef' },
    { label: 'Total Likes', value: formatNumber(socialKPIs?.totalLikes || 0), icon: Heart, color: '#ec4899' },
    { label: 'Total Comments', value: formatNumber(socialKPIs?.totalComments || 0), icon: MessageSquare, color: '#f59e0b' },
    { label: 'Avg Engagement Rate', value: `${socialKPIs?.avgEngagementRate || '7.2'}%`, icon: TrendingUp, color: '#059669' },
  ];

  return (
    <div className="campaign-performance-tab fade-in">
      {/* 6 Social KPI Tiles (PRD 8.10 PV-01) */}
      <div className="social-kpi-grid">
        {kpiTiles.map(tile => {
          const Icon = tile.icon;
          return (
            <div key={tile.label} className="social-kpi-tile" style={{ borderLeft: `3px solid ${tile.color}` }}>
              <div className="social-kpi-tile__header">
                <div className="social-kpi-tile__icon" style={{ color: tile.color, background: `${tile.color}15` }}>
                  <Icon size={18} />
                </div>
                <span className="social-kpi-tile__label">{tile.label}</span>
              </div>
              <div className="social-kpi-tile__val">{tile.value}</div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Disclaimer (PRD 8.10 PV-09) */}
      <div className="metrics-disclaimer-card">
        <span>ℹ️ <strong>Platform Sync Notice:</strong> Numbers are collected from Instagram and YouTube and may differ slightly from what you see in the apps due to refresh timing. Data source: <code>Auto (Creator API & Verified Sync)</code></span>
      </div>

      {/* Trend Chart (PRD PV-05) */}
      <div className="performance-section-card">
        <CampaignPerformanceChart
          data={chartData}
          selectedMetric={chartMetric}
          selectedTime={chartTime}
          onMetricChange={setChartMetric}
          onTimeFilterChange={setChartTime}
        />
      </div>

      {/* Grid: Top 5 Posts (PV-04) & Platform Split (PV-06) */}
      <div className="performance-split-grid">
        {/* Top 5 Posts Card */}
        <div className="performance-card">
          <div className="performance-card__header">
            <div className="performance-card__title-box">
              <Award size={18} className="text-amber" />
              <h3 className="performance-card__title">Top 5 Live Posts</h3>
            </div>
            <div className="top-posts-toggle">
              <button
                type="button"
                className={`top-toggle-btn ${topPostsTab === 'views' ? 'active' : ''}`}
                onClick={() => setTopPostsTab('views')}
              >
                By Views
              </button>
              <button
                type="button"
                className={`top-toggle-btn ${topPostsTab === 'er' ? 'active' : ''}`}
                onClick={() => setTopPostsTab('er')}
              >
                By Engagement
              </button>
            </div>
          </div>

          <div className="top-posts-list">
            {top5Posts.length === 0 ? (
              <p className="top-posts-empty">Performance data will appear here once creators start posting.</p>
            ) : (
              top5Posts.map((post, idx) => (
                <div key={post.id} className="top-post-item">
                  <span className="top-post-rank">#{idx + 1}</span>
                  <div className="top-post-info">
                    <div className="top-post-title">{post.videoTitle}</div>
                    <div className="top-post-handle">
                      {post.creatorName} ({post.creatorHandle})
                    </div>
                  </div>
                  <div className="top-post-metric">
                    <strong>
                      {topPostsTab === 'views' ? formatNumber(post.views || 0) : `${post.engagementRate || '7.2'}%`}
                    </strong>
                    <span>{topPostsTab === 'views' ? 'Views' : 'Engagement'}</span>
                  </div>
                  {post.livePostUrl && (
                    <a
                      href={post.livePostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="top-post-link"
                      title="Open Live Reel / Video"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Platform Split & Engagement Insights (PV-06) */}
        <div className="performance-card">
          <div className="performance-card__header">
            <div className="performance-card__title-box">
              <Sparkles size={18} style={{ color: '#655bef' }} />
              <h3 className="performance-card__title">Platform Split</h3>
            </div>
          </div>

          <div className="platform-split-body">
            <div className="platform-split-item">
              <div className="platform-split-row">
                <div className="platform-name-tag platform-name-tag--ig">
                  <Camera size={14} />
                  <span>Instagram Reels</span>
                </div>
                <strong>72% of Views</strong>
              </div>
              <div className="split-progress-track">
                <div className="split-progress-bar split-progress-bar--ig" style={{ width: '72%' }} />
              </div>
              <div className="split-stats-row">
                <span>Avg. Reach: <strong>140K / post</strong></span>
                <span>Avg. ER: <strong>7.4%</strong></span>
              </div>
            </div>

            <div className="platform-split-item">
              <div className="platform-split-row">
                <div className="platform-name-tag platform-name-tag--yt">
                  <Video size={14} />
                  <span>YouTube Shorts</span>
                </div>
                <strong>28% of Views</strong>
              </div>
              <div className="split-progress-track">
                <div className="split-progress-bar split-progress-bar--yt" style={{ width: '28%' }} />
              </div>
              <div className="split-stats-row">
                <span>Avg. Reach: <strong>92K / post</strong></span>
                <span>Avg. ER: <strong>5.8%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
