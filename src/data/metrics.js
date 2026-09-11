/* ============================================
   Metrics Aggregation Layer
   All metrics are derived from content data,
   ensuring consistency across the hierarchy.
   ============================================ */

import { getContentForCampaign, getContentForCreator, getAllContentForCreator } from './content.js';
import { getCreatorsForCampaign, getCampaignsForCreator } from './creators.js';
import { getCampaignById } from './campaigns.js';

export function getCampaignMetrics(campaignId) {
  const content = getContentForCampaign(campaignId);
  const campaignCreators = getCreatorsForCampaign(campaignId);

  return {
    campaignId,
    creatorCount: campaignCreators.length,
    contentCount: content.length,
    views: content.reduce((sum, c) => sum + c.views, 0),
    clicks: content.reduce((sum, c) => sum + c.clicks, 0),
    sales: content.reduce((sum, c) => sum + c.sales, 0),
    rewards: content.reduce((sum, c) => sum + c.reward, 0),
    orders: content.reduce((sum, c) => sum + c.orders, 0),
  };
}

export function getCreatorCampaignMetrics(campaignId, creatorId) {
  const content = getContentForCreator(campaignId, creatorId);

  return {
    campaignId,
    creatorId,
    contentCount: content.length,
    views: content.reduce((sum, c) => sum + c.views, 0),
    clicks: content.reduce((sum, c) => sum + c.clicks, 0),
    sales: content.reduce((sum, c) => sum + c.sales, 0),
    reward: content.reduce((sum, c) => sum + c.reward, 0),
    orders: content.reduce((sum, c) => sum + c.orders, 0),
    avgViewsPerContent: content.length ? Math.round(content.reduce((sum, c) => sum + c.views, 0) / content.length) : 0,
    avgClicksPerContent: content.length ? Math.round(content.reduce((sum, c) => sum + c.clicks, 0) / content.length) : 0,
  };
}

export function getAllCreatorMetricsForCampaign(campaignId) {
  const campaignCreators = getCreatorsForCampaign(campaignId);
  return campaignCreators.map(creator => ({
    ...creator,
    ...getCreatorCampaignMetrics(campaignId, creator.id),
  }));
}

export function getPlatformBreakdown(campaignId) {
  const content = getContentForCampaign(campaignId);
  const breakdown = {};
  content.forEach(c => {
    if (!breakdown[c.platform]) {
      breakdown[c.platform] = { platform: c.platform, count: 0, views: 0, clicks: 0, sales: 0 };
    }
    breakdown[c.platform].count++;
    breakdown[c.platform].views += c.views;
    breakdown[c.platform].clicks += c.clicks;
    breakdown[c.platform].sales += c.sales;
  });
  return Object.values(breakdown).sort((a, b) => b.count - a.count);
}

export function getCampaignTimeSeries(campaignId, metric = 'views', days = null) {
  const content = getContentForCampaign(campaignId);
  if (!content.length) return [];

  // Group content by publish date
  const byDate = {};
  content.forEach(c => {
    const d = c.publishedAt;
    if (!byDate[d]) byDate[d] = { date: d, views: 0, clicks: 0, sales: 0, content: 0 };
    byDate[d].views += c.views;
    byDate[d].clicks += c.clicks;
    byDate[d].sales += c.sales;
    byDate[d].content += 1;
  });

  let series = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

  if (days && days !== 'all') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));
    series = series.filter(s => new Date(s.date) >= cutoff);
  }

  // Accumulate for trend
  let cumulative = 0;
  return series.map(s => {
    cumulative += s[metric] || 0;
    return {
      date: s.date,
      value: s[metric] || 0,
      cumulative,
    };
  });
}

export function getCreatorTimeSeries(campaignId, creatorId, metric = 'views') {
  const content = getContentForCreator(campaignId, creatorId);
  if (!content.length) return [];

  const byDate = {};
  content.forEach(c => {
    const d = c.publishedAt;
    if (!byDate[d]) byDate[d] = { date: d, views: 0, clicks: 0, sales: 0 };
    byDate[d].views += c.views;
    byDate[d].clicks += c.clicks;
    byDate[d].sales += c.sales;
  });

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).map(s => ({
    date: s.date,
    value: s[metric] || 0,
  }));
}

export function getCreatorSalesAnalytics(campaignId, creatorId) {
  const content = getContentForCreator(campaignId, creatorId);
  const totalSales = content.reduce((sum, c) => sum + c.sales, 0);
  const totalOrders = content.reduce((sum, c) => sum + c.orders, 0);

  return {
    totalSales,
    approvedSales: Math.round(totalSales * 0.92),
    orders: totalOrders,
    averageOrderValue: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
  };
}

/* ============================================
   Cross-Campaign Creator Analytics
   ============================================ */

export function getCreatorOverallMetrics(creatorId, portal = null) {
  const content = getAllContentForCreator(creatorId, portal);
  const campaignsParticipated = getCampaignsForCreator(creatorId, portal);

  const views = content.reduce((sum, c) => sum + c.views, 0);
  const clicks = content.reduce((sum, c) => sum + c.clicks, 0);
  const sales = content.reduce((sum, c) => sum + c.sales, 0);
  const reward = content.reduce((sum, c) => sum + c.reward, 0);
  const orders = content.reduce((sum, c) => sum + c.orders, 0);

  return {
    creatorId,
    campaignsCount: campaignsParticipated.length,
    campaigns: campaignsParticipated,
    contentCount: content.length,
    views,
    clicks,
    sales,
    reward,
    orders,
    conversionRate: views > 0 ? parseFloat(((clicks / views) * 100).toFixed(1)) : 0,
    avgOrderValue: orders > 0 ? Math.round(sales / orders) : 0,
    avgViewsPerContent: content.length ? Math.round(views / content.length) : 0,
    avgClicksPerContent: content.length ? Math.round(clicks / content.length) : 0,
  };
}

export function getCreatorCampaignBreakdown(creatorId, portal = null) {
  const campaignsParticipated = getCampaignsForCreator(creatorId, portal);

  return campaignsParticipated.map(rel => {
    const campaign = getCampaignById(rel.campaignId);
    const content = getContentForCreator(rel.campaignId, creatorId);
    const views = content.reduce((sum, c) => sum + c.views, 0);
    const clicks = content.reduce((sum, c) => sum + c.clicks, 0);
    const sales = content.reduce((sum, c) => sum + c.sales, 0);
    const reward = content.reduce((sum, c) => sum + c.reward, 0);
    const orders = content.reduce((sum, c) => sum + c.orders, 0);

    return {
      campaign,
      relation: rel,
      contentCount: content.length,
      views,
      clicks,
      sales,
      reward,
      orders,
      conversionRate: views > 0 ? parseFloat(((clicks / views) * 100).toFixed(1)) : 0,
      content,
    };
  });
}

