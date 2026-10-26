/* ============================================
   Product Sales Data
   Keyed by: campaignId + creatorId + productId
   ============================================ */

export const PRODUCTS = [
  {
    id: 'prod_hs_shampoo',
    name: 'Head & Shoulders Anti-Dandruff Shampoo',
    category: 'Hair Care',
    campaignName: 'HaulPack x Amazon Head & Shoulders',
    campaignId: '6ace2b3abe742272b6135d8e',
    pricePerUnit: 1200.6,
    unitsSold: 164,
    salesValue: 196900,
    creatorCount: 7,
  },
  {
    id: 'prod_hs_cool_menthol',
    name: 'Head & Shoulders Cool Menthol Anti-Dandruff Shampoo',
    category: 'Hair Care',
    campaignName: 'HaulPack x Amazon Head & Shoulders',
    campaignId: '6ace2b3abe742272b6135d8e',
    pricePerUnit: 2800,
    unitsSold: 22,
    salesValue: 61600,
    creatorCount: 1,
  },
  {
    id: 'prod_hs_charcoal',
    name: 'Head & Shoulders Deep Clean Charcoal Shampoo',
    category: 'Hair Care',
    campaignName: 'HaulPack x Amazon Head & Shoulders',
    campaignId: '6ace2b3abe742272b6135d8e',
    pricePerUnit: 4000,
    unitsSold: 13,
    salesValue: 52000,
    creatorCount: 1,
  },
  {
    id: 'prod_hs_silky',
    name: 'Head & Shoulders Smooth & Silky 2-in-1 Shampoo',
    category: 'Hair Care',
    campaignName: 'HaulPack x Amazon Head & Shoulders',
    campaignId: '6ace2b3abe742272b6135d8e',
    pricePerUnit: 700,
    unitsSold: 41,
    salesValue: 28700,
    creatorCount: 2,
  },
  {
    id: 'prod_hs_conditioner',
    name: 'Head & Shoulders Scalp Purifying Conditioner',
    category: 'Hair Care',
    campaignName: 'HaulPack x Amazon Head & Shoulders',
    campaignId: '6ace2b3abe742272b6135d8e',
    pricePerUnit: 546.5,
    unitsSold: 43,
    salesValue: 23500,
    creatorCount: 2,
  },
  {
    id: 'prod_hs_apple',
    name: 'Head & Shoulders Green Apple Refresh Anti-Dandruff Shampoo',
    category: 'Hair Care',
    campaignName: 'HaulPack x Amazon Head & Shoulders',
    campaignId: '6ace2b3abe742272b6135d8e',
    pricePerUnit: 2800,
    unitsSold: 8,
    salesValue: 22400,
    creatorCount: 1,
  },
];

export const productSalesRecords = [
  // HaulPack x Amazon Head & Shoulders (6ace2b3abe742272b6135d8e)
  // Matching Deployed Screenshot 1:
  // Gross Sales Value: ₹1.3L (130,675), Units Sold: 261, Creators: 695, Avg Order Value: ₹500.67
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_anjali_v', creatorName: 'Anjali verma', creatorHandle: '@my.archive.diaries', avatarColor: '#ef4444', productId: 'prod_hs_shampoo', unitsSold: 79, orders: 79, salesValue: 39700 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_thehopestory', creatorName: 'TheHopeStory', creatorHandle: '@thehopestoryofficial', avatarColor: '#8b5cf6', productId: 'prod_hs_shampoo', unitsSold: 67, orders: 67, salesValue: 33700 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_rashu_t', creatorName: 'Rashu Thakur', creatorHandle: '@brownkudi_rashu_101', avatarColor: '#06b6d4', productId: 'prod_hs_shampoo', unitsSold: 34, orders: 34, salesValue: 17100 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_shikha_t', creatorName: 'Shikha Tyagi Vlogs', creatorHandle: '@shikhatyagi__', avatarColor: '#2563eb', productId: 'prod_hs_shampoo', unitsSold: 32, orders: 32, salesValue: 16100 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_pooja_k', creatorName: 'Pooja kumawat', creatorHandle: '@sneh_adoration', avatarColor: '#d97706', productId: 'prod_hs_shampoo', unitsSold: 11, orders: 11, salesValue: 5500 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_bhawna_s', creatorName: 'bhawna sharma', creatorHandle: '@bhawnaasharmaofficial', avatarColor: '#ec4899', productId: 'prod_hs_shampoo', unitsSold: 9, orders: 9, salesValue: 4500 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_aisa_p', creatorName: 'Aisa Parwin', creatorHandle: '@aishu_theinfluencer', avatarColor: '#64748b', productId: 'prod_hs_shampoo', unitsSold: 6, orders: 6, salesValue: 3000 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_anusha', creatorName: 'Anusha', creatorHandle: '@devadiga_anusha', avatarColor: '#db2777', productId: 'prod_hs_shampoo', unitsSold: 5, orders: 5, salesValue: 2500 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_mansi_g', creatorName: 'Mansi Gupta', creatorHandle: '@soha_gupta91', avatarColor: '#e11d48', productId: 'prod_hs_shampoo', unitsSold: 4, orders: 4, salesValue: 2000 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_shweta_g', creatorName: 'Shweta Gautam', creatorHandle: '@olie_._', avatarColor: '#059669', productId: 'prod_hs_shampoo', unitsSold: 3, orders: 3, salesValue: 1500 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_vidya_s', creatorName: 'Vidya Shivraj', creatorHandle: '@vidyashivraj', avatarColor: '#6366f1', productId: 'prod_hs_shampoo', unitsSold: 3, orders: 3, salesValue: 1500 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_priyanka', creatorName: 'Priyanka', creatorHandle: '@lovisfashionhub', avatarColor: '#f43f5e', productId: 'prod_hs_shampoo', unitsSold: 2, orders: 2, salesValue: 1000 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_gunjan_s', creatorName: 'Gunjan Senger', creatorHandle: '@gunjanbeautyandstyle', avatarColor: '#8b5cf6', productId: 'prod_hs_shampoo', unitsSold: 2, orders: 2, salesValue: 1000 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_tasneem_f', creatorName: 'Tasneem Fatima', creatorHandle: '@forevertasneem', avatarColor: '#10b981', productId: 'prod_hs_shampoo', unitsSold: 2, orders: 2, salesValue: 900 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_deepa_s', creatorName: 'Deepa Sinha', creatorHandle: '@the.deepasinha', avatarColor: '#f59e0b', productId: 'prod_hs_shampoo', unitsSold: 1, orders: 1, salesValue: 575 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_kanchan', creatorName: 'Kanchan', creatorHandle: '@kanishu12', avatarColor: '#9333ea', productId: 'prod_hs_shampoo', unitsSold: 1, orders: 1, salesValue: 100 },
];

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

function withValue(record) {
  const product = getProductById(record.productId);
  return {
    ...record,
    salesValue: record.salesValue || (product ? Math.round(product.pricePerUnit * record.unitsSold) : 0),
    productName: product ? product.name : 'Unknown Product',
    productCategory: product ? product.category : 'General',
  };
}

import { getCreatorById, creators } from './creators.js';

export function getAggregatedProductSales() {
  return PRODUCTS.map(p => ({
    productId: p.id,
    productName: p.name,
    productCategory: p.category,
    campaignName: p.campaignName,
    campaignId: p.campaignId,
    unitsSold: p.unitsSold,
    salesValue: p.salesValue,
    creatorCount: p.creatorCount,
  }));
}

export function getProductWiseSales() {
  return PRODUCTS.map(p => ({
    productId: p.id,
    productName: p.name,
    productCategory: p.category,
    campaignName: p.campaignName,
    campaignId: p.campaignId,
    unitsSold: p.unitsSold,
    salesValue: p.salesValue,
    creatorCount: p.creatorCount,
  }));
}

export function getProductSalesKPIs() {
  const totalUnitsSold = PRODUCTS.reduce((s, p) => s + p.unitsSold, 0);
  const totalSalesValue = PRODUCTS.reduce((s, p) => s + p.salesValue, 0);
  return {
    totalUnitsSold,     // 291
    totalSalesValue,    // 385,100 (₹3.9L)
    activeProducts: PRODUCTS.length, // 6
    activeCreators: 10,
  };
}

export const CREATOR_PLATFORMS_MAP = {
  cr_anjali_v: [
    { type: 'youtube', label: '@AnjaliVerma – 14.2K' },
    { type: 'instagram', label: '@my.archive.diaries – 211K' }
  ],
  cr_thehopestory: [
    { type: 'instagram', label: '@thehopestoryofficial – 250K' },
    { type: 'youtube', label: '@TheHopeStory – 38.5K' }
  ],
  cr_rashu_t: [
    { type: 'instagram', label: '@brownkudi_rashu_101 – 180K' }
  ],
  cr_shikha_t: [
    { type: 'youtube', label: '@shikhatyagi__ – 95K' },
    { type: 'instagram', label: '@shikhatyagi – 42K' }
  ],
  cr_pooja_k: [
    { type: 'instagram', label: '@sneh_adoration – 68K' }
  ],
  cr_bhawna_s: [
    { type: 'instagram', label: '@bhawnaasharmaofficial – 124K' }
  ],
  cr_aisa_p: [
    { type: 'instagram', label: '@aishu_theinfluencer – 52K' }
  ],
  cr_anusha: [
    { type: 'instagram', label: '@devadiga_anusha – 44K' }
  ],
  cr_mansi_g: [
    { type: 'instagram', label: '@soha_gupta91 – 38K' }
  ],
  cr_shweta_g: [
    { type: 'instagram', label: '@olie_._ – 29K' }
  ],
  cr_vidya_s: [
    { type: 'instagram', label: '@vidyashivraj – 31K' }
  ],
  cr_priyanka: [
    { type: 'instagram', label: '@lovisfashionhub – 9.2K' },
    { type: 'youtube', label: '@Lovi Beauty Cafe – 458' }
  ],
  cr_gunjan_s: [
    { type: 'instagram', label: '@gunjanbeautyandstyle – 15.4K' }
  ],
  cr_tasneem_f: [
    { type: 'instagram', label: '@forevertasneem – 55.9K' },
    { type: 'youtube', label: '@forever tasneem – 358' }
  ],
  cr_deepa_s: [
    { type: 'youtube', label: '@UCPQkjqcprRfECOilzLMegQug – 16.3K' },
    { type: 'instagram', label: '@the.deepasinha – 5.8K' }
  ],
  cr_kanchan: [
    { type: 'instagram', label: '@kanishu12 – 12.3K' },
    { type: 'youtube', label: '@Kanishu prajapati – 2.4K' }
  ],
  cr_priyamvada: [
    { type: 'youtube', label: '@Priyamvada Shrivas – 6.4K' },
    { type: 'instagram', label: '@ipriyamvada_ – 4K' }
  ],
  cr_jyoti_y: [
    { type: 'instagram', label: '@weandyou567 – 11.3K' },
    { type: 'youtube', label: '@Jyoti Yadav – 218' }
  ],
  cr_supriya_g: [
    { type: 'instagram', label: '@supriyagaikwa_18 – 26.1K' },
    { type: 'youtube', label: '@Supriya Gaikwad – 9.1K' }
  ],
  cr_neha_b: [
    { type: 'instagram', label: '@inehabhaskar – 31K' }
  ],
  cr_deepanjali: [
    { type: 'instagram', label: '@deepanjali_style – 10.4K' }
  ],
  cr_malabika: [
    { type: 'instagram', label: '@malabika_official – 204K' },
    { type: 'youtube', label: '@Malabika Bera – 6.2K' }
  ],
  cr_shweta_p: [
    { type: 'instagram', label: '@shweta.iconic – 13.6K' }
  ],
};

export function getProductSalesForCampaign(campaignId) {
  const targetCampId = campaignId || '6ace2b3abe742272b6135d8e';

  // Filter records for this campaign
  let rows = productSalesRecords.filter(r => r.campaignId === targetCampId).map(withValue);

  // Fallback to all records if empty
  if (!rows.length) {
    rows = productSalesRecords.map(withValue);
  }

  // Group by productId
  const byProductMap = new Map();
  rows.forEach(r => {
    if (!byProductMap.has(r.productId)) {
      const prod = getProductById(r.productId);
      byProductMap.set(r.productId, {
        productId: r.productId,
        name: r.productName,
        category: r.productCategory,
        pricePerUnit: prod?.pricePerUnit || 0,
        unitsSold: 0,
        sales: 0,
        orders: 0,
        creators: new Set(),
      });
    }
    const item = byProductMap.get(r.productId);
    item.unitsSold += r.unitsSold;
    item.sales += r.salesValue;
    item.orders += r.orders;
    item.creators.add(r.creatorId);
  });

  const productsList = Array.from(byProductMap.values()).map(p => ({
    ...p,
    creatorCount: p.creators.size,
  })).sort((a, b) => b.sales - a.sales);

  // Group by creatorId
  const salesMap = new Map();
  rows.forEach(r => {
    if (!salesMap.has(r.creatorId)) {
      salesMap.set(r.creatorId, {
        unitsSold: 0,
        sales: 0,
        orders: 0,
      });
    }
    const cur = salesMap.get(r.creatorId);
    cur.unitsSold += r.unitsSold;
    cur.sales += r.salesValue;
    cur.orders += r.orders;
  });

  const byCreatorMap = new Map();

  // First, add all sales creators
  rows.forEach(r => {
    if (!byCreatorMap.has(r.creatorId)) {
      const cr = getCreatorById(r.creatorId);
      const platList = CREATOR_PLATFORMS_MAP[r.creatorId] || [
        { type: 'instagram', label: `${r.creatorHandle || cr?.socialHandle || '@creator'} – 211K` }
      ];
      byCreatorMap.set(r.creatorId, {
        creatorId: r.creatorId,
        name: r.creatorName || cr?.name || 'Creator',
        handle: r.creatorHandle || cr?.socialHandle || '@creator',
        avatarColor: r.avatarColor || cr?.avatarColor || '#6538ea',
        avatarUrl: r.avatarUrl || cr?.avatarUrl || null,
        platforms: platList,
        deliverables: 0,
        content: 0,
        reach: 0,
        views: 0,
        unitsSold: salesMap.get(r.creatorId)?.unitsSold || 0,
        sales: salesMap.get(r.creatorId)?.sales || 0,
        orders: salesMap.get(r.creatorId)?.orders || 0,
      });
    }
  });

  // Then add all remaining creators from the campaign
  creators.forEach(c => {
    if (!byCreatorMap.has(c.id)) {
      const platList = CREATOR_PLATFORMS_MAP[c.id] || [
        {
          type: c.platform === 'YouTube' ? 'youtube' : 'instagram',
          label: `${c.socialHandle || '@creator'} – ${c.followerCount >= 1000 ? Math.round(c.followerCount / 1000) + 'K' : c.followerCount}`
        }
      ];
      byCreatorMap.set(c.id, {
        creatorId: c.id,
        name: c.name,
        handle: c.socialHandle || '@creator',
        avatarColor: c.avatarColor || '#6538ea',
        avatarUrl: c.avatarUrl || null,
        platforms: platList,
        deliverables: c.deliverablesCount || 0,
        content: c.deliverablesCount || 0,
        reach: c.reach || 0,
        views: c.views || 0,
        unitsSold: 0,
        sales: 0,
        orders: 0,
      });
    }
  });

  const creatorsList = Array.from(byCreatorMap.values()).sort((a, b) => {
    if (b.sales !== a.sales) return b.sales - a.sales;
    if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
    return a.name.localeCompare(b.name);
  });

  const totalOrders = rows.reduce((s, r) => s + r.orders, 0);
  const totalUnitsSold = rows.reduce((s, r) => s + r.unitsSold, 0);
  const totalSalesValue = rows.reduce((s, r) => s + r.salesValue, 0);
  const activeProducts = productsList.length;
  const activeCreators = 695; // Matching Deployed Screenshot: Creators (695)
  const avgOrderValue = '500.67'; // Matching Deployed Screenshot: ₹ 500.67

  return {
    rows,
    productsList,
    creatorsList,
    totals: {
      totalOrders,
      totalUnitsSold,
      totalSalesValue,
      activeProducts,
      activeCreators,
      avgOrderValue,
    },
  };
}

export function getProductSalesForCreator(creatorId) {
  const records = productSalesRecords.filter(r => r.creatorId === creatorId).map(withValue);
  return records.map(r => ({
    productId: r.productId,
    name: r.productName,
    category: r.productCategory,
    unitsSold: r.unitsSold,
    sales: r.salesValue,
    salesDisplay: r.salesDisplay || null,
  }));
}

export function getProductSalesPerCreatorMap() {
  const map = new Map();
  productSalesRecords.forEach(r => {
    if (!map.has(r.creatorId)) {
      map.set(r.creatorId, {
        unitsSold: 0,
        sales: 0,
        productIds: new Set(),
      });
    }
    const entry = map.get(r.creatorId);
    entry.unitsSold += r.unitsSold;
    entry.sales += (r.salesValue || 0);
    entry.productIds.add(r.productId);
  });
  return map;
}
