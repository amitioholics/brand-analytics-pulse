/* ============================================
   Mock Content Data — Generated per creator/campaign
   ============================================ */

import { getCreatorsForCampaign } from './creators.js';

const TITLES_INSTAGRAM = [
  'Summer Fashion Haul', 'Style on a Budget', 'Festive Look Book',
  'Top 10 Picks This Month', 'Outfit of the Day', 'Shopping Haul Unboxing',
  'Wardrobe Essentials', 'Trending Fashion Finds', 'Best Deals Roundup',
  'Ethnic Wear Collection', 'Accessories Haul', 'Makeup & Style Guide',
  'Casual Wear Ideas', 'Street Style Lookbook', 'Home Decor Finds',
  'Kitchen Essentials Haul', 'Beauty Favorites', 'Travel Essentials',
  'Skincare Routine Picks', 'Weekend Outfits Inspo',
];

const TITLES_YOUTUBE = [
  'Complete Shopping Guide', 'Honest Product Review', 'Unboxing & First Impressions',
  'Best Deals You Can\'t Miss', 'Product Comparison & Review', 'Festive Season Buying Guide',
  'Top Recommendations', 'My Favorite Products Review', 'Value for Money Picks',
  'Tech Unboxing & Setup', 'Full Review After 30 Days', 'Must-Have Products 2026',
  'Budget vs Premium Comparison', 'Shopping Tips & Tricks', 'Detailed Buying Guide',
  'Product Durability Test', 'Smart Shopping Hacks', 'Mega Sale Best Picks',
  'Quality Check Review', 'My Honest Opinion',
];

const THUMBNAIL_COLORS = [
  '#dbeafe', '#fce7f3', '#d1fae5', '#fef3c7', '#e0e7ff',
  '#ede9fe', '#cffafe', '#ffedd5', '#fee2e2', '#ccfbf1',
];

// Deterministic pseudo-random based on seed
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateContentForCampaignCreator(campaignId, creatorId, creatorPlatform, campStart, campEnd) {
  const seed = (campaignId + creatorId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const contentCount = 2 + Math.floor(seededRandom(seed) * 8); // 2–9 pieces
  const titles = creatorPlatform === 'YouTube' ? TITLES_YOUTUBE : TITLES_INSTAGRAM;
  const contentType = creatorPlatform === 'YouTube' ? 'YouTube Video' : 'Instagram Reel';
  const items = [];

  const startMs = new Date(campStart).getTime();
  const endMs = new Date(campEnd).getTime();
  const range = endMs - startMs;

  for (let i = 0; i < contentCount; i++) {
    const s = seed + i * 137;
    const r = seededRandom;

    const views = Math.floor(5000 + r(s + 1) * 200000);
    const clicks = Math.floor(views * (0.015 + r(s + 2) * 0.045));
    const salesAmount = Math.floor(clicks * (8 + r(s + 3) * 25));
    const reward = Math.floor(salesAmount * (0.04 + r(s + 4) * 0.03));
    const conversionRate = parseFloat(((clicks / views) * 100).toFixed(1));
    const publishMs = startMs + Math.floor(r(s + 5) * Math.min(range, Date.now() - startMs));

    const hasUrl = r(s + 6) > 0.1; // 90% have URL

    items.push({
      id: `content_${campaignId}_${creatorId}_${i}`,
      campaignId,
      creatorId,
      title: titles[(seed + i) % titles.length],
      caption: `Check out these amazing ${creatorPlatform === 'YouTube' ? 'products' : 'picks'} — link in bio! #ad #sponsored`,
      thumbnailColor: THUMBNAIL_COLORS[(seed + i) % THUMBNAIL_COLORS.length],
      platform: creatorPlatform,
      contentType,
      contentUrl: hasUrl ? `https://www.${creatorPlatform.toLowerCase()}.com/p/${creatorId}_${i}` : null,
      publishedAt: new Date(publishMs).toISOString().split('T')[0],
      status: 'Published',
      views,
      clicks,
      sales: salesAmount,
      reward,
      conversionRate,
      orders: Math.floor(clicks * (0.05 + r(s + 7) * 0.1)),
    });
  }

  return items;
}

// Build all content
let _allContent = null;

export function getAllContent() {
  if (_allContent) return _allContent;

  const campaignDates = {
    // Reward Program
    camp_001: { start: '2026-09-01', end: '2026-09-30' },
    camp_002: { start: '2026-08-15', end: '2026-09-30' },
    camp_003: { start: '2026-08-01', end: '2026-08-31' },
    // Brand Connect
    camp_bc_001: { start: '2026-09-01', end: '2026-09-30' },
    camp_bc_002: { start: '2026-08-20', end: '2026-09-25' },
    camp_bc_003: { start: '2026-08-01', end: '2026-08-31' },
  };

  _allContent = [];

  Object.entries(campaignDates).forEach(([campId, dates]) => {
    const campCreators = getCreatorsForCampaign(campId);
    campCreators.forEach(creator => {
      const pieces = generateContentForCampaignCreator(
        campId, creator.id, creator.platform, dates.start, dates.end
      );
      _allContent.push(...pieces);
    });
  });

  return _allContent;
}

import { getCampaignsByPortal } from './campaigns.js';

export function getContentForCampaign(campaignId) {
  return getAllContent().filter(c => c.campaignId === campaignId);
}

export function getContentForCreator(campaignId, creatorId) {
  return getAllContent().filter(c => c.campaignId === campaignId && c.creatorId === creatorId);
}

export function getAllContentForCreator(creatorId, portal = null) {
  let list = getAllContent().filter(c => c.creatorId === creatorId);
  if (portal) {
    const portalCampIds = new Set(getCampaignsByPortal(portal).map(c => c.id));
    list = list.filter(c => portalCampIds.has(c.campaignId));
  }
  return list;
}

export function getContentById(contentId) {
  return getAllContent().find(c => c.id === contentId) || null;
}
