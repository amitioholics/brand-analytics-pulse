/* ============================================
   Mock Campaign Data
   Categorized by Portal:
   - 'brand-connect': Direct creator collabs & sponsored activations
   - 'reward-program': Performance-based affiliate reward programs
   ============================================ */

export const campaigns = [
  // ---------- Brand Connect Campaigns ----------
  {
    id: 'camp_bc_001',
    brandId: 'brand_haulpack_001',
    portalType: 'brand-connect',
    name: 'Myntra Autumn/Winter 2026 Runway Collab',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: 'Active',
    isBarter: true,
    compensationType: 'Barter & Paid',
    barterKitName: 'Myntra A/W 2026 Runway Designer Lookbook Kit',
    approvalMode: 'Either', // 'Either' | 'Brand only' | 'Haulpack only' (PRD 8.8.1)
    reviewSlaHours: 48,
    accountManager: {
      name: 'Aanya Singhania',
      email: 'aanya.s@haulpack.com',
      phone: '+91 98201 44820',
      role: 'Senior Brand Solutions Lead',
      avatarColor: '#655bef',
    },
    tags: ['Fashion', 'Sponsored', 'Lookbook', 'Barter & Paid'],
    description: 'Direct brand collaboration campaign with premier creators showcasing Myntra A/W 2026 runway collections and curated designer wear.',
    brief: {
      deliverablesSummary: '1x Instagram Reel (30-60s) + 1x Story with Link Sticker',
      deliverablesList: [
        '1x 9:16 Vertical Instagram Reel (High Resolution 1080x1920, 30–60s duration)',
        '1x Instagram Story showcasing the outfit try-on with direct product sticker link',
        'Optional YouTube Short cross-posting with dedicated coupon code',
      ],
      productDetails: '2 Designer apparel / outerwear items dispatched from Myntra Autumn/Winter Runway collection (Woolen Trench Coat, Velvet Blazers, Cashmere Sweaters).',
      guidelines: {
        requiredHashtags: ['#MyntraAW26', '#MyntraRunway', '#AutumnWinterStyle', '#MyntraFashion'],
        handlesToTag: ['@myntra', '@haulpack'],
        disclosureLabel: '#Ad or #Collab clearly placed in first 2 lines of caption and visible in opening frame',
        durationLimit: '30 to 60 seconds (no reels under 25s)',
        keyMessages: [
          'Highlight the fabric luxury, premium runway drape, and cold-weather versatility.',
          'Mention that all featured pieces are exclusively available on the Myntra App.',
          'Encourage viewers to check the link sticker in Stories and bio for exclusive discount codes.',
        ],
        dos: [
          'Film in natural, soft daylight or professional studio lighting with crisp audio.',
          'Show at least 2 distinct styling looks or transition moments.',
          'Keep the outfit clearly visible in the top 70% of the screen (free of UI clutter).',
        ],
        donts: [
          'Do NOT mention competing e-commerce platforms or marketplaces.',
          'Do NOT use blurry or low-light video clips.',
          'Do NOT post the video live without prior Brand / Haulpack Draft Approval.',
        ],
      },
      eligibility: 'Fashion and lifestyle creators with 50K+ followers, >3% engagement rate, and primary audience in tier 1 & 2 cities.',
      timeline: {
        registrationDeadline: '2026-09-04',
        productDispatch: '2026-09-02 to 2026-09-06',
        draftSubmissionDeadline: '2026-09-15',
        goLiveWindow: '2026-09-16 to 2026-09-28',
      },
    },
  },
  {
    id: 'camp_bc_002',
    brandId: 'brand_haulpack_001',
    portalType: 'brand-connect',
    name: 'Myntra Gen-Z Streetwear Spotlight',
    startDate: '2026-08-20',
    endDate: '2026-09-25',
    status: 'Active',
    isBarter: true,
    compensationType: 'Barter Collab',
    barterKitName: 'Gen-Z Streetwear & Sneaker Drop Kit',
    approvalMode: 'Either',
    reviewSlaHours: 48,
    accountManager: {
      name: 'Kabir Oberoi',
      email: 'kabir.o@haulpack.com',
      phone: '+91 97110 32190',
      role: 'Growth & Collabs Partner',
      avatarColor: '#10b981',
    },
    tags: ['Gen-Z', 'Streetwear', 'Reels Collab', 'Barter Collab'],
    description: 'Creator partnership program featuring trending streetwear, sneakers, and daily college lookbooks with dedicated deliverables.',
    brief: {
      deliverablesSummary: '1x Trend-Driven Instagram Reel or YouTube Short',
      deliverablesList: [
        '1x Fast-paced outfit transition Reel (20–45s)',
        'Trending audio sync with streetwear styling cues',
      ],
      productDetails: 'Oversized graphic streetwear tees, cargo pants, retro skate sneakers from top street labels on Myntra.',
      guidelines: {
        requiredHashtags: ['#MyntraStreetwear', '#GenZFits', '#DripCheck', '#StreetStyleIndia'],
        handlesToTag: ['@myntra'],
        disclosureLabel: '#Collab',
        durationLimit: '20 to 45 seconds',
        keyMessages: [
          'Showcase effortless streetwear styling for college and weekend hangouts.',
          'Emphasize the affordable drip available on Myntra Streetwear section.',
        ],
        dos: ['Use trending audio and punchy beat transitions', 'Show closeups of footwear and textures'],
        donts: ['Do not use copyright-blocked commercial audio that gets muted on Instagram'],
      },
      eligibility: 'Gen-Z fashion creators with 25K+ followers and strong youth engagement.',
      timeline: {
        registrationDeadline: '2026-08-23',
        productDispatch: '2026-08-24 to 2026-08-28',
        draftSubmissionDeadline: '2026-09-08',
        goLiveWindow: '2026-09-10 to 2026-09-22',
      },
    },
  },
  {
    id: 'camp_bc_003',
    brandId: 'brand_haulpack_001',
    portalType: 'brand-connect',
    name: 'Myntra Beauty & Glow Brand Activation',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Completed',
    isBarter: true,
    compensationType: 'Barter & Paid',
    barterKitName: 'Luxury Skincare & Festive Glam Cosmetic Hamper',
    approvalMode: 'Brand only',
    reviewSlaHours: 24,
    accountManager: {
      name: 'Aanya Singhania',
      email: 'aanya.s@haulpack.com',
      phone: '+91 98201 44820',
      role: 'Senior Brand Solutions Lead',
      avatarColor: '#655bef',
    },
    tags: ['Beauty', 'Cosmetics', 'Barter & Paid'],
    description: 'Curated beauty influencer partnership highlighting festival skincare rituals and luxury cosmetics.',
    brief: {
      deliverablesSummary: '1x Get Ready With Me (GRWM) Reel',
      deliverablesList: ['1x Detailed GRWM Reel featuring skincare routine & festival makeup glow'],
      productDetails: 'Luxury Vitamin C Serum, Peptide Crème, Velvet Matte Lip Kit.',
      guidelines: {
        requiredHashtags: ['#MyntraBeauty', '#FestiveGlow', '#FestiveMakeup', '#SkincareRoutine'],
        handlesToTag: ['@myntrabeauty', '@myntra'],
        disclosureLabel: '#Ad',
        durationLimit: '45 to 60 seconds',
        keyMessages: ['Focus on skin barrier prep and luminous festive finish.'],
        dos: ['Show texture swatch on hand or face', 'Film in natural clear lighting'],
        donts: ['Do not use heavy artificial filters that distort true skin texture'],
      },
      eligibility: 'Beauty, skincare, and MUA creators with 40K+ followers.',
      timeline: {
        registrationDeadline: '2026-08-03',
        productDispatch: '2026-08-04 to 2026-08-08',
        draftSubmissionDeadline: '2026-08-18',
        goLiveWindow: '2026-08-20 to 2026-08-30',
      },
    },
  },
  {
    id: 'camp_bc_004',
    brandId: 'brand_haulpack_001',
    portalType: 'brand-connect',
    name: 'Myntra Sneakerhead Fest Collaboration',
    startDate: '2026-10-05',
    endDate: '2026-10-25',
    status: 'Scheduled',
    isBarter: true,
    compensationType: 'Barter & Paid',
    barterKitName: 'Limited Edition Sneaker Drop & Street Merch',
    approvalMode: 'Either',
    reviewSlaHours: 48,
    accountManager: {
      name: 'Kabir Oberoi',
      email: 'kabir.o@haulpack.com',
      phone: '+91 97110 32190',
      role: 'Growth & Collabs Partner',
      avatarColor: '#10b981',
    },
    tags: ['Footwear', 'Sneakers', 'Launch', 'Barter & Paid'],
    description: 'Upcoming exclusive sneaker drop collaboration with premier sneaker influencers and streetwear curators.',
    brief: {
      deliverablesSummary: '1x Unboxing Reel + 1x On-Feet Styling Short',
      deliverablesList: [
        '1x Cinematic sneaker unboxing Reel',
        '1x On-feet wear test and outfit pairing',
      ],
      productDetails: 'Limited edition Nike Air Retro High and custom sneaker duffle.',
      guidelines: {
        requiredHashtags: ['#MyntraSneakerhead', '#SneakerDrop', '#KicksOnFeet', '#MyntraExclusive'],
        handlesToTag: ['@myntra'],
        disclosureLabel: '#Sponsored',
        durationLimit: '30 to 60 seconds',
        keyMessages: ['Highlight the exclusive drop timing on Myntra Sneaker Club.'],
        dos: ['Include macro close-ups of leather and stitching'],
        donts: ['Do not scuff footwear during outdoor shoot before unboxing is recorded'],
      },
      eligibility: 'Sneaker collectors, sneaker reviewers, and hype streetwear creators.',
      timeline: {
        registrationDeadline: '2026-09-18',
        productDispatch: '2026-09-24 to 2026-09-28',
        draftSubmissionDeadline: '2026-10-08',
        goLiveWindow: '2026-10-10 to 2026-10-22',
      },
    },
  },

  // ---------- Reward Program Campaigns ----------
  {
    id: 'camp_001',
    brandId: 'brand_haulpack_001',
    portalType: 'reward-program',
    name: 'Myntra Big Fashion Festival 2026',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: 'Active',
    tags: ['Fashion', 'Mega Sale', 'Apparel'],
    description: 'Premier creator reward program for Myntra Big Fashion Festival celebrating seasonal launches and viral trends.',
  },
  {
    id: 'camp_002',
    brandId: 'brand_haulpack_001',
    portalType: 'reward-program',
    name: 'Myntra End of Reason Sale (EORS)',
    startDate: '2026-08-15',
    endDate: '2026-09-30',
    status: 'Active',
    tags: ['Deals', 'Footwear', 'Accessories'],
    description: 'Milestone-based rewards campaign driving high-conversion creator hauls and catalog discovery for EORS.',
  },
  {
    id: 'camp_003',
    brandId: 'brand_haulpack_001',
    portalType: 'reward-program',
    name: 'Myntra Festive Glam & Ethnic Rewards',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Completed',
    tags: ['Festive', 'Ethnic Wear', 'Beauty'],
    description: 'Festive season influencer reward program showcasing ethnic fashion collections and festive makeup.',
  },
];

export function getCampaignById(id) {
  return campaigns.find(c => c.id === id) || null;
}

export function getCampaignsByBrand(brandId) {
  return campaigns.filter(c => c.brandId === brandId);
}

export function getCampaignsByPortal(portalType) {
  if (!portalType) return campaigns;
  return campaigns.filter(c => c.portalType === portalType);
}
