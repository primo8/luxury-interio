import type { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'FUR-LIV-001',
    name: 'Sapphire Velvet Accent Chair',
    subtitle: 'Sculptural luxury barrel armchair with tapered solid wood legs',
    category: 'Armchairs & Seating',
    room: 'living',
    price: 299,
    originalPrice: 349,
    discountPercent: 14,
    rating: 5,
    reviewsCount: 142,
    image: '/hero-chair.jpg',
    galleryImages: [
      '/hero-chair.jpg',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Impeccably tailored in rich royal velvet, this accent chair provides high-density foam cushioning with a timeless silhouette and gold-finished steel base.',
    longDescription: 'Crafted with premium Italian-imported velvet fabric, high-resilience foam core, and solid kiln-dried hardwood interior framing. Its ergonomic contour supports ideal posture while delivering an editorial centerpiece for modern living rooms or private lounges.',
    dimensions: { width: '32 in (81 cm)', depth: '31 in (79 cm)', height: '34 in (86 cm)', unit: 'imperial' },
    materials: ['Royal Velvet Upholstery', 'Kiln-Dried Hardwood Frame', 'Brushed Brass Steel Legs', 'High-Density Memory Foam'],
    colors: [
      { name: 'Royal Plum', hex: '#4A1E6D', threeColor: 0x4a1e6d },
      { name: 'Emerald Velvet', hex: '#1B4332', threeColor: 0x1b4332 },
      { name: 'Warm Cream', hex: '#EAE4D9', threeColor: 0xeae4d9 },
      { name: 'Charcoal Obsidian', hex: '#212529', threeColor: 0x212529 }
    ],
    inStock: true,
    stockCount: 14,
    isBestSeller: true,
    threeModelType: 'chair'
  },
  {
    id: 'prod-2',
    sku: 'FUR-LIV-002',
    name: 'Modern Coffee Table',
    subtitle: 'Dual-tiered dark walnut table with matte black steel frame',
    category: 'Tables & Consoles',
    room: 'living',
    price: 199,
    originalPrice: 229,
    discountPercent: 13,
    rating: 5,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A striking oval coffee table featuring genuine walnut veneer and an integrated lower magazine shelf supported by a low-profile architectural frame.',
    longDescription: 'Designed with minimalist proportion in mind. The heat and scratch-resistant lacquer coating ensures long-lasting durability against coffee rings and daily use.',
    dimensions: { width: '48 in (122 cm)', depth: '24 in (61 cm)', height: '18 in (46 cm)', unit: 'imperial' },
    materials: ['FSC-Certified American Walnut', 'Powder-Coated Carbon Steel', 'Anti-Scratch Satin Finish'],
    colors: [
      { name: 'Smoked Walnut', hex: '#3E2723', threeColor: 0x3e2723 },
      { name: 'Natural White Oak', hex: '#D7C4A5', threeColor: 0xd7c4a5 },
      { name: 'Ebony Black', hex: '#1C1917', threeColor: 0x1c1917 }
    ],
    inStock: true,
    stockCount: 22,
    threeModelType: 'table'
  },
  {
    id: 'prod-3',
    sku: 'FUR-BED-003',
    name: 'Upholstered Bed Frame',
    subtitle: 'Platform bed with padded vertical channel tufting',
    category: 'Beds & Headboards',
    room: 'bedroom',
    price: 699,
    originalPrice: 799,
    discountPercent: 12,
    rating: 5,
    reviewsCount: 215,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Solid engineered slat support system eliminates the need for a box spring while the deep padded headboard provides plush support for reading in bed.',
    longDescription: 'Featuring acoustic-dampened slat rails that ensure noiseless rest. Available in heavy linen blend and velvet finishes with tapered wooden corner posts.',
    dimensions: { width: '66 in (168 cm)', depth: '86 in (218 cm)', height: '48 in (122 cm)', unit: 'imperial' },
    materials: ['Heavy Belgian Linen Blend', 'Reinforced Solid Pine Slats', 'Cold-Rolled Steel Center Beam'],
    colors: [
      { name: 'Heather Charcoal', hex: '#374151', threeColor: 0x374151 },
      { name: 'Oatmeal Beige', hex: '#E5DCC5', threeColor: 0xe5dcc5 },
      { name: 'Imperial Violet', hex: '#3B184F', threeColor: 0x3b184f }
    ],
    inStock: true,
    stockCount: 8,
    isNew: true,
    threeModelType: 'bed'
  },
  {
    id: 'prod-4',
    sku: 'FUR-STO-004',
    name: 'Wooden Sideboard',
    subtitle: 'Mid-century modern credenza with fluted tambour doors',
    category: 'Credenzas & Buffets',
    room: 'storage',
    price: 399,
    originalPrice: 499,
    discountPercent: 20,
    badge: '-20%',
    rating: 5,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A spacious multi-compartment storage console featuring softly sliding tambour doors, adjustable shelving, and integrated cable routing for media devices.',
    longDescription: 'Hand-assembled by master cabinetmakers with subtle brass door hardware and durable soft-close hinges.',
    dimensions: { width: '60 in (152 cm)', depth: '18 in (46 cm)', height: '30 in (76 cm)', unit: 'imperial' },
    materials: ['Solid European Ash & Walnut Veneer', 'Brushed Brass Knobs', 'Soft-Close Concealed Hinges'],
    colors: [
      { name: 'Natural Ash', hex: '#CDB194', threeColor: 0xcdb194 },
      { name: 'Dark Oak', hex: '#4A3728', threeColor: 0x4a3728 }
    ],
    inStock: true,
    stockCount: 11,
    threeModelType: 'sideboard'
  },
  {
    id: 'prod-5',
    sku: 'FUR-OFF-005',
    name: 'Ergonomic Office Chair',
    subtitle: 'Dynamic lumbar-adaptive task chair with 4D armrests',
    category: 'Executive & Task Seating',
    room: 'office',
    price: 249,
    originalPrice: 289,
    discountPercent: 14,
    rating: 5,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Engineered for 12+ hours of continuous comfort with breathable elastomeric mesh, multi-angle tilt lock, and pneumatic seat height adjustment.',
    longDescription: 'BIFMA certified for commercial and home executive use. Smooth rollerblade casters glide safely over hardwood and rugs alike without scratching.',
    dimensions: { width: '26 in (66 cm)', depth: '26 in (66 cm)', height: '42-46 in (107-117 cm)', unit: 'imperial' },
    materials: ['Elastomeric Breathable Mesh', 'Die-Cast Aluminum Base', 'Polyurethane Silent Casters'],
    colors: [
      { name: 'Executive Slate', hex: '#4B5563', threeColor: 0x4b5563 },
      { name: 'Midnight Jet', hex: '#111827', threeColor: 0x111827 },
      { name: 'Alabaster Silver', hex: '#9CA3AF', threeColor: 0x9ca3af }
    ],
    inStock: true,
    stockCount: 35,
    threeModelType: 'chair'
  },
  {
    id: 'prod-6',
    sku: 'FUR-OFF-006',
    name: 'Writing Desk',
    subtitle: 'Solid oak workstation with concealed drawer & brass details',
    category: 'Workstations & Desks',
    room: 'office',
    price: 254,
    originalPrice: 299,
    discountPercent: 15,
    badge: '-15%',
    rating: 5,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Clean Scandinavian lines with an integrated felt-lined drawer for laptop storage and subtle magnetic cord organization.',
    longDescription: 'Made of sustainably harvested American White Oak with solid joinery and angled legs that provide maximum legroom and visual lightness.',
    dimensions: { width: '47 in (120 cm)', depth: '22 in (56 cm)', height: '29.5 in (75 cm)', unit: 'imperial' },
    materials: ['Solid White Oak', 'Felt Drawer Liner', 'Brass Cable Grommet'],
    colors: [
      { name: 'Natural Oak', hex: '#D2B48C', threeColor: 0xd2b48c },
      { name: 'Smoked Chestnut', hex: '#5D4037', threeColor: 0x5d4037 }
    ],
    inStock: true,
    stockCount: 19,
    threeModelType: 'desk'
  },
  {
    id: 'prod-7',
    sku: 'FUR-LIV-007',
    name: 'Modular Velvet Sectional Sofa',
    subtitle: 'This Week Highlight: Deep tufted L-shape luxury sofa',
    category: 'Sofas & Sectionals',
    room: 'living',
    price: 1499,
    originalPrice: 1799,
    discountPercent: 17,
    badge: 'NEW',
    rating: 5,
    reviewsCount: 382,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Our flagship modular sofa upholstered in royal plum velvet with deep seat cushions, feather-down blend filling, and modular clips for reconfigurable layouts.',
    longDescription: 'Featured in this weeks highlights. Includes 4 matching velvet throw pillows and precision-turned solid metal feet.',
    dimensions: { width: '112 in (284 cm)', depth: '68 in (173 cm)', height: '33 in (84 cm)', unit: 'imperial' },
    materials: ['Italian Heavy Velvet', 'Down-Feather Wrapped Pocket Springs', 'Solid Beechwood Internal Frame'],
    colors: [
      { name: 'Signature Plum', hex: '#3B184F', threeColor: 0x3b184f },
      { name: 'Deep Amethyst', hex: '#5A189A', threeColor: 0x5a189a },
      { name: 'Champagne Beige', hex: '#E6D5C3', threeColor: 0xe6d5c3 },
      { name: 'Forest Green', hex: '#1E3F20', threeColor: 0x1e3f20 }
    ],
    inStock: true,
    stockCount: 7,
    isFeatured: true,
    isNew: true,
    threeModelType: 'sofa'
  },
  {
    id: 'prod-8',
    sku: 'FUR-DIN-008',
    name: 'Sculptural Round Dining Set',
    subtitle: 'Circular dining table with 4 velvet wrapped tub chairs',
    category: 'Dining Sets',
    room: 'dining',
    price: 899,
    originalPrice: 1199,
    discountPercent: 25,
    badge: '-25%',
    rating: 5,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A grand circular pedestal dining table in dark walnut with 4 ergonomic dining chairs upholstered in matching amethyst velvet.',
    longDescription: 'Pedestal base ensures unobstructed seating. Treated with stain-resistant coating to safeguard against wine or sauce spills during festive dinners.',
    dimensions: { width: '48 in Dia (122 cm)', depth: '48 in (122 cm)', height: '30 in (76 cm)', unit: 'imperial' },
    materials: ['American Walnut', 'Curved Plywood Shell', 'Commercial Grade Velvet'],
    colors: [
      { name: 'Dark Plum & Walnut', hex: '#4A1E6D', threeColor: 0x4a1e6d },
      { name: 'Ivory & Natural Ash', hex: '#F0ECE1', threeColor: 0xf0ece1 }
    ],
    inStock: true,
    stockCount: 9,
    isBestSeller: true,
    isDealOfTheWeek: true,
    threeModelType: 'table'
  },
  {
    id: 'prod-9',
    sku: 'FUR-LIV-009',
    name: 'Plum Velvet Lounge Chair',
    subtitle: 'Deal of the week: Deep contoured barrel chair',
    category: 'Armchairs & Seating',
    room: 'living',
    price: 225,
    originalPrice: 300,
    discountPercent: 25,
    badge: '-25%',
    rating: 5,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A cozy barrel-back lounge chair with 360-degree silent swivel mechanism and luxurious deep plum upholstery.',
    longDescription: 'Soft channel pleating adds visual texture, pairing effortlessly with minimalist or maximalist interiors.',
    dimensions: { width: '30 in (76 cm)', depth: '30 in (76 cm)', height: '31 in (79 cm)', unit: 'imperial' },
    materials: ['Silky Velvet', 'Silent Steel Swivel Plate', 'Molded High-Density Foam'],
    colors: [
      { name: 'Royal Plum', hex: '#4A1E6D', threeColor: 0x4a1e6d },
      { name: 'Blush Rose', hex: '#C98B96', threeColor: 0xc98b96 }
    ],
    inStock: true,
    stockCount: 16,
    isDealOfTheWeek: true,
    threeModelType: 'chair'
  },
  {
    id: 'prod-10',
    sku: 'FUR-STO-010',
    name: 'Minimalist Open Bookshelf',
    subtitle: '6-tier staggered architectural shelving unit',
    category: 'Shelves & Bookcases',
    room: 'storage',
    price: 320,
    originalPrice: 400,
    discountPercent: 20,
    badge: '-20%',
    rating: 5,
    reviewsCount: 53,
    image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An open geometric display shelf perfect for art objects, collectibles, books, and indoor plants. Includes wall anchoring hardware.',
    longDescription: 'Solid timber frame with reinforced cross-bracing and non-marring adjustable leveling feet.',
    dimensions: { width: '38 in (96 cm)', depth: '14 in (35 cm)', height: '74 in (188 cm)', unit: 'imperial' },
    materials: ['Solid Oak Uprights', 'Veneered Shelves', 'Steel Anti-Tip Hardware'],
    colors: [
      { name: 'Honey Oak', hex: '#B8860B', threeColor: 0xb8860b },
      { name: 'Smoked Walnut', hex: '#4A3728', threeColor: 0x4a3728 }
    ],
    inStock: true,
    stockCount: 12,
    isDealOfTheWeek: true,
    threeModelType: 'shelf'
  },
  {
    id: 'prod-11',
    sku: 'FUR-LIV-011',
    name: 'Velvet Ottoman Pouf',
    subtitle: 'Round footrest & extra seating with gold plinth',
    category: 'Ottomans & Benches',
    room: 'living',
    price: 135,
    originalPrice: 150,
    discountPercent: 10,
    badge: '-10%',
    rating: 5,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Versatile, lightweight, and lavish. Use as a footrest, vanity seat, or impromptu coffee table when paired with a serving tray.',
    longDescription: 'Padded with memory foam topper over solid cylinder core. Gold stainless steel base provides a glamorous metallic kick.',
    dimensions: { width: '18 in Dia (45 cm)', depth: '18 in (45 cm)', height: '17 in (43 cm)', unit: 'imperial' },
    materials: ['Velvet Fabric', 'High-Density Foam Core', 'Polished Brass Base Ring'],
    colors: [
      { name: 'Plum Violet', hex: '#5A189A', threeColor: 0x5a189a },
      { name: 'Teal Peacock', hex: '#005F73', threeColor: 0x005f73 }
    ],
    inStock: true,
    stockCount: 25,
    isDealOfTheWeek: true,
    threeModelType: 'chair'
  },
  {
    id: 'prod-12',
    sku: 'FUR-OUT-012',
    name: 'Teak Outdoor Lounge Set',
    subtitle: 'All-weather teak twin club chairs with Sunbrella cushions',
    category: 'Patio & Outdoor',
    room: 'outdoor',
    price: 1250,
    originalPrice: 1450,
    discountPercent: 14,
    badge: 'LUXURY',
    rating: 5,
    reviewsCount: 41,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Grade-A natural teak harvested sustainably from certified plantations. Weatherproof UV and water-repellent Sunbrella cushions in stone beige.',
    longDescription: 'Teak naturally weathers to a distinguished silver-gray patina or can be oiled annually to retain its rich honey color.',
    dimensions: { width: '34 in (86 cm)', depth: '36 in (91 cm)', height: '30 in (76 cm)', unit: 'imperial' },
    materials: ['Grade-A Plantation Teak', 'Sunbrella Outdoor Fabric', 'Quick-Dry Reticulated Foam'],
    colors: [
      { name: 'Natural Teak & Stone', hex: '#C2A379', threeColor: 0xc2a379 }
    ],
    inStock: true,
    stockCount: 6,
    threeModelType: 'chair'
  }
];

export const PROMO_BANNERS: {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  roomFilter: 'living' | 'bedroom' | 'dining';
  discountText?: string;
}[] = [
  {
    id: 'promo-1',
    tag: 'NEW COLLECTION',
    title: 'Modern Sofas For Your Home',
    subtitle: 'Comfort that complements your style.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    buttonText: 'SHOP NOW',
    roomFilter: 'living'
  },
  {
    id: 'promo-2',
    tag: 'BEST SELLERS',
    title: 'Stylish Dining Furniture',
    subtitle: 'Make every meal special.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    buttonText: 'SHOP NOW',
    roomFilter: 'dining'
  },
  {
    id: 'promo-3',
    tag: 'LIMITED OFFER',
    title: 'Up To 30% Off On Bedroom Sets',
    subtitle: 'Premium quality. Smart designs.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    buttonText: 'SHOP NOW',
    roomFilter: 'bedroom',
    discountText: '30% OFF'
  }
];
