const fs = require('fs');
const path = require('path');

const PRODUCTS = [
  // --- V2 Seed Data Slugs (1 to 60) ---
  { id: 1, name: 'Galaxy S24 Ultra', slug: 'galaxy-s24-ultra', brand: 'Samsung', category: 'electronics', type: 'phone', color: '#1e3a8a', accent: '#3b82f6' },
  { id: 2, name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', brand: 'Apple', category: 'electronics', type: 'phone', color: '#334155', accent: '#94a3b8' },
  { id: 3, name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', brand: 'Sony', category: 'electronics', type: 'headphones', color: '#172554', accent: '#3b82f6' },
  { id: 4, name: 'Dell XPS 13 Laptop', slug: 'dell-xps-13', brand: 'Dell', category: 'electronics', type: 'laptop', color: '#0f172a', accent: '#0284c7' },
  { id: 5, name: 'Samsung 32" Curved Monitor', slug: 'samsung-32-curved-monitor', brand: 'Samsung', category: 'electronics', type: 'monitor', color: '#020617', accent: '#38bdf8' },
  { id: 6, name: 'Logitech MX Master 3S', slug: 'logitech-mx-master-3s', brand: 'Logitech', category: 'electronics', type: 'mouse', color: '#1e293b', accent: '#64748b' },
  { id: 7, name: 'Anker Prime Power Bank', slug: 'anker-prime-power-bank', brand: 'Anker', category: 'electronics', type: 'powerbank', color: '#0f172a', accent: '#3b82f6' },
  { id: 8, name: 'Apple Watch Series 9', slug: 'apple-watch-series-9', brand: 'Apple', category: 'electronics', type: 'watch', color: '#1e1b4b', accent: '#818cf8' },
  { id: 9, name: 'PlayStation 5 Console', slug: 'playstation-5-console', brand: 'Sony', category: 'gaming', type: 'console', color: '#090d16', accent: '#3b82f6' },
  { id: 10, name: 'Nintendo Switch OLED', slug: 'nintendo-switch-oled', brand: 'Nintendo', category: 'gaming', type: 'switch', color: '#1e1b4b', accent: '#ef4444' },
  { id: 11, name: 'Xbox Series X', slug: 'xbox-series-x', brand: 'Microsoft', category: 'gaming', type: 'xbox', color: '#050b14', accent: '#22c55e' },
  { id: 12, name: 'DualSense Edge Controller', slug: 'dualsense-edge-controller', brand: 'Sony', category: 'gaming', type: 'controller', color: '#0f172a', accent: '#3b82f6' },
  { id: 13, name: 'Logitech G PRO X Superlight', slug: 'logitech-g-pro-x-superlight', brand: 'Logitech', category: 'gaming', type: 'mouse', color: '#020617', accent: '#06b6d4' },
  { id: 14, name: 'Razer BlackWidow V4 Pro', slug: 'razer-blackwidow-v4-pro', brand: 'Razer', category: 'gaming', type: 'keyboard', color: '#050b14', accent: '#22c55e' },
  { id: 15, name: 'Meta Quest 3 VR Headset', slug: 'meta-quest-3-vr', brand: 'Meta', category: 'gaming', type: 'vr', color: '#1e293b', accent: '#6366f1' },
  { id: 16, name: 'SteelSeries Arctis Nova Pro', slug: 'steelseries-arctis-nova-pro', brand: 'SteelSeries', category: 'gaming', type: 'headphones', color: '#0f172a', accent: '#8b5cf6' },
  { id: 17, name: 'Dyson V15 Detect Vacuum', slug: 'dyson-v15-detect', brand: 'Dyson', category: 'home-appliances', type: 'vacuum', color: '#1e1b4b', accent: '#c084fc' },
  { id: 18, name: 'Instant Pot Duo Crisp 11-in-1', slug: 'instant-pot-duo-crisp', brand: 'Instant Pot', category: 'home-appliances', type: 'blender', color: '#3f3f46', accent: '#a1a1aa' },
  { id: 19, name: 'Philips Airfryer XXL', slug: 'philips-airfryer-xxl', brand: 'Philips', category: 'home-appliances', type: 'airfryer', color: '#18181b', accent: '#e4e4e7' },
  { id: 20, name: 'iRobot Roomba j7+', slug: 'irobot-roomba-j7-plus', brand: 'iRobot', category: 'home-appliances', type: 'vacuum', color: '#27272a', accent: '#fbbf24' },
  { id: 21, name: 'Keurig K-Elite Coffee Maker', slug: 'keurig-k-elite', brand: 'Keurig', category: 'home-appliances', type: 'blender', color: '#1c1917', accent: '#d6d3d1' },
  { id: 22, name: 'Cosori Smart Electric Kettle', slug: 'cosori-smart-kettle', brand: 'Cosori', category: 'home-appliances', type: 'kettle', color: '#292524', accent: '#f59e0b' },
  { id: 23, name: 'Levoit Core 300S Air Purifier', slug: 'levoit-core-300s', brand: 'Levoit', category: 'home-appliances', type: 'purifier', color: '#f8fafc', accent: '#38bdf8' },
  { id: 24, name: 'DeLonghi Dedica Espresso Machine', slug: 'delonghi-dedica-espresso', brand: 'DeLonghi', category: 'home-appliances', type: 'kettle', color: '#7f1d1d', accent: '#f87171' },
  { id: 25, name: 'Nike Air Max 270', slug: 'nike-air-max-270', brand: 'Nike', category: 'fashion', type: 'shoes', color: '#111827', accent: '#f43f5e' },
  { id: 26, name: 'Adidas Ultraboost Light', slug: 'adidas-ultraboost-light', brand: 'Adidas', category: 'fashion', type: 'shoes', color: '#0f172a', accent: '#3b82f6' },
  { id: 27, name: 'Patagonia Torrentshell 3L', slug: 'patagonia-torrentshell-3l', brand: 'Patagonia', category: 'fashion', type: 'jacket', color: '#134e4a', accent: '#2dd4bf' },
  { id: 28, name: 'Levi\'s 511 Slim Fit Jeans', slug: 'levis-511-jeans', brand: 'Levi\'s', category: 'fashion', type: 'jeans', color: '#172554', accent: '#60a5fa' },
  { id: 29, name: 'Carhartt Acrylic Watch Hat', slug: 'carhartt-watch-hat', brand: 'Carhartt', category: 'fashion', type: 'hat', color: '#451a03', accent: '#f97316' },
  { id: 30, name: 'North Face Venture 2 Jacket', slug: 'north-face-venture-2', brand: 'The North Face', category: 'fashion', type: 'jacket', color: '#064e3b', accent: '#34d399' },
  { id: 31, name: 'Ray-Ban Classic Wayfarer', slug: 'ray-ban-wayfarer', brand: 'Ray-Ban', category: 'fashion', type: 'sunglasses', color: '#0f172a', accent: '#facc15' },
  { id: 32, name: 'Fossil Gen 6 Smartwatch', slug: 'fossil-gen-6', brand: 'Fossil', category: 'fashion', type: 'watch', color: '#1c1917', accent: '#a8a29e' },
  { id: 33, name: 'Atomic Habits', slug: 'atomic-habits', brand: 'James Clear', category: 'books', type: 'book', color: '#7f1d1d', accent: '#f59e0b', author: 'James Clear' },
  { id: 34, name: 'Clean Code', slug: 'clean-code', brand: 'Robert C. Martin', category: 'books', type: 'book', color: '#064e3b', accent: '#10b981', author: 'Robert C. Martin' },
  { id: 35, name: 'The Hobbit', slug: 'the-hobbit', brand: 'J.R.R. Tolkien', category: 'books', type: 'book', color: '#1e1b4b', accent: '#818cf8', author: 'J.R.R. Tolkien' },
  { id: 36, name: 'Designing Data-Intensive Applications', slug: 'designing-data-intensive-apps', brand: 'Martin Kleppmann', category: 'books', type: 'book', color: '#7c2d12', accent: '#f97316', author: 'Martin Kleppmann' },
  { id: 37, name: 'Sapiens: A Brief History of Humankind', slug: 'sapiens-brief-history', brand: 'Yuval Noah Harari', category: 'books', type: 'book', color: '#312e81', accent: '#6366f1', author: 'Yuval N. Harari' },
  { id: 38, name: 'The Creative Act: A Way of Being', slug: 'the-creative-act', brand: 'Rick Rubin', category: 'books', type: 'book', color: '#18181b', accent: '#a1a1aa', author: 'Rick Rubin' },
  { id: 39, name: 'Educated: A Memoir', slug: 'educated-memoir', brand: 'Tara Westover', category: 'books', type: 'book', color: '#022c22', accent: '#059669', author: 'Tara Westover' },
  { id: 40, name: 'Deep Work', slug: 'deep-work', brand: 'Cal Newport', category: 'books', type: 'book', color: '#1e3a8a', accent: '#3b82f6', author: 'Cal Newport' },
  { id: 41, name: 'Hydro Flask Wide Mouth', slug: 'hydro-flask-wide-mouth', brand: 'Hydro Flask', category: 'sports-outdoors', type: 'bottle', color: '#0891b2', accent: '#22d3ee' },
  { id: 42, name: 'Bowflex SelectTech 552', slug: 'bowflex-selecttech-552', brand: 'Bowflex', category: 'sports-outdoors', type: 'dumbbell', color: '#1e293b', accent: '#ef4444' },
  { id: 43, name: 'Fitbit Charge 6', slug: 'fitbit-charge-6', brand: 'Fitbit', category: 'sports-outdoors', type: 'watch', color: '#0f172a', accent: '#ec4899' },
  { id: 44, name: 'Coleman Sundome Tent', slug: 'coleman-sundome-tent', brand: 'Coleman', category: 'sports-outdoors', type: 'tent', color: '#14532d', accent: '#4ade80' },
  { id: 45, name: 'Wilson Evolution Basketball', slug: 'wilson-evolution-basketball', brand: 'Wilson', category: 'sports-outdoors', type: 'dumbbell', color: '#451a03', accent: '#fb923c' },
  { id: 46, name: 'Garmin Edge 540', slug: 'garmin-edge-540', brand: 'Garmin', category: 'sports-outdoors', type: 'watch', color: '#0f172a', accent: '#06b6d4' },
  { id: 47, name: 'Spalding Rim Hoop', slug: 'spalding-slam-jam-rim', brand: 'Spalding', category: 'sports-outdoors', type: 'dumbbell', color: '#7f1d1d', accent: '#fb923c' },
  { id: 48, name: 'Philips Norelco Shaver 9000', slug: 'philips-norelco-shaver-9000', brand: 'Philips', category: 'beauty-personal-care', type: 'shaver', color: '#0f172a', accent: '#3b82f6' },
  { id: 49, name: 'CeraVe Hydrating Cleanser', slug: 'cerave-hydrating-cleanser', brand: 'CeraVe', category: 'beauty-personal-care', type: 'shaver', color: '#047857', accent: '#10b981' },
  { id: 50, name: 'Dyson Airwrap Multi-Styler', slug: 'dyson-airwrap-styler', brand: 'Dyson', category: 'beauty-personal-care', type: 'shaver', color: '#581c87', accent: '#d8b4fe' },
  { id: 51, name: 'Oral-B iO Series 9', slug: 'oral-b-io-series-9', brand: 'Oral-B', category: 'beauty-personal-care', type: 'shaver', color: '#0f172a', accent: '#3b82f6' },
  { id: 52, name: 'L\'Occitane Shea Butter Cream', slug: 'loccitane-shea-butter-cream', brand: 'L\'Occitane', category: 'beauty-personal-care', type: 'shaver', color: '#78350f', accent: '#fbbf24' },
  { id: 53, name: 'Waterpik Aquarius Water Flosser', slug: 'waterpik-aquarius-flosser', brand: 'Waterpik', category: 'beauty-personal-care', type: 'shaver', color: '#f8fafc', accent: '#0ea5e9' },
  { id: 54, name: 'Neutrogena Hydro Boost Water Gel', slug: 'neutrogena-hydro-boost-gel', brand: 'Neutrogena', category: 'beauty-personal-care', type: 'shaver', color: '#0284c7', accent: '#38bdf8' },
  { id: 55, name: 'LEGO Star Wars Millenium Falcon', slug: 'lego-millenium-falcon', brand: 'LEGO', category: 'toys-games', type: 'lego', color: '#7f1d1d', accent: '#ef4444' },
  { id: 56, name: 'Catan Board Game', slug: 'catan-board-game', brand: 'Catan', category: 'toys-games', type: 'boardgame', color: '#7c2d12', accent: '#ea580c' },
  { id: 57, name: 'Ticket to Ride Game', slug: 'ticket-to-ride-game', brand: 'Days of Wonder', category: 'toys-games', type: 'boardgame', color: '#1e3a8a', accent: '#3b82f6' },
  { id: 58, name: 'Hasbro Monopoly Classic', slug: 'hasbro-monopoly-classic', brand: 'Hasbro', category: 'toys-games', type: 'boardgame', color: '#14532d', accent: '#22c55e' },
  { id: 59, name: 'Ravensburger Disney Villainous', slug: 'ravensburger-villainous', brand: 'Ravensburger', category: 'toys-games', type: 'boardgame', color: '#3b0764', accent: '#a855f7' },
  { id: 60, name: 'Snap Circuits Jr. SC-100', slug: 'snap-circuits-jr', brand: 'Elenco', category: 'toys-games', type: 'lego', color: '#1e293b', accent: '#3b82f6' },

  // --- DatabaseSeeder Slugs (61 to 124) ---
  { id: 61, name: 'PulsePro Laptop 15', slug: 'pulsepro-laptop-15', brand: 'ApexTech', category: 'electronics', type: 'laptop', color: '#1e293b', accent: '#4f46e5' },
  { id: 62, name: 'ApexBuds Wireless Headphones', slug: 'apexbuds-wireless-headphones', brand: 'ApexTech', category: 'electronics', type: 'headphones', color: '#0f172a', accent: '#3b82f6' },
  { id: 63, name: 'SmartBand Pulse 4', slug: 'smartband-pulse-4', brand: 'FitLife', category: 'electronics', type: 'watch', color: '#312e81', accent: '#6366f1' },
  { id: 64, name: 'AeroCharge MagSafe Charger', slug: 'aerocharge-magsafe-charger', brand: 'ChargeGrid', category: 'electronics', type: 'powerbank', color: '#1e293b', accent: '#10b981' },
  { id: 65, name: 'NovaCam 4K Web Camera', slug: 'novacam-4k-web-camera', brand: 'CamNova', category: 'electronics', type: 'webcam', color: '#0f172a', accent: '#e11d48' },
  { id: 66, name: 'VividView 27-inch Monitor', slug: 'vividview-27-inch-monitor', brand: 'ViewMatrix', category: 'electronics', type: 'monitor', color: '#020617', accent: '#38bdf8' },
  { id: 67, name: 'SoundCore Bluetooth Speaker', slug: 'soundcore-bluetooth-speaker', brand: 'Acoustics', category: 'electronics', type: 'speaker', color: '#1c1917', accent: '#fb923c' },
  { id: 68, name: 'TitanDrive 2TB External SSD', slug: 'titandrive-2tb-external-ssd', brand: 'StoragePlus', category: 'electronics', type: 'ssd', color: '#0f172a', accent: '#3b82f6' },
  
  { id: 69, name: 'ProGamer Mechanical Keyboard', slug: 'progamer-mechanical-keyboard', brand: 'GearSet', category: 'gaming', type: 'keyboard', color: '#0c0a09', accent: '#ef4444' },
  { id: 70, name: 'ViperStrike Gaming Mouse', slug: 'viperstrike-gaming-mouse', brand: 'GearSet', category: 'gaming', type: 'mouse', color: '#0f172a', accent: '#22c55e' },
  { id: 71, name: 'QuestVR Headset Prime', slug: 'questvr-headset-prime', brand: 'QuestTech', category: 'gaming', type: 'vr', color: '#1e293b', accent: '#6366f1' },
  { id: 72, name: 'GamerHeadset Surround 7.1', slug: 'gamerheadset-surround-7.1', brand: 'SoundStorm', category: 'gaming', type: 'headphones', color: '#111827', accent: '#ec4899' },
  { id: 73, name: 'Console Stand Dual Charging', slug: 'console-stand-dual-charging', brand: 'PowerUp', category: 'gaming', type: 'powerbank', color: '#1e293b', accent: '#3b82f6' },
  { id: 74, name: 'AeroSeat Ergonomic Gaming Chair', slug: 'aeroseat-ergonomic-gaming-chair', brand: 'FitLife', category: 'gaming', type: 'chair', color: '#111827', accent: '#ec4899' },
  { id: 75, name: 'CyberArena XL Gaming Mat', slug: 'cyberarena-xl-gaming-mat', brand: 'GearSet', category: 'gaming', type: 'mat', color: '#0f172a', accent: '#22c55e' },
  { id: 76, name: 'StrikePad Wireless Controller', slug: 'strikepad-wireless-controller', brand: 'PowerUp', category: 'gaming', type: 'controller', color: '#1e293b', accent: '#3b82f6' },
  
  { id: 77, name: 'NutriBlend HighSpeed Mixer', slug: 'nutriblend-highspeed-mixer', brand: 'KitchPro', category: 'home-appliances', type: 'blender', color: '#3f3f46', accent: '#10b981' },
  { id: 78, name: 'BrewMaster Coffee Station', slug: 'brewmaster-coffee-station', brand: 'KitchPro', category: 'home-appliances', type: 'kettle', color: '#1c1917', accent: '#f59e0b' },
  { id: 79, name: 'AeroPure HEPA Air Purifier', slug: 'aeropure-hepa-air-purifier', brand: 'PureAir', category: 'home-appliances', type: 'purifier', color: '#f8fafc', accent: '#0ea5e9' },
  { id: 80, name: 'CrispAir Smart Air Fryer', slug: 'crispair-smart-air-fryer', brand: 'KitchPro', category: 'home-appliances', type: 'airfryer', color: '#18181b', accent: '#f43f5e' },
  { id: 81, name: 'SmartSweep Robotic Vacuum', slug: 'smartsweep-robotic-vacuum', brand: 'CleanTech', category: 'home-appliances', type: 'vacuum', color: '#27272a', accent: '#eab308' },
  { id: 82, name: 'IronSteam Cordless Iron', slug: 'ironsteam-cordless-iron', brand: 'CleanTech', category: 'home-appliances', type: 'iron', color: '#1e3a8a', accent: '#60a5fa' },
  { id: 83, name: 'AquaFlow Countertop Filter', slug: 'aquaflow-countertop-filter', brand: 'PureAir', category: 'home-appliances', type: 'purifier', color: '#f1f5f9', accent: '#06b6d4' },
  { id: 84, name: 'ChillFreeze Portable Refrigerator', slug: 'chillfreeze-portable-refrigerator', brand: 'KitchPro', category: 'home-appliances', type: 'refrigerator', color: '#0f172a', accent: '#fb923c' },

  { id: 85, name: 'UrbanFit Hooded Sweatshirt', slug: 'urbanfit-hooded-sweatshirt', brand: 'TrendWear', category: 'fashion', type: 'jacket', color: '#1e293b', accent: '#3b82f6' },
  { id: 86, name: 'MetroFit Slim Jeans', slug: 'metrofit-slim-jeans', brand: 'TrendWear', category: 'fashion', type: 'jeans', color: '#1e3a8a', accent: '#60a5fa' },
  { id: 87, name: 'ActiveWalk Running Shoes', slug: 'activewalk-running-shoes', brand: 'TrendWear', category: 'fashion', type: 'shoes', color: '#111827', accent: '#ef4444' },
  { id: 88, name: 'SunShield Polarized Sunglasses', slug: 'sunshield-polarized-sunglasses', brand: 'TrendWear', category: 'fashion', type: 'sunglasses', color: '#0f172a', accent: '#eab308' },
  { id: 89, name: 'Classic Leather Wrist Watch', slug: 'classic-leather-wrist-watch', brand: 'TrendWear', category: 'fashion', type: 'watch', color: '#451a03', accent: '#fb923c' },
  { id: 90, name: 'Vanguard Canvas Backpack', slug: 'vanguard-canvas-backpack', brand: 'TrendWear', category: 'fashion', type: 'backpack', color: '#134e4a', accent: '#2dd4bf' },
  { id: 91, name: 'AllWeather Waterproof Jacket', slug: 'allweather-waterproof-jacket', brand: 'TrendWear', category: 'fashion', type: 'jacket', color: '#1e293b', accent: '#10b981' },
  { id: 92, name: 'ComfortSoft Cotton T-Shirts', slug: 'comfortsoft-cotton-t-shirts', brand: 'TrendWear', category: 'fashion', type: 'apparel', color: '#f8fafc', accent: '#cbd5e1' },

  { id: 93, name: 'Mastering Spring Boot 3.0', slug: 'mastering-spring-boot-3.0', brand: 'PressPublish', category: 'books', type: 'book', color: '#1e3a8a', accent: '#60a5fa', author: 'PressPublish' },
  { id: 94, name: 'Clean Code Architecture Guide', slug: 'clean-code-architecture-guide', brand: 'PressPublish', category: 'books', type: 'book', color: '#064e3b', accent: '#10b981', author: 'PressPublish' },
  { id: 95, name: 'Algorithms and Data Structures', slug: 'algorithms-and-data-structures', brand: 'PressPublish', category: 'books', type: 'book', color: '#311042', accent: '#c084fc', author: 'PressPublish' },
  { id: 96, name: 'The Psychology of Success', slug: 'the-psychology-of-success', brand: 'PressPublish', category: 'books', type: 'book', color: '#7f1d1d', accent: '#fb923c', author: 'PressPublish' },
  { id: 97, name: 'Introduction to Quantum Computing', slug: 'introduction-to-quantum-computing', brand: 'PressPublish', category: 'books', type: 'book', color: '#1e1b4b', accent: '#818cf8', author: 'PressPublish' },
  { id: 98, name: 'The Infinite Mystery Novel', slug: 'the-infinite-mystery-novel', brand: 'PressPublish', category: 'books', type: 'book', color: '#18181b', accent: '#a1a1aa', author: 'PressPublish' },
  { id: 99, name: 'Ultimate Keto Recipe Cookbook', slug: 'ultimate-keto-recipe-cookbook', brand: 'PressPublish', category: 'books', type: 'book', color: '#78350f', accent: '#fbbf24', author: 'PressPublish' },
  { id: 100, name: 'Creative Thinking Work Book', slug: 'creative-thinking-work-book', brand: 'PressPublish', category: 'books', type: 'book', color: '#022c22', accent: '#059669', author: 'PressPublish' },

  { id: 101, name: 'FlexGrip NonSlip Yoga Mat', slug: 'flexgrip-nonslip-yoga-mat', brand: 'FitLife', category: 'sports-outdoors', type: 'mat', color: '#0d9488', accent: '#2dd4bf' },
  { id: 102, name: 'HexDumbbell Weight Set 20lb', slug: 'hexdumbbell-weight-set-20lb', brand: 'FitLife', category: 'sports-outdoors', type: 'dumbbell', color: '#1f2937', accent: '#ef4444' },
  { id: 103, name: 'CampComfort 4-Person Tent', slug: 'campcomfort-4-person-tent', brand: 'FitLife', category: 'sports-outdoors', type: 'tent', color: '#166534', accent: '#4ade80' },
  { id: 104, name: 'TrailBlazer Mountain Bicycle', slug: 'trailblazer-mountain-bicycle', brand: 'FitLife', category: 'sports-outdoors', type: 'bicycle', color: '#7f1d1d', accent: '#f87171' },
  { id: 105, name: 'HydroFlask Stainless Bottle', slug: 'hydroflask-stainless-bottle', brand: 'FitLife', category: 'sports-outdoors', type: 'bottle', color: '#0891b2', accent: '#22d3ee' },
  { id: 106, name: 'AeroSpeed Sports Sunglasses', slug: 'aerospeed-sports-sunglasses', brand: 'FitLife', category: 'sports-outdoors', type: 'sunglasses', color: '#0f172a', accent: '#eab308' },
  { id: 107, name: 'ThermaSleep Outdoor Bag', slug: 'thermasleep-outdoor-bag', brand: 'FitLife', category: 'sports-outdoors', type: 'tent', color: '#134e4a', accent: '#2dd4bf' },
  { id: 108, name: 'FitLife Smart Body Scale', slug: 'fitlife-smart-body-scale', brand: 'FitLife', category: 'sports-outdoors', type: 'scale', color: '#f8fafc', accent: '#cbd5e1' },

  { id: 109, name: 'HydroBoost Hydrating Moisturizer', slug: 'hydroboost-hydrating-moisturizer', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#0ea5e9', accent: '#38bdf8' },
  { id: 110, name: 'AeroSonic Ionic Hair Dryer', slug: 'aerosonic-ionic-hair-dryer', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#86198f', accent: '#f0abfc' },
  { id: 111, name: 'GoldGlow AntiAging Serum', slug: 'goldglow-antiaging-serum', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#78350f', accent: '#fbbf24' },
  { id: 112, name: 'Classic Amber Woody Cologne', slug: 'classic-amber-woody-cologne', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#1e293b', accent: '#94a3b8' },
  { id: 113, name: 'UltraSoft Bamboo Face Wipes', slug: 'ultrasoft-bamboo-face-wipes', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#166534', accent: '#4ade80' },
  { id: 114, name: 'SatinSmooth Curling Wand', slug: 'satinsmooth-curling-wand', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#581c87', accent: '#d8b4fe' },
  { id: 115, name: 'CharcoalDeep Pore Face Scrub', slug: 'charcoaldeep-pore-face-scrub', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#172554', accent: '#fb923c' },
  { id: 116, name: 'Organic Coconut Conditioner', slug: 'organic-coconut-conditioner', brand: 'GlowCare', category: 'beauty-personal-care', type: 'shaver', color: '#065f46', accent: '#34d399' },

  { id: 117, name: 'Settlers of Board Game', slug: 'settlers-of-board-game', brand: 'FunMaker', category: 'toys-games', type: 'boardgame', color: '#7c2d12', accent: '#ea580c' },
  { id: 118, name: '3D Wooden Mechanical Puzzle', slug: '3d-wooden-mechanical-puzzle', brand: 'FunMaker', category: 'toys-games', type: 'boardgame', color: '#1e293b', accent: '#64748b' },
  { id: 119, name: 'AeroQuad Micro Hobby Drone', slug: 'aeroquad-micro-hobby-drone', brand: 'FunMaker', category: 'toys-games', type: 'drone', color: '#0f172a', accent: '#3b82f6' },
  { id: 120, name: 'SmartRobot STEM Coding Kit', slug: 'smartrobot-stem-coding-kit', brand: 'FunMaker', category: 'toys-games', type: 'robot', color: '#1e1b4b', accent: '#818cf8' },
  { id: 121, name: 'RetroArcade Handheld Console', slug: 'retroarcade-handheld-console', brand: 'FunMaker', category: 'toys-games', type: 'console', color: '#7f1d1d', accent: '#ef4444' },
  { id: 122, name: 'Creative Clay Modeling Tub', brand: 'FunMaker', slug: 'creative-clay-modeling-tub', category: 'toys-games', type: 'boardgame', color: '#d97706', accent: '#fbbf24' },
  { id: 123, name: 'SpeedCubing 3x3 Speed Cube', slug: 'speedcubing-3x3-speed-cube', brand: 'FunMaker', category: 'toys-games', type: 'boardgame', color: '#1e293b', accent: '#10b981' },
  { id: 124, name: 'Giant stack Tumble Tower', slug: 'giant-stack-tumble-tower', brand: 'FunMaker', category: 'toys-games', type: 'boardgame', color: '#b45309', accent: '#fbbf24' }
];

// Helper to draw specific SVG components based on type and product parameters
function drawSvg(product) {
  const { name, brand, type, color, accent, author } = product;

  // Background and standard grad setup
  let paths = `<rect width="400" height="225" fill="${color}" rx="8"/>`;
  paths += `<path d="M0 45 L400 45 M0 90 L400 90 M0 135 L400 135 M0 180 L400 180 M80 0 L80 225 M160 0 L160 225 M240 0 L240 225 M320 0 L320 225" stroke="white" stroke-width="1" opacity="0.04" />`;

  // Draw illustrative shapes depending on type
  if (type === 'phone') {
    paths += `
      <!-- Phone body -->
      <rect x="150" y="30" width="100" height="170" rx="14" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <!-- Screen with colorful wallpaper -->
      <rect x="156" y="36" width="88" height="158" rx="8" fill="url(#wallpaperGrad)"/>
      <!-- Camera punch hole -->
      <circle cx="200" cy="46" r="4" fill="#020617"/>
      <!-- Side lock button -->
      <rect x="251" y="70" width="2" height="15" fill="#475569"/>
    `;
  } else if (type === 'laptop') {
    paths += `
      <!-- Screen bezel -->
      <rect x="100" y="40" width="200" height="120" rx="6" fill="#1e293b" stroke="${accent}" stroke-width="3"/>
      <!-- Screen display -->
      <rect x="108" y="48" width="184" height="104" rx="2" fill="url(#wallpaperGrad)"/>
      <!-- Keyboard deck -->
      <path d="M70 160 L330 160 L340 185 C340 190 330 195 320 195 L80 195 C70 195 60 190 60 185 Z" fill="#475569" stroke="#cbd5e1" stroke-width="1"/>
      <!-- Trackpad -->
      <rect x="175" y="175" width="50" height="15" rx="2" fill="#334155"/>
    `;
  } else if (type === 'monitor') {
    paths += `
      <!-- Widescreen curved frame -->
      <rect x="60" y="30" width="280" height="140" rx="6" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <!-- Widescreen active display -->
      <rect x="66" y="36" width="268" height="128" rx="2" fill="url(#wallpaperGrad)"/>
      <!-- Stand base -->
      <path d="M185 170 L215 170 L225 200 L175 200 Z" fill="#475569"/>
      <path d="M140 200 L260 200 L270 210 L130 210 Z" fill="#1e293b"/>
    `;
  } else if (type === 'headphones') {
    paths += `
      <!-- Headband arch -->
      <path d="M125 140 A 75 75 0 0 1 275 140" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>
      <!-- Earcups -->
      <rect x="95" y="115" width="35" height="55" rx="14" fill="#0f172a" stroke="white" stroke-width="2"/>
      <rect x="270" y="115" width="35" height="55" rx="14" fill="#0f172a" stroke="white" stroke-width="2"/>
      <line x1="95" y1="140" x2="105" y2="140" stroke="white" stroke-width="2"/>
      <line x1="295" y1="140" x2="305" y2="140" stroke="white" stroke-width="2"/>
    `;
  } else if (type === 'mouse') {
    paths += `
      <!-- Mouse contours -->
      <path d="M160 150 C160 100 175 80 200 80 C225 80 240 100 240 150 C240 190 225 205 200 205 C175 205 160 190 160 150 Z" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <!-- Clicks separation -->
      <path d="M200 80 L200 130" stroke="#334155" stroke-width="2"/>
      <!-- Scroll wheel glowing -->
      <rect x="196" y="92" width="8" height="22" rx="3" fill="${accent}" opacity="0.9"/>
    `;
  } else if (type === 'keyboard') {
    paths += `
      <!-- Keyboard frame -->
      <rect x="50" y="85" width="300" height="120" rx="8" fill="#1c1917" stroke="${accent}" stroke-width="3"/>
      <!-- Colorful 3D keycaps grid -->
      <rect x="62" y="98" width="40" height="20" rx="2" fill="${accent}" opacity="0.7"/>
      <rect x="107" y="98" width="40" height="20" rx="2" fill="#06b6d4" opacity="0.7"/>
      <rect x="152" y="98" width="40" height="20" rx="2" fill="#10b981" opacity="0.7"/>
      <rect x="197" y="98" width="80" height="20" rx="2" fill="#3b82f6" opacity="0.7"/>
      <rect x="282" y="98" width="40" height="20" rx="2" fill="#ec4899" opacity="0.7"/>
      <rect x="62" y="123" width="30" height="20" rx="2" fill="#eab308" opacity="0.7"/>
      <rect x="97" y="123" width="170" height="20" rx="2" fill="${accent}" opacity="0.8"/> <!-- Spacebar -->
      <rect x="272" y="123" width="40" height="20" rx="2" fill="#10b981" opacity="0.7"/>
    `;
  } else if (type === 'console') {
    paths += `
      <!-- PS5 curved white wings -->
      <path d="M145 45 L125 240 L185 260 L205 55 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
      <path d="M255 45 L275 240 L215 260 L195 55 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Dark middle unit -->
      <path d="M190 55 L200 248 L210 248 L215 55 Z" fill="#020617"/>
      <!-- Cyan glowing led strips -->
      <path d="M193 55 L201 248" stroke="#06b6d4" stroke-width="1.5"/>
      <path d="M212 55 L208 248" stroke="#06b6d4" stroke-width="1.5"/>
    `;
  } else if (type === 'xbox') {
    paths += `
      <!-- Xbox Series X rectangular tower -->
      <rect x="140" y="40" width="120" height="190" rx="4" fill="#0f172a" stroke="${accent}" stroke-width="3"/>
      <!-- Top glowing green grill ventilation -->
      <ellipse cx="200" cy="40" rx="60" ry="10" fill="#052e16" stroke="#22c55e" stroke-width="2"/>
      <!-- Glowing green power button -->
      <circle cx="230" cy="70" r="5" fill="#22c55e"/>
    `;
  } else if (type === 'switch') {
    paths += `
      <!-- Handheld console base screen -->
      <rect x="110" y="60" width="180" height="110" rx="6" fill="#020617" stroke="#334155" stroke-width="3"/>
      <rect x="120" y="68" width="160" height="94" rx="2" fill="url(#wallpaperGrad)"/>
      <!-- Left Red JoyCon -->
      <path d="M80 60 C80 60 110 60 110 60 L110 170 L80 170 C70 170 70 60 80 60 Z" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
      <circle cx="95" cy="85" r="8" fill="#1e293b"/> <!-- stick -->
      <!-- Right Blue JoyCon -->
      <path d="M290 60 C290 60 320 60 320 60 C330 60 330 170 320 170 L290 170 Z" fill="#06b6d4" stroke="#0891b2" stroke-width="1.5"/>
      <circle cx="305" cy="145" r="8" fill="#1e293b"/> <!-- stick -->
    `;
  } else if (type === 'controller') {
    paths += `
      <!-- DualSense Edge horns -->
      <path d="M120 130 C90 130 70 160 70 200 C70 230 100 240 120 220 C140 200 160 200 180 210 L220 210 C240 200 260 200 280 220 C300 240 330 230 330 200 C330 160 310 130 290 130 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
      <!-- Joysticks buttons -->
      <circle cx="165" cy="180" r="16" fill="#1e293b" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="235" cy="180" r="16" fill="#1e293b" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="165" cy="180" r="8" fill="#475569"/>
      <circle cx="235" cy="180" r="8" fill="#475569"/>
      <!-- D-Pad -->
      <rect x="105" y="150" width="20" height="6" rx="1" fill="#1e293b"/>
      <rect x="112" y="143" width="6" height="20" rx="1" fill="#1e293b"/>
    `;
  } else if (type === 'vr') {
    paths += `
      <!-- Curved visor -->
      <rect x="100" y="70" width="200" height="90" rx="25" fill="#f8fafc" stroke="${accent}" stroke-width="3"/>
      <rect x="120" y="85" width="160" height="60" rx="12" fill="#0f172a"/>
      <!-- visors trackers -->
      <circle cx="140" cy="115" r="4" fill="#6366f1"/>
      <circle cx="260" cy="115" r="4" fill="#6366f1"/>
      <!-- straps -->
      <path d="M100 115 L40 115" fill="none" stroke="#475569" stroke-width="10"/>
      <path d="M300 115 L360 115" fill="none" stroke="#475569" stroke-width="10"/>
    `;
  } else if (type === 'powerbank') {
    paths += `
      <!-- Power brick chassis -->
      <rect x="130" y="40" width="140" height="150" rx="10" fill="#1e293b" stroke="${accent}" stroke-width="3"/>
      <!-- Screen readout e.g. 99% -->
      <rect x="160" y="60" width="80" height="35" rx="4" fill="#0f172a" stroke="#cbd5e1" stroke-width="1"/>
      <text x="200" y="83" fill="#22c55e" font-size="16" font-family="monospace" text-anchor="middle" font-weight="bold">99%</text>
      <!-- USB port indicators -->
      <rect x="165" y="110" width="20" height="8" rx="1" fill="#cbd5e1"/>
      <rect x="215" y="110" width="20" height="8" rx="1" fill="#cbd5e1"/>
    `;
  } else if (type === 'watch') {
    paths += `
      <!-- Strap -->
      <rect x="180" y="20" width="40" height="185" rx="4" fill="#334155" stroke="#475569" stroke-width="1"/>
      <!-- Watch body -->
      <rect x="155" y="65" width="90" height="95" rx="20" fill="#0f172a" stroke="${accent}" stroke-width="4"/>
      <!-- Watch Screen UI -->
      <rect x="163" y="73" width="74" height="79" rx="14" fill="url(#wallpaperGrad)"/>
      <circle cx="200" cy="112" r="24" fill="none" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <text x="200" y="117" fill="white" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">10:09</text>
    `;
  } else if (type === 'speaker') {
    paths += `
      <!-- Speaker grill cylinder -->
      <rect x="130" y="40" width="140" height="150" rx="20" fill="#1e293b" stroke="${accent}" stroke-width="4"/>
      <!-- Grid pattern inside speaker -->
      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1.5" fill="#334155"/>
      </pattern>
      <rect x="140" y="50" width="120" height="130" rx="12" fill="url(#grid)"/>
      <!-- Brand highlight band -->
      <rect x="130" y="160" width="140" height="8" fill="${accent}"/>
    `;
  } else if (type === 'ssd') {
    paths += `
      <!-- SSD body -->
      <rect x="130" y="50" width="140" height="130" rx="12" fill="#1e293b" stroke="${accent}" stroke-width="3"/>
      <!-- Carbon texture details -->
      <path d="M140 70 L260 70 M140 100 L260 100 M140 130 L260 130" stroke="#cbd5e1" stroke-width="2" opacity="0.2"/>
      <!-- Loop lock corner -->
      <circle cx="250" cy="70" r="12" fill="none" stroke="${accent}" stroke-width="3"/>
    `;
  } else if (type === 'webcam') {
    paths += `
      <!-- Camera head circular -->
      <circle cx="200" cy="90" r="45" fill="#0f172a" stroke="${accent}" stroke-width="4"/>
      <!-- Aperture lens -->
      <circle cx="200" cy="90" r="22" fill="#1e293b" stroke="white" stroke-width="2"/>
      <circle cx="206" cy="84" r="6" fill="#38bdf8" opacity="0.8"/>
      <!-- Base clip -->
      <path d="M170 135 L230 135 L240 185 L160 185 Z" fill="#334155"/>
      <rect x="150" y="185" width="100" height="10" rx="2" fill="#1e293b"/>
    `;
  } else if (type === 'vacuum') {
    paths += `
      <!-- Cleaner head -->
      <rect x="120" y="170" width="160" height="20" rx="4" fill="#334155" stroke="${accent}" stroke-width="2"/>
      <!-- Stick wand -->
      <line x1="200" y1="70" x2="200" y2="170" stroke="${accent}" stroke-width="6"/>
      <!-- Handheld motor unit -->
      <rect x="180" y="40" width="45" height="40" rx="8" fill="#1e293b" stroke="white" stroke-width="1.5"/>
      <circle cx="210" cy="55" r="10" fill="#a855f7" opacity="0.7"/> <!-- cyclone -->
    `;
  } else if (type === 'blender') {
    paths += `
      <!-- Blender Base -->
      <path d="M150 140 L250 140 L260 200 L140 200 Z" fill="#334155" stroke="${accent}" stroke-width="2"/>
      <!-- Dial button -->
      <circle cx="200" cy="170" r="12" fill="#1e293b" stroke="white" stroke-width="2"/>
      <!-- Glass jar -->
      <path d="M160 50 L240 50 L230 140 L170 140 Z" fill="none" stroke="white" stroke-width="4" opacity="0.6"/>
      <!-- Handle -->
      <path d="M240 70 L265 70 L255 120 L230 120" fill="none" stroke="white" stroke-width="3" opacity="0.6"/>
    `;
  } else if (type === 'airfryer') {
    paths += `
      <!-- Cylindrical cooker chassis -->
      <rect x="130" y="40" width="140" height="150" rx="35" fill="#18181b" stroke="${accent}" stroke-width="3"/>
      <!-- Digital display interface -->
      <ellipse cx="200" cy="70" rx="35" ry="15" fill="#09090b" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="200" cy="70" r="3" fill="#f43f5e"/>
      <!-- Drawer handle -->
      <rect x="185" y="115" width="30" height="50" rx="6" fill="#3f3f46" stroke="white" stroke-width="1"/>
    `;
  } else if (type === 'kettle') {
    paths += `
      <!-- Kettle body -->
      <path d="M150 90 L230 90 L245 180 L135 180 Z" fill="#292524" stroke="${accent}" stroke-width="3"/>
      <!-- Handle -->
      <path d="M140 100 C100 100 100 170 140 170" fill="none" stroke="#292524" stroke-width="8"/>
      <!-- Gooseneck spout -->
      <path d="M240 160 C280 160 280 90 270 80" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
    `;
  } else if (type === 'purifier') {
    paths += `
      <!-- Air purifier cylinder -->
      <rect x="140" y="45" width="120" height="150" rx="20" fill="#f8fafc" stroke="${accent}" stroke-width="3"/>
      <!-- Air intake grill lines -->
      <line x1="160" y1="120" x2="240" y2="120" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="160" y1="135" x2="240" y2="135" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="160" y1="150" x2="240" y2="150" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Top control glow -->
      <ellipse cx="200" cy="45" rx="40" ry="8" fill="#38bdf8" opacity="0.3"/>
    `;
  } else if (type === 'iron') {
    paths += `
      <!-- Steam iron base soleplate -->
      <path d="M100 160 L300 160 C300 160 290 120 200 120 L100 120 Z" fill="#cbd5e1" stroke="${accent}" stroke-width="2"/>
      <!-- Handle grip -->
      <path d="M120 120 L160 80 L260 80 L280 120" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    `;
  } else if (type === 'refrigerator') {
    paths += `
      <!-- Tall fridge chassis -->
      <rect x="140" y="30" width="120" height="175" rx="8" fill="#1e293b" stroke="${accent}" stroke-width="3"/>
      <!-- Double door division -->
      <line x1="140" y1="100" x2="260" y2="100" stroke="#334155" stroke-width="3"/>
      <!-- Handles -->
      <rect x="148" y="70" width="4" height="20" fill="#cbd5e1"/>
      <rect x="148" y="110" width="4" height="20" fill="#cbd5e1"/>
    `;
  } else if (type === 'shoes') {
    paths += `
      <!-- Sneaker silhouette profile -->
      <path d="M100 150 L120 100 L160 100 L210 135 L280 140 L300 180 L90 180 Z" fill="none" stroke="${accent}" stroke-width="3"/>
      <path d="M100 180 L290 180 L290 190 C290 195 100 195 100 190 Z" fill="#cbd5e1"/> <!-- sole -->
      <path d="M210 135 L260 138" stroke="white" stroke-width="2"/> <!-- laces -->
    `;
  } else if (type === 'jacket') {
    paths += `
      <!-- Styled jacket/hoodie hanger shape -->
      <path d="M160 70 L200 50 L240 70 L260 180 L140 180 Z" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
      <path d="M140 85 L100 140 L120 150 L140 110" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
      <path d="M260 85 L300 140 L280 150 L260 110" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
    `;
  } else if (type === 'jeans') {
    paths += `
      <!-- Folded denim jeans -->
      <path d="M150 50 L250 50 L240 190 L202 190 L200 90 L198 190 L160 190 Z" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
    `;
  } else if (type === 'hat') {
    paths += `
      <!-- Beanie shape -->
      <path d="M150 160 C150 90 250 90 250 160 Z" fill="none" stroke="white" stroke-width="3"/>
      <!-- Folded cuff -->
      <rect x="140" y="150" width="120" height="30" rx="4" fill="none" stroke="white" stroke-width="3"/>
    `;
  } else if (type === 'sunglasses') {
    paths += `
      <!-- Glasses lenses -->
      <rect x="110" y="90" width="70" height="50" rx="25" fill="#1e293b" stroke="${accent}" stroke-width="3"/>
      <rect x="220" y="90" width="70" height="50" rx="25" fill="#1e293b" stroke="${accent}" stroke-width="3"/>
      <!-- Bridge -->
      <path d="M180 105 A 20 20 0 0 1 220 105" fill="none" stroke="${accent}" stroke-width="3"/>
    `;
  } else if (type === 'backpack') {
    paths += `
      <!-- Canvas backpack contour -->
      <rect x="130" y="55" width="140" height="135" rx="30" fill="none" stroke="white" stroke-width="3"/>
      <rect x="150" y="130" width="100" height="50" rx="8" fill="none" stroke="white" stroke-width="2"/> <!-- pocket -->
    `;
  } else if (type === 'apparel') {
    paths += `
      <!-- Basic t-shirt hanger vector -->
      <path d="M120 70 L200 45 L280 70 L300 100 L260 110 L260 190 L140 190 L140 110 L100 100 Z" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
    `;
  } else if (type === 'book') {
    // Elegant high-fidelity book cover layout
    paths += `
      <!-- Book spine & cover panel -->
      <rect x="120" y="30" width="170" height="165" rx="3" fill="url(#bookCoverGrad)" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="110" y="30" width="10" height="165" fill="#1c1917"/>
      <!-- Typography -->
      <text x="210" y="70" fill="white" font-size="11" font-weight="900" font-family="Georgia, serif" text-anchor="middle" letter-spacing="1">
        ${name.split(' ').slice(0, 2).join(' ').toUpperCase()}
      </text>
      <text x="210" y="85" fill="white" font-size="9" font-weight="900" font-family="Georgia, serif" text-anchor="middle" letter-spacing="1" opacity="0.9">
        ${name.split(' ').slice(2).join(' ').toUpperCase()}
      </text>
      <!-- Author name -->
      <text x="210" y="115" fill="${accent}" font-size="7" font-weight="800" font-family="sans-serif" text-anchor="middle" letter-spacing="1.5">
        ${author ? author.toUpperCase() : 'AUTHOR'}
      </text>
      <!-- Emblem decorative -->
      <circle cx="210" cy="150" r="16" fill="none" stroke="${accent}" stroke-width="1.5"/>
      <polygon points="210,140 216,150 210,160 204,150" fill="${accent}"/>
    `;
  } else if (type === 'bottle') {
    paths += `
      <!-- Hydroflask insulated bottle outline -->
      <rect x="150" y="60" width="100" height="140" rx="12" fill="none" stroke="white" stroke-width="3"/>
      <!-- Loop handle caps -->
      <rect x="180" y="45" width="40" height="15" rx="4" fill="none" stroke="white" stroke-width="3"/>
    `;
  } else if (type === 'dumbbell') {
    paths += `
      <!-- Textured dumbbell plate weight layout -->
      <rect x="100" y="105" width="200" height="15" rx="4" fill="#cbd5e1"/>
      <rect x="80" y="75" width="20" height="75" rx="3" fill="#1f2937" stroke="white" stroke-width="1.5"/>
      <rect x="300" y="75" width="20" height="75" rx="3" fill="#1f2937" stroke="white" stroke-width="1.5"/>
    `;
  } else if (type === 'tent') {
    paths += `
      <!-- Camping tent profile -->
      <polygon points="200,45 100,185 300,185" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="200,85 160,185 240,185" fill="none" stroke="white" stroke-width="2" opacity="0.6"/> <!-- flaps -->
    `;
  } else if (type === 'bicycle') {
    paths += `
      <!-- Mountain bike frame skeleton -->
      <circle cx="120" cy="150" r="40" fill="none" stroke="white" stroke-width="3"/>
      <circle cx="280" cy="150" r="40" fill="none" stroke="white" stroke-width="3"/>
      <polygon points="120,150 200,150 180,85 140,85" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="280,150 200,150 230,85" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/>
    `;
  } else if (type === 'scale') {
    paths += `
      <!-- Smart body scale floor glass platform -->
      <rect x="110" y="45" width="180" height="145" rx="20" fill="none" stroke="white" stroke-width="3"/>
      <!-- LED weight reading -->
      <rect x="175" y="60" width="50" height="18" rx="2" fill="#0f172a" stroke="white" stroke-width="1"/>
      <text x="200" y="73" fill="${accent}" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">68.2</text>
    `;
  } else if (type === 'shaver') {
    paths += `
      <!-- Premium personal care/beauty cylinder/device shape -->
      <rect x="160" y="55" width="80" height="135" rx="25" fill="none" stroke="white" stroke-width="3"/>
      <ellipse cx="200" cy="55" rx="40" ry="12" fill="none" stroke="white" stroke-width="3"/> <!-- head -->
    `;
  } else if (type === 'lego') {
    paths += `
      <!-- Toy box / LEGO blocks silhouette -->
      <rect x="110" y="50" width="180" height="130" rx="6" fill="none" stroke="white" stroke-width="3"/>
      <circle cx="160" cy="90" r="10" fill="white" opacity="0.3"/>
      <circle cx="240" cy="90" r="10" fill="white" opacity="0.3"/>
      <circle cx="160" cy="140" r="10" fill="white" opacity="0.3"/>
      <circle cx="240" cy="140" r="10" fill="white" opacity="0.3"/>
    `;
  } else if (type === 'boardgame') {
    paths += `
      <!-- Boardgame stylized grid cover box -->
      <rect x="110" y="50" width="180" height="130" rx="8" fill="none" stroke="white" stroke-width="3"/>
      <line x1="200" y1="50" x2="200" y2="180" stroke="white" stroke-width="2" opacity="0.4"/>
      <line x1="110" y1="115" x2="290" y2="115" stroke="white" stroke-width="2" opacity="0.4"/>
      <circle cx="200" cy="115" r="15" fill="none" stroke="white" stroke-width="2" opacity="0.6"/>
    `;
  } else if (type === 'drone') {
    paths += `
      <!-- Quadcopter silhouette -->
      <line x1="130" y1="80" x2="270" y2="150" stroke="white" stroke-width="4"/>
      <line x1="270" y1="80" x2="130" y2="150" stroke="white" stroke-width="4"/>
      <circle cx="200" cy="115" r="16" fill="none" stroke="white" stroke-width="3"/>
      <circle cx="130" cy="80" r="12" fill="none" stroke="${accent}" stroke-width="2"/>
      <circle cx="270" cy="80" r="12" fill="none" stroke="${accent}" stroke-width="2"/>
    `;
  } else if (type === 'robot') {
    paths += `
      <!-- Stem Robot outline -->
      <rect x="160" y="55" width="80" height="70" rx="8" fill="none" stroke="white" stroke-width="3"/> <!-- head -->
      <rect x="150" y="130" width="100" height="60" rx="10" fill="none" stroke="white" stroke-width="3"/> <!-- body -->
      <!-- Eyes -->
      <circle cx="185" cy="85" r="6" fill="${accent}"/>
      <circle cx="215" cy="85" r="6" fill="${accent}"/>
    `;
  } else if (type === 'chair') {
    paths += `
      <!-- Gaming chair outline -->
      <path d="M150 40 L250 40 L240 140 L160 140 Z" fill="none" stroke="white" stroke-width="3"/> <!-- back -->
      <rect x="140" y="140" width="120" height="15" rx="3" fill="none" stroke="white" stroke-width="3"/> <!-- seat -->
      <line x1="200" y1="155" x2="200" y2="200" stroke="white" stroke-width="4"/> <!-- base stem -->
    `;
  } else if (type === 'mat') {
    paths += `
      <!-- Rolled up mat layout -->
      <ellipse cx="140" cy="115" rx="12" ry="30" fill="none" stroke="white" stroke-width="2"/>
      <rect x="140" y="85" width="150" height="60" fill="none" stroke="white" stroke-width="2"/>
    `;
  }

  // Label at bottom
  paths += `
    <text x="24" y="210" fill="white" font-size="10" font-family="sans-serif" font-weight="bold" opacity="0.3">${brand.toUpperCase()}</text>
  `;

  // Final SVG wrapping
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" width="100%" height="100%">
    <defs>
      <linearGradient id="wallpaperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: ${accent}; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: ${color}; stop-opacity: 1" />
      </linearGradient>
      <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: ${color}; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #1c1917; stop-opacity: 1" />
      </linearGradient>
    </defs>
    ${paths}
  </svg>`;
}

// Generate the directories recursively
const assetsDir = path.join(__dirname, 'frontend', 'public', 'assets', 'products');
const categories = [
  'electronics',
  'gaming',
  'home-appliances',
  'fashion',
  'books',
  'sports-outdoors',
  'beauty-personal-care',
  'toys-games'
];

categories.forEach(cat => {
  const catDir = path.join(assetsDir, cat);
  fs.mkdirSync(catDir, { recursive: true });
});

// Write the files
PRODUCTS.forEach(p => {
  const filePath = path.join(assetsDir, p.category, `${p.slug}.svg`);
  const content = drawSvg(p);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Generated: ${p.category}/${p.slug}.svg`);
});

console.log('All product image assets generated successfully!');
