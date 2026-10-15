/* ============================================
   Product Sales Data
   Keyed by: campaignId + creatorId + productId
   ============================================ */

export const PRODUCTS = [
  { id: 'prod_001', name: 'Head & Shoulders Anti-Dandruff Shampoo', category: 'Hair Care', pricePerUnit: 499 },
  { id: 'prod_002', name: 'Myntra A/W Woolen Trench Coat',           category: 'Fashion',   pricePerUnit: 4499 },
  { id: 'prod_003', name: 'Glow Boosting Vitamin C Serum 50ml',      category: 'Beauty',    pricePerUnit: 1850 },
  { id: 'prod_004', name: 'Chunky Retro Skate Sneakers',             category: 'Footwear',  pricePerUnit: 3999 },
  { id: 'prod_005', name: 'Oversized Street Graphic Hoodie',          category: 'Fashion',   pricePerUnit: 2799 },
  { id: 'prod_006', name: 'Head & Shoulders Scalp Purifying Conditioner', category: 'Hair Care', pricePerUnit: 549 },
  { id: 'prod_007', name: 'Head & Shoulders Smooth & Silky 2-in-1 Shampoo', category: 'Hair Care', pricePerUnit: 699 },
];

export const productSalesRecords = [
  // 6ace2b3abe742272b6135d8e (HaulPack x Amazon Head & Shoulders)
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_bhumi', productId: 'prod_001', unitsSold: 42, orders: 38 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_bhumi', productId: 'prod_006', unitsSold: 28, orders: 25 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_jyoti_y', productId: 'prod_001', unitsSold: 35, orders: 31 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_jyoti_y', productId: 'prod_007', unitsSold: 19, orders: 18 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: '69134e979b7be903cf956b38', productId: 'prod_001', unitsSold: 26, orders: 24 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: '69134e979b7be903cf956b38', productId: 'prod_006', unitsSold: 15, orders: 14 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_ashima', productId: 'prod_001', unitsSold: 31, orders: 29 },
  { campaignId: '6ace2b3abe742272b6135d8e', creatorId: 'cr_jyoti_b', productId: 'prod_007', unitsSold: 22, orders: 20 },
  // camp_001
  { campaignId: 'camp_001', creatorId: 'cr_001', productId: 'prod_001', unitsSold: 24, orders: 24 },
  { campaignId: 'camp_001', creatorId: 'cr_002', productId: 'prod_001', unitsSold: 15, orders: 15 },
  { campaignId: 'camp_001', creatorId: 'cr_001', productId: 'prod_002', unitsSold: 8,  orders: 8  },
  { campaignId: 'camp_001', creatorId: 'cr_003', productId: 'prod_001', unitsSold: 10, orders: 10 },
  { campaignId: 'camp_001', creatorId: 'cr_004', productId: 'prod_002', unitsSold: 5,  orders: 5  },
  { campaignId: 'camp_001', creatorId: 'cr_005', productId: 'prod_003', unitsSold: 12, orders: 12 },
  { campaignId: 'camp_001', creatorId: 'cr_006', productId: 'prod_001', unitsSold: 9,  orders: 9  },
  { campaignId: 'camp_001', creatorId: 'cr_007', productId: 'prod_003', unitsSold: 6,  orders: 6  },
  // camp_002
  { campaignId: 'camp_002', creatorId: 'cr_001', productId: 'prod_004', unitsSold: 11, orders: 11 },
  { campaignId: 'camp_002', creatorId: 'cr_002', productId: 'prod_005', unitsSold: 18, orders: 18 },
  { campaignId: 'camp_002', creatorId: 'cr_003', productId: 'prod_004', unitsSold: 7,  orders: 7  },
  { campaignId: 'camp_002', creatorId: 'cr_008', productId: 'prod_001', unitsSold: 14, orders: 14 },
  { campaignId: 'camp_002', creatorId: 'cr_009', productId: 'prod_005', unitsSold: 20, orders: 20 },
  { campaignId: 'camp_002', creatorId: 'cr_010', productId: 'prod_002', unitsSold: 3,  orders: 3  },
  // camp_003
  { campaignId: 'camp_003', creatorId: 'cr_001', productId: 'prod_003', unitsSold: 30, orders: 30 },
  { campaignId: 'camp_003', creatorId: 'cr_002', productId: 'prod_003', unitsSold: 17, orders: 17 },
  { campaignId: 'camp_003', creatorId: 'cr_004', productId: 'prod_003', unitsSold: 9,  orders: 9  },
  { campaignId: 'camp_003', creatorId: 'cr_005', productId: 'prod_002', unitsSold: 4,  orders: 4  },
  // camp_bc_001
  { campaignId: 'camp_bc_001', creatorId: 'cr_001', productId: 'prod_002', unitsSold: 6,  orders: 6  },
  { campaignId: 'camp_bc_001', creatorId: 'cr_003', productId: 'prod_002', unitsSold: 9,  orders: 9  },
  { campaignId: 'camp_bc_001', creatorId: 'cr_006', productId: 'prod_002', unitsSold: 15, orders: 15 },
  // camp_bc_002
  { campaignId: 'camp_bc_002', creatorId: 'cr_016', productId: 'prod_005', unitsSold: 22, orders: 22 },
  { campaignId: 'camp_bc_002', creatorId: 'cr_017', productId: 'prod_004', unitsSold: 13, orders: 13 },
  { campaignId: 'camp_bc_002', creatorId: 'cr_018', productId: 'prod_005', unitsSold: 8,  orders: 8  },
];

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

function withValue(record) {
  const product = getProductById(record.productId);
  return {
    ...record,
    salesValue: product ? product.pricePerUnit * record.unitsSold : 0,
    productName: product ? product.name : 'Unknown',
    productCategory: product ? product.category : '-',
  };
}

import { getCampaignsByPortal } from './campaigns.js';
import { getCreatorById } from './creators.js';

export function getAggregatedProductSales(portalType) {
  let records = productSalesRecords.map(withValue);
  if (portalType) {
    const campIds = new Set(getCampaignsByPortal(portalType).map(c => c.id));
    records = records.filter(r => campIds.has(r.campaignId));
  }
  const map = new Map();
  records.forEach(r => {
    const key = r.productId + '::' + r.creatorId;
    if (!map.has(key)) {
      map.set(key, {
        productId: r.productId,
        productName: r.productName,
        productCategory: r.productCategory,
        creatorId: r.creatorId,
        unitsSold: 0,
        salesValue: 0,
        orders: 0,
      });
    }
    const agg = map.get(key);
    agg.unitsSold  += r.unitsSold;
    agg.salesValue += r.salesValue;
    agg.orders     += r.orders;
  });
  return Array.from(map.values()).map(row => {
    const creator = getCreatorById(row.creatorId);
    return {
      ...row,
      creatorName:   creator ? creator.name         : 'Unknown',
      creatorHandle: creator ? creator.socialHandle : '-',
      platform:      creator ? creator.platform     : '-',
      avatarColor:   creator ? creator.avatarColor  : '#6538ea',
    };
  }).sort((a, b) => b.salesValue - a.salesValue);
}

export function getProductSalesKPIs(portalType) {
  const rows = getAggregatedProductSales(portalType);
  return {
    totalUnitsSold:  rows.reduce((s, r) => s + r.unitsSold,  0),
    totalSalesValue: rows.reduce((s, r) => s + r.salesValue, 0),
    totalOrders:     rows.reduce((s, r) => s + r.orders,     0),
    activeProducts:  new Set(rows.map(r => r.productId)).size,
    activeCreators:  new Set(rows.map(r => r.creatorId)).size,
  };
}

export function getProductSalesForCampaign(campaignId) {
  const rows = productSalesRecords
    .filter(r => r.campaignId === campaignId)
    .map(withValue);

  // Group by productId
  const byProduct = {};
  rows.forEach(r => {
    if (!byProduct[r.productId]) {
      byProduct[r.productId] = {
        productId: r.productId,
        productName: r.productName,
        productCategory: r.productCategory,
        pricePerUnit: getProductById(r.productId)?.pricePerUnit || 0,
        unitsSold: 0,
        salesValue: 0,
        orders: 0,
        creators: new Set(),
      };
    }
    byProduct[r.productId].unitsSold += r.unitsSold;
    byProduct[r.productId].salesValue += r.salesValue;
    byProduct[r.productId].orders += r.orders;
    byProduct[r.productId].creators.add(r.creatorId);
  });

  const productsList = Object.values(byProduct)
    .map(p => ({ ...p, creatorCount: p.creators.size }))
    .sort((a, b) => b.salesValue - a.salesValue);

  // Group by creatorId
  const byCreator = {};
  rows.forEach(r => {
    if (!byCreator[r.creatorId]) {
      const cr = getCreatorById(r.creatorId);
      byCreator[r.creatorId] = {
        creatorId: r.creatorId,
        creatorName: cr ? cr.name : 'Unknown',
        creatorHandle: cr ? cr.socialHandle : '-',
        avatarColor: cr ? cr.avatarColor : '#6538ea',
        avatarUrl: cr ? cr.avatarUrl : null,
        unitsSold: 0,
        salesValue: 0,
        orders: 0,
        products: {},
      };
    }
    byCreator[r.creatorId].unitsSold += r.unitsSold;
    byCreator[r.creatorId].salesValue += r.salesValue;
    byCreator[r.creatorId].orders += r.orders;
    byCreator[r.creatorId].products[r.productName] = (byCreator[r.creatorId].products[r.productName] || 0) + r.unitsSold;
  });

  const creatorsList = Object.values(byCreator).map(c => {
    const topProd = Object.entries(c.products).sort((a, b) => b[1] - a[1])[0];
    return {
      ...c,
      topProduct: topProd ? topProd[0] : '—',
    };
  }).sort((a, b) => b.salesValue - a.salesValue);

  const totalOrders = rows.reduce((s, r) => s + r.orders, 0);
  const totalUnitsSold = rows.reduce((s, r) => s + r.unitsSold, 0);
  const totalSalesValue = rows.reduce((s, r) => s + r.salesValue, 0);
  const activeProducts = productsList.length;
  const activeCreators = creatorsList.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSalesValue / totalOrders) : 0;

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
