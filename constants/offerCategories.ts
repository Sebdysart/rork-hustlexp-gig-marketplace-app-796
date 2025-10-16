export interface OfferCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
  exampleTitles: string[];
  exampleScopes: {
    starter: string;
    standard: string;
    pro: string;
  };
}

export const OFFER_CATEGORIES: OfferCategory[] = [
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    subcategories: ['Install', 'Repair', 'Smart Home', 'Panel Work', 'Lighting'],
    exampleTitles: [
      'Licensed Electrician — Fast, Safe, Affordable',
      'Smart Home Electrical Setup',
      'Emergency Electrical Repairs',
    ],
    exampleScopes: {
      starter: 'Fix/replace up to 2 outlets or 2 light fixtures. Includes safety check.',
      standard: 'Room lighting upgrade (up to 6 fixtures) + dimmer installation. Includes cleanup.',
      pro: 'Panel work or smart home setup (consult + install up to 8 devices). Full warranty.',
    },
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    subcategories: ['Repair', 'Install', 'Emergency', 'Drain Cleaning', 'Water Heater'],
    exampleTitles: [
      'Licensed Plumber — Same Day Service',
      'Emergency Plumbing Repairs',
      'Water Heater Installation',
    ],
    exampleScopes: {
      starter: 'Fix leaky faucet or running toilet. Basic diagnostics included.',
      standard: 'Install new fixture (sink, toilet, or faucet) + supply line. Cleanup included.',
      pro: 'Water heater install or major pipe repair. Permit handling + warranty.',
    },
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: '❄️',
    subcategories: ['Repair', 'Install', 'Maintenance', 'Duct Cleaning', 'Emergency'],
    exampleTitles: [
      'HVAC Technician — Certified & Insured',
      'AC Repair & Maintenance',
      'Heating System Installation',
    ],
    exampleScopes: {
      starter: 'AC tune-up or filter replacement. Basic diagnostics.',
      standard: 'Full system inspection + minor repairs. Freon recharge if needed.',
      pro: 'New HVAC system install or major repair. Permit + warranty included.',
    },
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: '🪚',
    subcategories: ['Framing', 'Finish', 'Repair', 'Custom Build', 'Deck/Fence'],
    exampleTitles: [
      'Master Carpenter — Custom Builds',
      'Deck & Fence Construction',
      'Finish Carpentry & Trim',
    ],
    exampleScopes: {
      starter: 'Minor repair (door, trim, or shelf). Up to 2 hours.',
      standard: 'Custom shelving or small deck repair. Materials list provided.',
      pro: 'Full deck build or custom furniture. Design consult + materials sourcing.',
    },
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: '🎨',
    subcategories: ['Interior', 'Exterior', 'Cabinet', 'Deck Staining', 'Drywall'],
    exampleTitles: [
      'Professional Painter — Interior & Exterior',
      'Cabinet Refinishing Specialist',
      'Deck Staining & Sealing',
    ],
    exampleScopes: {
      starter: 'Paint one room (up to 12x12). Includes prep & cleanup.',
      standard: 'Paint 2-3 rooms or exterior trim. Premium paint included.',
      pro: 'Whole house interior or exterior. Color consult + warranty.',
    },
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: '🌳',
    subcategories: ['Lawn Care', 'Design', 'Hardscape', 'Tree Service', 'Irrigation'],
    exampleTitles: [
      'Landscaping Pro — Design & Install',
      'Lawn Care & Maintenance',
      'Hardscape & Patio Installation',
    ],
    exampleScopes: {
      starter: 'Lawn mow + edge + blow. Up to 1/4 acre.',
      standard: 'Full yard cleanup + mulch + trim. Up to 1/2 acre.',
      pro: 'Landscape design + install (plants, hardscape, irrigation). Consult included.',
    },
  },
  {
    id: 'roofing',
    name: 'Roofing',
    icon: '🏠',
    subcategories: ['Repair', 'Install', 'Inspection', 'Gutter', 'Emergency'],
    exampleTitles: [
      'Licensed Roofer — Repair & Install',
      'Emergency Roof Repair',
      'Gutter Installation & Cleaning',
    ],
    exampleScopes: {
      starter: 'Minor leak repair or shingle replacement. Up to 10 sq ft.',
      standard: 'Roof inspection + repair (up to 50 sq ft). Report included.',
      pro: 'Full roof replacement or major repair. Permit + warranty + insurance claim help.',
    },
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: '🧹',
    subcategories: ['Residential', 'Commercial', 'Deep Clean', 'Move Out', 'Post Construction'],
    exampleTitles: [
      'Professional Cleaning — Residential & Commercial',
      'Deep Cleaning Specialist',
      'Move Out Cleaning Service',
    ],
    exampleScopes: {
      starter: 'Basic clean (1-2 rooms). Vacuum, dust, wipe surfaces.',
      standard: 'Full house clean (up to 2000 sq ft). Kitchen + bathrooms included.',
      pro: 'Deep clean or post-construction. All rooms + windows + appliances.',
    },
  },
];

export const DEFAULT_TIER_TEMPLATES = {
  starter: {
    name: 'Starter',
    deliveryDays: 3,
    revisions: 0,
  },
  standard: {
    name: 'Standard',
    deliveryDays: 5,
    revisions: 1,
  },
  pro: {
    name: 'Pro',
    deliveryDays: 7,
    revisions: 3,
  },
};

export const COMMON_ADD_ONS = [
  { name: 'Rush Delivery (24h)', priceUsd: 50 },
  { name: 'Extra Room/Area', priceUsd: 75 },
  { name: 'Weekend Service', priceUsd: 100 },
  { name: 'Emergency Call-Out', priceUsd: 150 },
  { name: 'Extended Warranty', priceUsd: 50 },
  { name: 'Premium Materials', priceUsd: 100 },
];
