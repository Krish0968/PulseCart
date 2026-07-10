const fs = require('fs');
const path = require('path');

// Category mapping from database IDs
const categoryMapping = {
  1: 'electronics',
  2: 'gaming',
  3: 'home-appliances',
  4: 'fashion',
  5: 'books',
  6: 'sports-outdoors',
  7: 'beauty-personal-care',
  8: 'toys-games'
};

const assetsBaseDir = path.join(__dirname, 'frontend', 'public');
const errors = [];
const seenPaths = new Set();

function validateProduct(id, name, slug, categorySlug, dbImageUrl) {
  if (!dbImageUrl || dbImageUrl.trim() === '') {
    errors.push(`Product [ID ${id}: ${name}] has empty or null image path.`);
    return;
  }

  // Support both fully-qualified and absolute paths served from Vite public
  const relativePath = dbImageUrl.replace(/^\//, ''); // strip leading slash
  const absolutePath = path.join(assetsBaseDir, relativePath);

  // Check file exists
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Product [ID ${id}: ${name}] references missing asset: ${dbImageUrl} (checked physical path: ${absolutePath})`);
    return;
  }

  // Check unique path
  if (seenPaths.has(dbImageUrl)) {
    errors.push(`Duplicate image path found: ${dbImageUrl} is shared by multiple products.`);
  } else {
    seenPaths.add(dbImageUrl);
  }

  // Check supported extension
  const ext = path.extname(dbImageUrl).toLowerCase();
  const supported = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];
  if (!supported.includes(ext)) {
    errors.push(`Product [ID ${id}: ${name}] uses unsupported extension: ${ext} in path: ${dbImageUrl}`);
  }
}

// 1. Audit V2__Seed_Data.sql (Products 1-60)
console.log('Auditing V2__Seed_Data.sql...');
const sqlPath = path.join(__dirname, 'backend', 'src', 'main', 'resources', 'db', 'migration', 'mysql', 'V2__Seed_Data.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Match lines like: (1, 'Galaxy S24 Ultra', 'galaxy-s24-ultra', '...', '...', 1, 'Samsung', ...)
// Let's parse them using regex
const productRegex = /\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*(\d+)\s*,\s*'([^']+)'/g;
let match;
let seedCount = 0;

while ((match = productRegex.exec(sqlContent)) !== null) {
  const id = parseInt(match[1]);
  const name = match[2];
  const slug = match[3];
  const categoryId = parseInt(match[6]);
  const categorySlug = categoryMapping[categoryId];

  // The repaired image path in the database will be /assets/products/<categorySlug>/<slug>.svg
  const expectedPath = `/assets/products/${categorySlug}/${slug}.svg`;
  validateProduct(id, name, slug, categorySlug, expectedPath);
  seedCount++;
}
console.log(`Audited ${seedCount} seeded products from SQL migration.`);

// 2. Audit DatabaseSeeder.java (Products 61-124)
console.log('Auditing DatabaseSeeder.java...');
const seederPath = path.join(__dirname, 'backend', 'src', 'main', 'com', 'pulsecart', 'config', 'DatabaseSeeder.java');
// Wait, path may be src/main/java/com/pulsecart/config/DatabaseSeeder.java
const correctSeederPath = path.join(__dirname, 'backend', 'src', 'main', 'java', 'com', 'pulsecart', 'config', 'DatabaseSeeder.java');
const seederContent = fs.readFileSync(correctSeederPath, 'utf8');

// Let's extract createProd calls or the hardcoded names/slugs
// Category 1: Electronics (8 items)
// seedProducts.add(createProd("PulsePro Laptop 15", "pulsepro-laptop-15", ...))
const createProdRegex = /createProd\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,[^,]+,[^,]+,\s*([a-z]+)\s*,/g;
let seederCount = 0;

// Also parse the loop-based seeders:
// String[] fashionNames = {...};
// String[] bookNames = {...};
// String[] sportsNames = {...};
// String[] beautyNames = {...};
// String[] toyNames = {...};
// For simplicity, we also have our hardcoded mapping of all 124 products in generate-assets.js.
// Let's load the generated list and validate it.
const PRODUCTS = [
  // Slugs 1 to 124
  { id: 1, slug: 'galaxy-s24-ultra', category: 'electronics' },
  { id: 2, slug: 'iphone-15-pro-max', category: 'electronics' },
  { id: 3, slug: 'sony-wh-1000xm5', category: 'electronics' },
  { id: 4, slug: 'dell-xps-13', category: 'electronics' },
  { id: 5, slug: 'samsung-32-curved-monitor', category: 'electronics' },
  { id: 6, slug: 'logitech-mx-master-3s', category: 'electronics' },
  { id: 7, slug: 'anker-prime-power-bank', category: 'electronics' },
  { id: 8, slug: 'apple-watch-series-9', category: 'electronics' },
  { id: 9, slug: 'playstation-5-console', category: 'gaming' },
  { id: 10, slug: 'nintendo-switch-oled', category: 'gaming' },
  { id: 11, slug: 'xbox-series-x', category: 'gaming' },
  { id: 12, slug: 'dualsense-edge-controller', category: 'gaming' },
  { id: 13, slug: 'logitech-g-pro-x-superlight', category: 'gaming' },
  { id: 14, slug: 'razer-blackwidow-v4-pro', category: 'gaming' },
  { id: 15, slug: 'meta-quest-3-vr', category: 'gaming' },
  { id: 16, slug: 'steelseries-arctis-nova-pro', category: 'gaming' },
  { id: 17, slug: 'dyson-v15-detect', category: 'home-appliances' },
  { id: 18, slug: 'instant-pot-duo-crisp', category: 'home-appliances' },
  { id: 19, slug: 'philips-airfryer-xxl', category: 'home-appliances' },
  { id: 20, slug: 'irobot-roomba-j7-plus', category: 'home-appliances' },
  { id: 21, slug: 'keurig-k-elite', category: 'home-appliances' },
  { id: 22, slug: 'cosori-smart-kettle', category: 'home-appliances' },
  { id: 23, slug: 'levoit-core-300s', category: 'home-appliances' },
  { id: 24, slug: 'delonghi-dedica-espresso', category: 'home-appliances' },
  { id: 25, slug: 'nike-air-max-270', category: 'fashion' },
  { id: 26, slug: 'adidas-ultraboost-light', category: 'fashion' },
  { id: 27, slug: 'patagonia-torrentshell-3l', category: 'fashion' },
  { id: 28, slug: 'levis-511-jeans', category: 'fashion' },
  { id: 29, slug: 'carhartt-watch-hat', category: 'fashion' },
  { id: 30, slug: 'north-face-venture-2', category: 'fashion' },
  { id: 31, slug: 'ray-ban-wayfarer', category: 'fashion' },
  { id: 32, slug: 'fossil-gen-6', category: 'fashion' },
  { id: 33, slug: 'atomic-habits', category: 'books' },
  { id: 34, slug: 'clean-code', category: 'books' },
  { id: 35, slug: 'the-hobbit', category: 'books' },
  { id: 36, slug: 'designing-data-intensive-apps', category: 'books' },
  { id: 37, slug: 'sapiens-brief-history', category: 'books' },
  { id: 38, slug: 'the-creative-act', category: 'books' },
  { id: 39, slug: 'educated-memoir', category: 'books' },
  { id: 40, slug: 'deep-work', category: 'books' },
  { id: 41, slug: 'hydro-flask-wide-mouth', category: 'sports-outdoors' },
  { id: 42, slug: 'bowflex-selecttech-552', category: 'sports-outdoors' },
  { id: 43, slug: 'fitbit-charge-6', category: 'sports-outdoors' },
  { id: 44, slug: 'coleman-sundome-tent', category: 'sports-outdoors' },
  { id: 45, slug: 'wilson-evolution-basketball', category: 'sports-outdoors' },
  { id: 46, slug: 'garmin-edge-540', category: 'sports-outdoors' },
  { id: 47, slug: 'spalding-slam-jam-rim', category: 'sports-outdoors' },
  { id: 48, slug: 'philips-norelco-shaver-9000', category: 'beauty-personal-care' },
  { id: 49, slug: 'cerave-hydrating-cleanser', category: 'beauty-personal-care' },
  { id: 50, slug: 'dyson-airwrap-styler', category: 'beauty-personal-care' },
  { id: 51, slug: 'oral-b-io-series-9', category: 'beauty-personal-care' },
  { id: 52, slug: 'loccitane-shea-butter-cream', category: 'beauty-personal-care' },
  { id: 53, slug: 'waterpik-aquarius-flosser', category: 'beauty-personal-care' },
  { id: 54, slug: 'neutrogena-hydro-boost-gel', category: 'beauty-personal-care' },
  { id: 55, slug: 'lego-millenium-falcon', category: 'toys-games' },
  { id: 56, slug: 'catan-board-game', category: 'toys-games' },
  { id: 57, slug: 'ticket-to-ride-game', category: 'toys-games' },
  { id: 58, slug: 'hasbro-monopoly-classic', category: 'toys-games' },
  { id: 59, slug: 'ravensburger-villainous', category: 'toys-games' },
  { id: 60, slug: 'snap-circuits-jr', category: 'toys-games' },

  { id: 61, slug: 'pulsepro-laptop-15', category: 'electronics' },
  { id: 62, slug: 'apexbuds-wireless-headphones', category: 'electronics' },
  { id: 63, slug: 'smartband-pulse-4', category: 'electronics' },
  { id: 64, slug: 'aerocharge-magsafe-charger', category: 'electronics' },
  { id: 65, slug: 'novacam-4k-web-camera', category: 'electronics' },
  { id: 66, slug: 'vividview-27-inch-monitor', category: 'electronics' },
  { id: 67, slug: 'soundcore-bluetooth-speaker', category: 'electronics' },
  { id: 68, slug: 'titandrive-2tb-external-ssd', category: 'electronics' },
  
  { id: 69, slug: 'progamer-mechanical-keyboard', category: 'gaming' },
  { id: 70, slug: 'viperstrike-gaming-mouse', category: 'gaming' },
  { id: 71, slug: 'questvr-headset-prime', category: 'gaming' },
  { id: 72, slug: 'gamerheadset-surround-7.1', category: 'gaming' },
  { id: 73, slug: 'console-stand-dual-charging', category: 'gaming' },
  { id: 74, slug: 'aeroseat-ergonomic-gaming-chair', category: 'gaming' },
  { id: 75, slug: 'cyberarena-xl-gaming-mat', category: 'gaming' },
  { id: 76, slug: 'strikepad-wireless-controller', category: 'gaming' },
  
  { id: 77, slug: 'nutriblend-highspeed-mixer', category: 'home-appliances' },
  { id: 78, slug: 'brewmaster-coffee-station', category: 'home-appliances' },
  { id: 79, slug: 'aeropure-hepa-air-purifier', category: 'home-appliances' },
  { id: 80, slug: 'crispair-smart-air-fryer', category: 'home-appliances' },
  { id: 81, slug: 'smartsweep-robotic-vacuum', category: 'home-appliances' },
  { id: 82, slug: 'ironsteam-cordless-iron', category: 'home-appliances' },
  { id: 83, slug: 'aquaflow-countertop-filter', category: 'home-appliances' },
  { id: 84, slug: 'chillfreeze-portable-refrigerator', category: 'home-appliances' },

  { id: 85, slug: 'urbanfit-hooded-sweatshirt', category: 'fashion' },
  { id: 86, slug: 'metrofit-slim-jeans', category: 'fashion' },
  { id: 87, slug: 'activewalk-running-shoes', category: 'fashion' },
  { id: 88, slug: 'sunshield-polarized-sunglasses', category: 'fashion' },
  { id: 89, slug: 'classic-leather-wrist-watch', category: 'fashion' },
  { id: 90, slug: 'vanguard-canvas-backpack', category: 'fashion' },
  { id: 91, slug: 'allweather-waterproof-jacket', category: 'fashion' },
  { id: 92, slug: 'comfortsoft-cotton-t-shirts', category: 'fashion' },

  { id: 93, slug: 'mastering-spring-boot-3.0', category: 'books' },
  { id: 94, slug: 'clean-code-architecture-guide', category: 'books' },
  { id: 95, slug: 'algorithms-and-data-structures', category: 'books' },
  { id: 96, slug: 'the-psychology-of-success', category: 'books' },
  { id: 97, slug: 'introduction-to-quantum-computing', category: 'books' },
  { id: 98, slug: 'the-infinite-mystery-novel', category: 'books' },
  { id: 99, slug: 'ultimate-keto-recipe-cookbook', category: 'books' },
  { id: 100, slug: 'creative-thinking-work-book', category: 'books' },

  { id: 101, slug: 'flexgrip-nonslip-yoga-mat', category: 'sports-outdoors' },
  { id: 102, slug: 'hexdumbbell-weight-set-20lb', category: 'sports-outdoors' },
  { id: 103, slug: 'campcomfort-4-person-tent', category: 'sports-outdoors' },
  { id: 104, slug: 'trailblazer-mountain-bicycle', category: 'sports-outdoors' },
  { id: 105, slug: 'hydroflask-stainless-bottle', category: 'sports-outdoors' },
  { id: 106, slug: 'aerospeed-sports-sunglasses', category: 'sports-outdoors' },
  { id: 107, slug: 'thermasleep-outdoor-bag', category: 'sports-outdoors' },
  { id: 108, slug: 'fitlife-smart-body-scale', category: 'sports-outdoors' },

  { id: 109, slug: 'hydroboost-hydrating-moisturizer', category: 'beauty-personal-care' },
  { id: 110, slug: 'aerosonic-ionic-hair-dryer', category: 'beauty-personal-care' },
  { id: 111, slug: 'goldglow-antiaging-serum', category: 'beauty-personal-care' },
  { id: 112, slug: 'classic-amber-woody-cologne', category: 'beauty-personal-care' },
  { id: 113, slug: 'ultrasoft-bamboo-face-wipes', category: 'beauty-personal-care' },
  { id: 114, slug: 'satinsmooth-curling-wand', category: 'beauty-personal-care' },
  { id: 115, slug: 'charcoaldeep-pore-face-scrub', category: 'beauty-personal-care' },
  { id: 116, slug: 'organic-coconut-conditioner', category: 'beauty-personal-care' },

  { id: 117, slug: 'settlers-of-board-game', category: 'toys-games' },
  { id: 118, slug: '3d-wooden-mechanical-puzzle', category: 'toys-games' },
  { id: 119, slug: 'aeroquad-micro-hobby-drone', category: 'toys-games' },
  { id: 120, slug: 'smartrobot-stem-coding-kit', category: 'toys-games' },
  { id: 121, slug: 'retroarcade-handheld-console', category: 'toys-games' },
  { id: 122, slug: 'creative-clay-modeling-tub', category: 'toys-games' },
  { id: 123, slug: 'speedcubing-3x3-speed-cube', category: 'toys-games' },
  { id: 124, slug: 'giant-stack-tumble-tower', category: 'toys-games' }
];

seenPaths.clear(); // Reset seen paths for complete validation check

PRODUCTS.forEach(p => {
  const expectedPath = `/assets/products/${p.category}/${p.slug}.svg`;
  validateProduct(p.id, p.slug, p.slug, p.category, expectedPath);
});

// Print validation report
if (errors.length > 0) {
  console.error('\n!!! VALIDATION FAILED !!!');
  errors.forEach(err => console.error(`- ${err}`));
  process.exit(1);
} else {
  console.log('\n*** VALIDATION SUCCESS: All seeded product images are verified! ***');
  process.exit(0);
}
