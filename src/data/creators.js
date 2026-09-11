/* ============================================
   Mock Creator Data — 60 creators
   ============================================ */

const AVATARS = [
  '#655bef', '#10b981', '#f59e0b', '#ec4899', '#3b82f6',
  '#8b5cf6', '#06b6d4', '#f97316', '#ef4444', '#14b8a6',
];

function avatar(idx) { return AVATARS[idx % AVATARS.length]; }

export const creators = [
  { id: 'cr_001', name: 'Aditi Sharma', socialHandle: '@aditisharma', platform: 'Instagram', followerCount: 125000, avatarColor: avatar(0) },
  { id: 'cr_002', name: 'Rahul Verma', socialHandle: '@rahulverma_yt', platform: 'YouTube', followerCount: 82000, avatarColor: avatar(1) },
  { id: 'cr_003', name: 'Priya Patel', socialHandle: '@priyapatel', platform: 'Instagram', followerCount: 310000, avatarColor: avatar(2) },
  { id: 'cr_004', name: 'Arjun Nair', socialHandle: '@arjunnair', platform: 'YouTube', followerCount: 195000, avatarColor: avatar(3) },
  { id: 'cr_005', name: 'Sneha Reddy', socialHandle: '@snehareddy_', platform: 'Instagram', followerCount: 67000, avatarColor: avatar(4) },
  { id: 'cr_006', name: 'Vikram Singh', socialHandle: '@vikramsingh', platform: 'YouTube', followerCount: 420000, avatarColor: avatar(5) },
  { id: 'cr_007', name: 'Meera Joshi', socialHandle: '@meerajoshi', platform: 'Instagram', followerCount: 54000, avatarColor: avatar(6) },
  { id: 'cr_008', name: 'Karan Mehta', socialHandle: '@karanmehta_', platform: 'Instagram', followerCount: 145000, avatarColor: avatar(7) },
  { id: 'cr_009', name: 'Ananya Gupta', socialHandle: '@ananyagupta', platform: 'YouTube', followerCount: 230000, avatarColor: avatar(8) },
  { id: 'cr_010', name: 'Rohan Das', socialHandle: '@rohandas', platform: 'Instagram', followerCount: 38000, avatarColor: avatar(9) },
  { id: 'cr_011', name: 'Kavya Iyer', socialHandle: '@kavyaiyer', platform: 'Instagram', followerCount: 92000, avatarColor: avatar(0) },
  { id: 'cr_012', name: 'Aakash Kumar', socialHandle: '@aakashkumar_yt', platform: 'YouTube', followerCount: 175000, avatarColor: avatar(1) },
  { id: 'cr_013', name: 'Divya Menon', socialHandle: '@divyamenon', platform: 'Instagram', followerCount: 115000, avatarColor: avatar(2) },
  { id: 'cr_014', name: 'Siddharth Rao', socialHandle: '@sidrao', platform: 'YouTube', followerCount: 58000, avatarColor: avatar(3) },
  { id: 'cr_015', name: 'Nisha Agarwal', socialHandle: '@nishaagarwal', platform: 'Instagram', followerCount: 205000, avatarColor: avatar(4) },
  { id: 'cr_016', name: 'Amit Tiwari', socialHandle: '@amittiwari', platform: 'YouTube', followerCount: 340000, avatarColor: avatar(5) },
  { id: 'cr_017', name: 'Ritu Saxena', socialHandle: '@ritusaxena_', platform: 'Instagram', followerCount: 78000, avatarColor: avatar(6) },
  { id: 'cr_018', name: 'Manish Jha', socialHandle: '@manishjha', platform: 'Instagram', followerCount: 46000, avatarColor: avatar(7) },
  { id: 'cr_019', name: 'Pooja Deshmukh', socialHandle: '@poojadeshmukh', platform: 'YouTube', followerCount: 160000, avatarColor: avatar(8) },
  { id: 'cr_020', name: 'Varun Kapoor', socialHandle: '@varunkapoor', platform: 'Instagram', followerCount: 285000, avatarColor: avatar(9) },
  { id: 'cr_021', name: 'Swati Pandey', socialHandle: '@swatipandey', platform: 'Instagram', followerCount: 98000, avatarColor: avatar(0) },
  { id: 'cr_022', name: 'Nikhil Bhatt', socialHandle: '@nikhilbhatt', platform: 'YouTube', followerCount: 135000, avatarColor: avatar(1) },
  { id: 'cr_023', name: 'Tanvi Shah', socialHandle: '@tanvishah_', platform: 'Instagram', followerCount: 72000, avatarColor: avatar(2) },
  { id: 'cr_024', name: 'Rajesh Mishra', socialHandle: '@rajeshmishra', platform: 'YouTube', followerCount: 410000, avatarColor: avatar(3) },
  { id: 'cr_025', name: 'Anjali Choudhary', socialHandle: '@anjalichoudhary', platform: 'Instagram', followerCount: 51000, avatarColor: avatar(4) },
  { id: 'cr_026', name: 'Deepak Soni', socialHandle: '@deepaksoni_yt', platform: 'YouTube', followerCount: 260000, avatarColor: avatar(5) },
  { id: 'cr_027', name: 'Shruti Nair', socialHandle: '@shrutinair', platform: 'Instagram', followerCount: 88000, avatarColor: avatar(6) },
  { id: 'cr_028', name: 'Harsh Vardhan', socialHandle: '@harshvardhan', platform: 'Instagram', followerCount: 145000, avatarColor: avatar(7) },
  { id: 'cr_029', name: 'Neha Kulkarni', socialHandle: '@nehakulkarni', platform: 'YouTube', followerCount: 190000, avatarColor: avatar(8) },
  { id: 'cr_030', name: 'Suresh Babu', socialHandle: '@sureshbabu_', platform: 'Instagram', followerCount: 32000, avatarColor: avatar(9) },
  { id: 'cr_031', name: 'Pallavi Dubey', socialHandle: '@pallavidubey', platform: 'Instagram', followerCount: 110000, avatarColor: avatar(0) },
  { id: 'cr_032', name: 'Gaurav Thakur', socialHandle: '@gauravthakur', platform: 'YouTube', followerCount: 295000, avatarColor: avatar(1) },
  { id: 'cr_033', name: 'Ishita Bansal', socialHandle: '@ishitabansal', platform: 'Instagram', followerCount: 65000, avatarColor: avatar(2) },
  { id: 'cr_034', name: 'Naveen Prasad', socialHandle: '@naveenprasad', platform: 'YouTube', followerCount: 180000, avatarColor: avatar(3) },
  { id: 'cr_035', name: 'Sonali Ghosh', socialHandle: '@sonalighosh_', platform: 'Instagram', followerCount: 140000, avatarColor: avatar(4) },
  { id: 'cr_036', name: 'Akshay Mohan', socialHandle: '@akshaymohan', platform: 'YouTube', followerCount: 325000, avatarColor: avatar(5) },
  { id: 'cr_037', name: 'Bhavna Sethi', socialHandle: '@bhavnasethi', platform: 'Instagram', followerCount: 42000, avatarColor: avatar(6) },
  { id: 'cr_038', name: 'Tushar Rathore', socialHandle: '@tusharrathore', platform: 'Instagram', followerCount: 96000, avatarColor: avatar(7) },
  { id: 'cr_039', name: 'Rachna Pillai', socialHandle: '@rachnapillai', platform: 'YouTube', followerCount: 215000, avatarColor: avatar(8) },
  { id: 'cr_040', name: 'Yashwant Yadav', socialHandle: '@yashwantyadav', platform: 'Instagram', followerCount: 28000, avatarColor: avatar(9) },
  { id: 'cr_041', name: 'Kritika Malhotra', socialHandle: '@kritikamalhotra', platform: 'Instagram', followerCount: 170000, avatarColor: avatar(0) },
  { id: 'cr_042', name: 'Pranav Bose', socialHandle: '@pranavbose', platform: 'YouTube', followerCount: 105000, avatarColor: avatar(1) },
  { id: 'cr_043', name: 'Shalini Jain', socialHandle: '@shalinijain_', platform: 'Instagram', followerCount: 83000, avatarColor: avatar(2) },
  { id: 'cr_044', name: 'Mohit Chandra', socialHandle: '@mohitchandra', platform: 'YouTube', followerCount: 355000, avatarColor: avatar(3) },
  { id: 'cr_045', name: 'Deepika Roy', socialHandle: '@deeparoy', platform: 'Instagram', followerCount: 120000, avatarColor: avatar(4) },
  { id: 'cr_046', name: 'Arun Mathur', socialHandle: '@arunmathur', platform: 'YouTube', followerCount: 248000, avatarColor: avatar(5) },
  { id: 'cr_047', name: 'Megha Srivastava', socialHandle: '@meghasri', platform: 'Instagram', followerCount: 59000, avatarColor: avatar(6) },
  { id: 'cr_048', name: 'Nitin Rajput', socialHandle: '@nitinrajput_', platform: 'Instagram', followerCount: 155000, avatarColor: avatar(7) },
  { id: 'cr_049', name: 'Simran Kaur', socialHandle: '@simrankaur', platform: 'YouTube', followerCount: 275000, avatarColor: avatar(8) },
  { id: 'cr_050', name: 'Pankaj Dubey', socialHandle: '@pankajdubey', platform: 'Instagram', followerCount: 36000, avatarColor: avatar(9) },
  { id: 'cr_051', name: 'Jyoti Bhandari', socialHandle: '@jyotibhandari', platform: 'Instagram', followerCount: 101000, avatarColor: avatar(0) },
  { id: 'cr_052', name: 'Saurabh Garg', socialHandle: '@saurabhgarg_yt', platform: 'YouTube', followerCount: 185000, avatarColor: avatar(1) },
  { id: 'cr_053', name: 'Aparna Nambiar', socialHandle: '@aparnanambiar', platform: 'Instagram', followerCount: 74000, avatarColor: avatar(2) },
  { id: 'cr_054', name: 'Vivek Chauhan', socialHandle: '@vivekchauhan', platform: 'YouTube', followerCount: 390000, avatarColor: avatar(3) },
  { id: 'cr_055', name: 'Tanya Oberoi', socialHandle: '@tanyaoberoi', platform: 'Instagram', followerCount: 132000, avatarColor: avatar(4) },
  { id: 'cr_056', name: 'Hemant Kushwaha', socialHandle: '@hemantkushwaha', platform: 'YouTube', followerCount: 220000, avatarColor: avatar(5) },
  { id: 'cr_057', name: 'Nikita Vohra', socialHandle: '@nikitavorha', platform: 'Instagram', followerCount: 48000, avatarColor: avatar(6) },
  { id: 'cr_058', name: 'Aman Tripathi', socialHandle: '@amantripathi_', platform: 'Instagram', followerCount: 164000, avatarColor: avatar(7) },
  { id: 'cr_059', name: 'Sakshi Rawat', socialHandle: '@sakshirawat', platform: 'YouTube', followerCount: 305000, avatarColor: avatar(8) },
  { id: 'cr_060', name: 'Dhruv Malhotra', socialHandle: '@dhruvmalhotra', platform: 'Instagram', followerCount: 22000, avatarColor: avatar(9) },
];

export function getCreatorById(id) {
  return creators.find(c => c.id === id) || null;
}

/* ============================================
   Campaign–Creator Relationships
   ============================================ */

// Distribute creators across campaigns
// Camp 1 (Myntra): 40 creators, Camp 2 (Flipkart): 35 creators, Camp 3 (Amazon): 30 creators
// Some creators appear in multiple campaigns

function generateCampaignCreators() {
  const relationships = [];

  // Campaign 1 — Myntra Big Fashion Festival 2026 (creators 0–44)
  creators.slice(0, 45).forEach((cr, i) => {
    relationships.push({
      campaignId: 'camp_001',
      creatorId: cr.id,
      status: i < 35 ? 'Active' : 'Completed',
      joinedAt: `2026-09-0${Math.min(1 + (i % 5), 5)}`,
    });
  });

  // Campaign 2 — Myntra End of Reason Sale (EORS) (creators 0–37 and 40–49)
  [...creators.slice(0, 38), ...creators.slice(40, 50)].forEach((cr, i) => {
    relationships.push({
      campaignId: 'camp_002',
      creatorId: cr.id,
      status: i < 30 ? 'Active' : 'Completed',
      joinedAt: `2026-08-${15 + (i % 10)}`,
    });
  });

  // Campaign 3 — Myntra Festive Glam & Ethnic Rewards (creators 0–34 and 45–56)
  [...creators.slice(0, 35), ...creators.slice(45, 57)].forEach((cr, i) => {
    relationships.push({
      campaignId: 'camp_003',
      creatorId: cr.id,
      status: 'Completed',
      joinedAt: `2026-08-0${1 + (i % 7)}`,
    });
  });

  // ---------- Brand Connect Campaigns ----------
  const CITIES = ['Mumbai, MH', 'Bengaluru, KA', 'Delhi NCR', 'Pune, MH', 'Hyderabad, TS', 'Kolkata, WB', 'Jaipur, RJ', 'Ahmedabad, GJ', 'Chandigarh'];
  const COURIERS = ['BlueDart', 'Delhivery', 'DTDC', 'Shadowfax'];

  // Brand Connect 1 — Myntra Autumn/Winter Runway Collab (creators 0–24: 25 creators)
  creators.slice(0, 25).forEach((cr, i) => {
    let deliveryStatus = 'Delivered';
    let productReceived = true;
    let deliveredAt = `2026-09-0${4 + (i % 3)}`;
    let estimatedDelivery = deliveredAt;
    let dispatchedAt = `2026-09-0${Math.min(1 + (i % 2), 2)}`;

    if (i >= 18 && i <= 21) {
      deliveryStatus = 'In Transit';
      productReceived = false;
      deliveredAt = null;
      estimatedDelivery = '2026-09-12';
    } else if (i >= 22 && i <= 23) {
      deliveryStatus = 'Dispatched';
      productReceived = false;
      deliveredAt = null;
      estimatedDelivery = '2026-09-14';
    } else if (i === 24) {
      deliveryStatus = 'Processing';
      productReceived = false;
      deliveredAt = null;
      estimatedDelivery = '2026-09-16';
    }

    const courier = COURIERS[i % COURIERS.length];
    const prefix = courier === 'BlueDart' ? 'BD' : courier === 'Delhivery' ? 'DL' : courier === 'DTDC' ? 'DT' : 'SF';
    const trackingNumber = `${prefix}-${8921000 + i * 137}`;

    let campaignProgressStatus = 'Live';
    if (!productReceived) {
      campaignProgressStatus = 'Getting product';
    } else if (i === 0 || i === 4) {
      campaignProgressStatus = 'Content in review';
    } else if (i === 1 || i === 14) {
      campaignProgressStatus = 'Creating content';
    } else if (i === 3 || i === 7) {
      campaignProgressStatus = 'Changes requested';
    } else if (i === 2 || i === 8) {
      campaignProgressStatus = 'Posting';
    } else if (i >= 9 && i <= 15) {
      campaignProgressStatus = 'Live';
    } else {
      campaignProgressStatus = 'Completed';
    }

    const categories = ['Fashion & Styling', 'Luxury & Runway', 'High-Street Wear', 'Designer Edit'];
    const languages = ['English & Hindi', 'Hindi', 'English'];

    relationships.push({
      campaignId: 'camp_bc_001',
      creatorId: cr.id,
      status: i < 20 ? 'Active' : 'Completed',
      campaignProgressStatus, // PRD 8.6 CT-02
      category: categories[i % categories.length],
      language: languages[i % languages.length],
      joinedAt: `2026-09-0${Math.min(1 + (i % 4), 4)}`,
      registeredAt: `2026-09-0${Math.min(1 + (i % 3), 3)}`,
      deliveryStatus,
      productReceived,
      courierPartner: courier,
      trackingNumber,
      dispatchedAt,
      deliveredAt,
      estimatedDelivery,
      shippingCity: CITIES[i % CITIES.length],
      assignedProducts: [
        { name: 'Myntra A/W Woolen Trench Coat', variant: 'Camel / Size M', sku: 'MYN-AW-701', value: 4499 },
        { name: 'Structured Leather Shoulder Bag', variant: 'Tan', sku: 'MYN-AW-804', value: 2299 },
      ],
      totalBarterValue: 6798,
      proofOfDelivery: productReceived ? 'Signed by Creator & Verified via OTP' : null,
    });
  });

  // Brand Connect 2 — Myntra Gen-Z Streetwear Spotlight (creators 15–39: 25 creators)
  creators.slice(15, 40).forEach((cr, i) => {
    let deliveryStatus = 'Delivered';
    let productReceived = true;
    let deliveredAt = `2026-08-${24 + (i % 4)}`;
    let estimatedDelivery = deliveredAt;
    let dispatchedAt = `2026-08-${21 + (i % 2)}`;

    if (i >= 16 && i <= 20) {
      deliveryStatus = 'In Transit';
      productReceived = false;
      deliveredAt = null;
      estimatedDelivery = '2026-09-12';
    } else if (i >= 21 && i <= 23) {
      deliveryStatus = 'Dispatched';
      productReceived = false;
      deliveredAt = null;
      estimatedDelivery = '2026-09-13';
    } else if (i === 24) {
      deliveryStatus = 'Processing';
      productReceived = false;
      deliveredAt = null;
      estimatedDelivery = '2026-09-15';
    }

    const courier = COURIERS[(i + 1) % COURIERS.length];
    const prefix = courier === 'BlueDart' ? 'BD' : courier === 'Delhivery' ? 'DL' : courier === 'DTDC' ? 'DT' : 'SF';
    const trackingNumber = `${prefix}-${4492000 + i * 219}`;

    relationships.push({
      campaignId: 'camp_bc_002',
      creatorId: cr.id,
      status: i < 18 ? 'Active' : 'Completed',
      joinedAt: `2026-08-${20 + (i % 5)}`,
      registeredAt: `2026-08-${20 + (i % 3)}`,
      deliveryStatus,
      productReceived,
      courierPartner: courier,
      trackingNumber,
      dispatchedAt,
      deliveredAt,
      estimatedDelivery,
      shippingCity: CITIES[(i + 2) % CITIES.length],
      assignedProducts: [
        { name: 'Oversized Street Graphic Hoodie', variant: 'Acid Wash Grey / L', sku: 'ST-GENZ-101', value: 2799 },
        { name: 'Chunky Retro Skate Sneakers', variant: 'White & Emerald / UK 8', sku: 'SNK-GZ-204', value: 3999 },
      ],
      totalBarterValue: 6798,
      proofOfDelivery: productReceived ? 'Delivered to Creator Address' : null,
    });
  });

  // Brand Connect 3 — Myntra Beauty & Glow Brand Activation (creators 25–48: 24 creators, Completed)
  creators.slice(25, 49).forEach((cr, i) => {
    const courier = COURIERS[(i + 2) % COURIERS.length];
    const prefix = courier === 'BlueDart' ? 'BD' : courier === 'Delhivery' ? 'DL' : courier === 'DTDC' ? 'DT' : 'SF';
    const trackingNumber = `${prefix}-${3310000 + i * 181}`;

    relationships.push({
      campaignId: 'camp_bc_003',
      creatorId: cr.id,
      status: 'Completed',
      joinedAt: `2026-08-0${1 + (i % 6)}`,
      registeredAt: `2026-08-01`,
      deliveryStatus: 'Delivered',
      productReceived: true,
      courierPartner: courier,
      trackingNumber,
      dispatchedAt: `2026-08-03`,
      deliveredAt: `2026-08-0${6 + (i % 3)}`,
      estimatedDelivery: `2026-08-0${6 + (i % 3)}`,
      shippingCity: CITIES[(i + 4) % CITIES.length],
      assignedProducts: [
        { name: 'Glow Boosting Vitamin C Serum 50ml', variant: 'Full Size', sku: 'GLW-SR-01', value: 1850 },
        { name: 'Midnight Peptide Rejuvenation Crème', variant: '50g Jar', sku: 'GLW-CR-02', value: 2400 },
        { name: 'Luxury Velvet Matte Lip Duo', variant: 'Rosewood & Berry', sku: 'GLW-LP-03', value: 1650 },
      ],
      totalBarterValue: 5900,
      proofOfDelivery: 'Delivered and Signed by Creator',
    });
  });

  // Brand Connect 4 — Myntra Sneakerhead Fest Collaboration (creators 5–22: 18 creators, Scheduled)
  creators.slice(5, 23).forEach((cr, i) => {
    const deliveryStatus = i < 6 ? 'Dispatched' : 'Processing';
    const courier = COURIERS[(i + 3) % COURIERS.length];
    const prefix = courier === 'BlueDart' ? 'BD' : courier === 'Delhivery' ? 'DL' : courier === 'DTDC' ? 'DT' : 'SF';
    const trackingNumber = `${prefix}-${9940000 + i * 117}`;

    relationships.push({
      campaignId: 'camp_bc_004',
      creatorId: cr.id,
      status: 'Scheduled',
      joinedAt: '2026-09-08',
      registeredAt: '2026-09-08',
      deliveryStatus,
      productReceived: false,
      courierPartner: courier,
      trackingNumber,
      dispatchedAt: i < 6 ? '2026-09-10' : null,
      deliveredAt: null,
      estimatedDelivery: i < 6 ? '2026-09-14' : '2026-09-18',
      shippingCity: CITIES[(i + 1) % CITIES.length],
      assignedProducts: [
        { name: "Nike Air Retro High '85 Edition", variant: 'Chicago Red / UK 9', sku: 'SNK-NK-85', value: 11999 },
        { name: 'Haulpack x Myntra Custom Sneaker Duffle', variant: 'Matte Black', sku: 'ACC-DF-01', value: 3499 },
      ],
      totalBarterValue: 15498,
      proofOfDelivery: null,
    });
  });

  return relationships;
}

export const campaignCreators = generateCampaignCreators();

export function getCreatorsForCampaign(campaignId) {
  const rels = campaignCreators.filter(cc => cc.campaignId === campaignId);
  return rels.map(rel => {
    const creator = getCreatorById(rel.creatorId);
    return { ...creator, ...rel };
  }).filter(Boolean);
}

export function getCampaignCreatorRelation(campaignId, creatorId) {
  return campaignCreators.find(cc => cc.campaignId === campaignId && cc.creatorId === creatorId) || null;
}

export function getBarterFulfillmentForCampaign(campaignId) {
  const registered = getCreatorsForCampaign(campaignId);
  const delivered = registered.filter(c => c.productReceived || c.deliveryStatus === 'Delivered');
  const inTransit = registered.filter(c => c.deliveryStatus === 'In Transit');
  const dispatched = registered.filter(c => c.deliveryStatus === 'Dispatched');
  const processing = registered.filter(c => c.deliveryStatus === 'Processing');
  const yetToReceive = registered.filter(c => !c.productReceived && c.deliveryStatus !== 'Delivered');

  return {
    campaignId,
    totalRegistered: registered.length,
    deliveredCount: delivered.length,
    yetToReceiveCount: yetToReceive.length,
    inTransitCount: inTransit.length,
    dispatchedCount: dispatched.length,
    processingCount: processing.length,
    fulfillmentRate: registered.length > 0 ? Math.round((delivered.length / registered.length) * 100) : 0,
    creators: registered,
    deliveredCreators: delivered,
    yetToReceiveCreators: yetToReceive,
  };
}

import { getCampaignsByPortal } from './campaigns.js';

export function getCampaignsForCreator(creatorId, portal = null) {
  let rels = campaignCreators.filter(cc => cc.creatorId === creatorId);
  if (portal) {
    const portalCampIds = new Set(getCampaignsByPortal(portal).map(c => c.id));
    rels = rels.filter(r => portalCampIds.has(r.campaignId));
  }
  return rels;
}
