/* ============================================
   Campaign Data — Single Active P&G Campaign
   ============================================ */

export const campaigns = [
  {
    id: '6ace2b3abe742272b6135d8e',
    brandId: 'brand_pg_001',
    portalType: 'brand-connect',
    name: 'HaulPack x Amazon Head & Shoulders',
    imageUrl: '/campaign-banner.png',
    thumbnailUrl: '/campaign-thumb.png',
    startDate: '2026-10-13',
    endDate: '2026-10-23',
    status: 'Active',
    isBarter: false,
    compensationType: 'Paid Collab',
    approvalMode: 'Either',
    reviewSlaHours: 48,
    registeredCreatorsCount: 418,
    deliverablesCount: 418,
    accountManager: {
      name: 'Aanya Singhania',
      email: 'aanya.s@haulpack.com',
      phone: '+91 98201 44820',
      role: 'Senior Brand Solutions Lead',
      avatarColor: '#655bef',
    },
    tags: ['Hair Care', 'Paid Collab', 'Head & Shoulders'],
    description: 'Premier creator campaign for HaulPack x Amazon Head & Shoulders featuring anti-dandruff scalp care, refresh routine, and Amazon specials.',
    brief: {
      deliverablesSummary: '1x Instagram Reel / YouTube Short',
      deliverablesList: ['1x 9:16 Video Review showcasing Head & Shoulders scalp care routine'],
      productDetails: 'Head & Shoulders Anti-Dandruff & Scalp Care Range on Amazon.',
    },
  },
];

export function getCampaignById(id) {
  if (!id) return campaigns[0];
  return campaigns.find(c => c.id === id) || campaigns[0];
}

export function getCampaignsByBrand(brandId) {
  return campaigns;
}

export function getCampaignsByPortal(portalType) {
  return campaigns;
}
