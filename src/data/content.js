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

const PG_LIVE_CONTENT = [
  {
    id: 'post_jyoti_1',
    campaignId: '6ace2b3abe742272b6135d8e',
    creatorId: 'cr_jyoti_y',
    title: 'Head & Shoulders Scalp Care Routine — Anti-Dandruff Review',
    caption: 'My everyday scalp care secret with Head & Shoulders Anti-Dandruff range! Available now on Amazon. #HeadAndShoulders #AmazonFinds #Ad',
    platform: 'Instagram',
    contentType: 'Instagram Reel',
    contentUrl: 'https://www.instagram.com/reel/C8kF9xXyZ02',
    publishedAt: '2026-10-14',
    status: 'Approved',
    views: 185000,
    clicks: 9250,
    sales: 17400,
    orders: 31,
  },
  {
    id: 'post_jyoti_2',
    campaignId: '6ace2b3abe742272b6135d8e',
    creatorId: 'cr_jyoti_y',
    title: 'Smooth & Silky 2-in-1 Daily Wash Haul',
    caption: 'Clean, nourished hair all week long with Head & Shoulders on Amazon! #HeadAndShoulders #DailyCare #Ad',
    platform: 'Instagram',
    contentType: 'Instagram Reel',
    contentUrl: 'https://www.instagram.com/reel/C8kF9xXyZ03',
    publishedAt: '2026-10-15',
    status: 'Approved',
    views: 142000,
    clicks: 7100,
    sales: 13300,
    orders: 18,
  },
  {
    id: 'post_supriya_1',
    campaignId: '6ace2b3abe742272b6135d8e',
    creatorId: 'cr_supriya_g',
    title: 'Anti-Dandruff Scalp Refresh & Styling',
    caption: 'Dandruff-free smooth hair with Head & Shoulders! Shop exclusive deals on Amazon. #HeadAndShoulders #HairCare #Ad',
    platform: 'Instagram',
    contentType: 'Instagram Reel',
    contentUrl: 'https://www.instagram.com/reel/C8kF9xXyZ04',
    publishedAt: '2026-10-14',
    status: 'Approved',
    views: 125000,
    clicks: 6250,
    sales: 13000,
    orders: 24,
  },
  {
    id: 'post_supriya_2',
    campaignId: '6ace2b3abe742272b6135d8e',
    creatorId: 'cr_supriya_g',
    title: 'Conditioner Wash Routine with Head & Shoulders',
    caption: 'Say goodbye to flaky scalp with Head & Shoulders Cool Menthol! Link in bio to Amazon shop. #HeadAndShoulders #Ad',
    platform: 'Instagram',
    contentType: 'Instagram Reel',
    contentUrl: 'https://www.instagram.com/reel/C8kF9xXyZ05',
    publishedAt: '2026-10-15',
    status: 'Approved',
    views: 98000,
    clicks: 4900,
    sales: 8200,
    orders: 14,
  },
  {
    id: 'post_amit_1',
    campaignId: '6ace2b3abe742272b6135d8e',
    creatorId: 'cr_amit_t',
    title: 'Head & Shoulders Cool Menthol Anti-Dandruff Routine',
    caption: 'Keeping hair fresh and flake-free with Head & Shoulders Cool Menthol! Check out the Amazon exclusive link in bio. #HeadAndShoulders #AmazonFinds #Ad',
    platform: 'Instagram',
    contentType: 'Instagram Reel',
    contentUrl: 'https://www.instagram.com/reel/C8kF9xXyZ06',
    publishedAt: '2026-10-14',
    status: 'Approved',
    views: 240000,
    clicks: 12000,
    sales: 61600,
    orders: 20,
  },
  {
    id: 'post_ritu_1',
    campaignId: '6ace2b3abe742272b6135d8e',
    creatorId: 'cr_ritu_s',
    title: 'Deep Clean Scalp Care Routine with Head & Shoulders',
    caption: 'My secret to healthy, dandruff-free hair: Head & Shoulders on Amazon! #HeadAndShoulders #HairCare #Ad',
    platform: 'Instagram',
    contentType: 'Instagram Reel',
    contentUrl: 'https://www.instagram.com/reel/C8kF9xXyZ07',
    publishedAt: '2026-10-15',
    status: 'Approved',
    views: 195000,
    clicks: 9750,
    sales: 52000,
    orders: 12,
  },
  {
    id: 'post_aditi_1',
    campaignId: '6ace2b3abe742272b6135d8e',
    creatorId: 'cr_aditi',
    title: 'Smooth & Nourished Scalp Care with Head & Shoulders',
    caption: 'Transforming my hair routine with Head & Shoulders Scalp Care essentials on Amazon ✨ #HeadAndShoulders #DailyCare #Ad',
    platform: 'Instagram',
    contentType: 'Instagram Reel',
    contentUrl: 'https://www.instagram.com/reel/C8kF9xXyZ08',
    publishedAt: '2026-10-16',
    status: 'Approved',
    views: 160000,
    clicks: 8000,
    sales: 27000,
    orders: 5,
  },
];

export function getAllContent() {
  if (_allContent) return _allContent;
  _allContent = [...PG_LIVE_CONTENT];
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
