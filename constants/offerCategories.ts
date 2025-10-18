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
    id: 'delivery',
    name: 'Delivery',
    icon: '📦',
    subcategories: ['Package', 'Food', 'Groceries', 'Documents', 'Same-Day'],
    exampleTitles: [
      'Fast Package Delivery',
      'Food & Grocery Delivery',
      'Same-Day Document Courier',
    ],
    exampleScopes: {
      starter: 'Local delivery (up to 5 miles). Basic pickup & dropoff.',
      standard: 'Multi-stop delivery (up to 15 miles). Real-time tracking.',
      pro: 'Priority delivery with photo proof & signature. Insurance available.',
    },
  },
  {
    id: 'errands',
    name: 'Errands',
    icon: '🏃',
    subcategories: ['Shopping', 'Pickup', 'Returns', 'Waiting', 'Assistant'],
    exampleTitles: [
      'Personal Errand Runner',
      'Shopping & Pickup Service',
      'Wait in Line / Queue Service',
    ],
    exampleScopes: {
      starter: 'Single errand (pickup, dropoff, or return). Up to 1 hour.',
      standard: 'Multiple errands or shopping trip. Up to 3 hours.',
      pro: 'Full-day assistant service. Multiple locations + complex tasks.',
    },
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: '📸',
    subcategories: ['Product', 'Event', 'Real Estate', 'Portrait', 'Food'],
    exampleTitles: [
      'Product Photography for E-commerce',
      'Event & Party Photography',
      'Real Estate Photos & Virtual Tours',
    ],
    exampleScopes: {
      starter: 'Basic photo shoot (up to 20 photos). Quick editing included.',
      standard: 'Full session (up to 50 photos). Professional editing & delivery.',
      pro: 'Premium shoot + advanced editing + video. Same-day delivery.',
    },
  },
  {
    id: 'data_entry',
    name: 'Data Entry',
    icon: '⌨️',
    subcategories: ['Typing', 'Spreadsheets', 'Research', 'CRM', 'Database'],
    exampleTitles: [
      'Fast & Accurate Data Entry',
      'Excel & Spreadsheet Work',
      'Web Research & Data Mining',
    ],
    exampleScopes: {
      starter: 'Simple data entry (up to 100 records). Basic formatting.',
      standard: 'Complex data entry (up to 500 records). Quality check included.',
      pro: 'Large-scale data project (1000+ records). Database setup + automation.',
    },
  },
  {
    id: 'virtual_assistant',
    name: 'Virtual Assistant',
    icon: '💼',
    subcategories: ['Email', 'Scheduling', 'Research', 'Admin', 'Customer Service'],
    exampleTitles: [
      'Professional Virtual Assistant',
      'Email & Calendar Management',
      'Customer Service Support',
    ],
    exampleScopes: {
      starter: 'Basic admin tasks (up to 2 hours). Email sorting & scheduling.',
      standard: 'Daily VA support (up to 5 hours). Multi-task handling.',
      pro: 'Full-time VA (20+ hours/week). Project management + reports.',
    },
  },
  {
    id: 'moving',
    name: 'Moving',
    icon: '📦',
    subcategories: ['Labor', 'Packing', 'Furniture', 'Junk Removal', 'Storage'],
    exampleTitles: [
      'Moving Labor & Furniture Help',
      'Packing & Unpacking Service',
      'Junk Removal & Hauling',
    ],
    exampleScopes: {
      starter: 'Light moving (1-2 items). Up to 2 hours.',
      standard: 'Full room move or furniture assembly. Up to 4 hours.',
      pro: 'Complete moving service. Packing + loading + transport.',
    },
  },
  {
    id: 'pet_care',
    name: 'Pet Care',
    icon: '🐕',
    subcategories: ['Walking', 'Sitting', 'Grooming', 'Training', 'Feeding'],
    exampleTitles: [
      'Dog Walking & Pet Sitting',
      'Pet Grooming Service',
      'In-Home Pet Care',
    ],
    exampleScopes: {
      starter: 'Single walk or visit (30 min). Basic care.',
      standard: 'Daily walks or pet sitting (multiple visits). Photo updates.',
      pro: 'Extended pet care (overnight or multi-day). Full attention.',
    },
  },
  {
    id: 'tutoring',
    name: 'Tutoring',
    icon: '📚',
    subcategories: ['Math', 'Science', 'Language', 'Test Prep', 'Music'],
    exampleTitles: [
      'Math & Science Tutoring',
      'Language Learning Coach',
      'Test Prep Specialist (SAT/ACT)',
    ],
    exampleScopes: {
      starter: 'Single session (1 hour). Homework help & review.',
      standard: 'Weekly sessions (4 hours/month). Custom lesson plans.',
      pro: 'Intensive tutoring (8+ hours/month). Progress tracking + materials.',
    },
  },
  {
    id: 'content_creation',
    name: 'Content',
    icon: '✍️',
    subcategories: ['Writing', 'Social Media', 'Video', 'Graphics', 'Blog'],
    exampleTitles: [
      'Social Media Content Creator',
      'Blog Writing & SEO',
      'Video Editing & Production',
    ],
    exampleScopes: {
      starter: 'Single post or article (up to 500 words). Basic graphics.',
      standard: 'Weekly content package (3-5 posts). Professional quality.',
      pro: 'Full content strategy (10+ pieces). Video + graphics + copywriting.',
    },
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: '🔨',
    subcategories: ['Repair', 'Assembly', 'Install', 'Maintenance', 'Odd Jobs'],
    exampleTitles: [
      'General Handyman Service',
      'Furniture Assembly',
      'Home Repairs & Maintenance',
    ],
    exampleScopes: {
      starter: 'Quick fix or assembly (up to 1 hour). Basic tools.',
      standard: 'Multiple repairs or installs (up to 3 hours).',
      pro: 'Full-day handyman service. Complex projects + materials.',
    },
  },
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
