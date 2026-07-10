package com.pulsecart.config;

import com.pulsecart.model.Category;
import com.pulsecart.model.Product;
import com.pulsecart.model.User;
import com.pulsecart.model.UserInteraction;
import com.pulsecart.repository.CategoryRepository;
import com.pulsecart.repository.ProductRepository;
import com.pulsecart.repository.UserRepository;
import com.pulsecart.repository.InteractionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InteractionRepository interactionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() > 0) {
            logger.info("Products database already seeded. Skipping product seeder.");
            return;
        }

        logger.info("Starting product database seeder. Populating 64 catalog products...");

        // Ensure categories exist
        Category electronics = getOrCreateCategory("Electronics", "electronics", "Laptops, smartphones, and smart devices");
        Category gaming = getOrCreateCategory("Gaming", "gaming", "Consoles, video games, and gaming peripherals");
        Category appliances = getOrCreateCategory("Home Appliances", "home-appliances", "Refrigerators, blenders, and smart home appliances");
        Category fashion = getOrCreateCategory("Fashion", "fashion", "Shirts, hoodies, shoes, and luxury accessories");
        Category books = getOrCreateCategory("Books", "books", "Novels, tech books, and educational guides");
        Category sports = getOrCreateCategory("Sports & Outdoors", "sports-outdoors", "Gym gear, outdoor tents, and athletic equipment");
        Category beauty = getOrCreateCategory("Beauty & Personal Care", "beauty-personal-care", "Moisturizers, colognes, and hair accessories");
        Category toys = getOrCreateCategory("Toys & Games", "toys-games", "Board games, action figures, and hobby drones");

        List<Product> seedProducts = new ArrayList<>();

        // --- Electronics (8 items) ---
        seedProducts.add(createProd("PulsePro Laptop 15", "pulsepro-laptop-15", "High performance 15-inch development laptop.", "PulsePro Laptop", electronics, "ApexTech", 1299.99, 1199.99, 15, "https://images.unsplash.com/photo-1496181130207-89941d3948d2?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("ApexBuds Wireless Headphones", "apexbuds-wireless-headphones", "Active noise cancelling premium audio buds.", "ApexBuds ANC", electronics, "ApexTech", 199.99, 149.99, 50, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("SmartBand Pulse 4", "smartband-pulse-4", "OLED display fitness and heart rate monitor tracker.", "Pulse SmartBand", electronics, "FitLife", 99.99, 79.99, 120, "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("AeroCharge MagSafe Charger", "aerocharge-magsafe-charger", "15W fast wireless magnetic charger stand.", "AeroCharge Stand", electronics, "ChargeGrid", 49.99, null, 200, "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("NovaCam 4K Web Camera", "novacam-4k-web-camera", "High fidelity 4K web camera with built-in mic.", "NovaCam 4K", electronics, "CamNova", 89.99, 69.99, 45, "https://images.unsplash.com/photo-1603184017905-b4bf0ac489b1?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("VividView 27-inch Monitor", "vividview-27-inch-monitor", "IPS 144Hz frameless gaming and office monitor.", "VividView 27", electronics, "ViewMatrix", 249.99, null, 30, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("SoundCore Bluetooth Speaker", "soundcore-bluetooth-speaker", "IPX7 waterproof portable speaker with deep bass.", "SoundCore Speaker", electronics, "Acoustics", 59.99, 49.99, 85, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("TitanDrive 2TB External SSD", "titandrive-2tb-external-ssd", "USB 3.2 solid state hard drive with encryption.", "TitanDrive SSD", electronics, "StoragePlus", 179.99, 159.99, 3, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400"));

        // --- Gaming (8 items) ---
        seedProducts.add(createProd("ProGamer Mechanical Keyboard", "progamer-mechanical-keyboard", "RGB backlit linear switches mechanical keyboard.", "ProGamer Keyboard", gaming, "GearSet", 129.99, 99.99, 40, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("ViperStrike Gaming Mouse", "viperstrike-gaming-mouse", "Ultra-lightweight 16000 DPI wireless gaming mouse.", "ViperStrike Mouse", gaming, "GearSet", 79.99, 59.99, 70, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("QuestVR Headset Prime", "questvr-headset-prime", "Standalone virtual reality headset with controllers.", "QuestVR Prime", gaming, "QuestTech", 499.99, 449.99, 12, "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("GamerHeadset Surround 7.1", "gamerheadset-surround-7.1", "Surround sound gaming headset with boom mic.", "GamerHeadset 7.1", gaming, "SoundStorm", 69.99, 54.99, 90, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("Console Stand Dual Charging", "console-stand-dual-charging", "Controller charging dock station with fans.", "Dual Charger Stand", gaming, "PowerUp", 29.99, 24.99, 150, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("AeroSeat Ergonomic Gaming Chair", "aeroseat-ergonomic-gaming-chair", "High-back PU leather chair with neck lumbar cushion.", "AeroSeat Chair", gaming, "FitLife", 219.99, 189.99, 8, "https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("CyberArena XL Gaming Mat", "cyberarena-xl-gaming-mat", "Stitched edges extended cloth gaming mousepad.", "CyberArena Mat", gaming, "GearSet", 19.99, 14.99, 300, "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("StrikePad Wireless Controller", "strikepad-wireless-controller", "Bluetooth gamepad controller for PC and console.", "StrikePad Controller", gaming, "PowerUp", 59.99, null, 65, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=80&w=400"));

        // --- Home Appliances (8 items) ---
        seedProducts.add(createProd("NutriBlend HighSpeed Mixer", "nutriblend-highspeed-mixer", "1200W high-speed professional blender pitcher.", "NutriBlend Mixer", appliances, "KitchPro", 119.99, 99.99, 30, "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("BrewMaster Coffee Station", "brewmaster-coffee-station", "Programmable drip coffee maker with thermal carafe.", "BrewMaster Station", appliances, "KitchPro", 89.99, 74.99, 45, "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("AeroPure HEPA Air Purifier", "aeropure-hepa-air-purifier", "3-stage filtration quiet bedroom air cleaner.", "AeroPure HEPA", appliances, "PureAir", 149.99, 129.99, 20, "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("CrispAir Smart Air Fryer", "crispair-smart-air-fryer", "5.8QT oil-less hot air convection cooker oven.", "CrispAir Fryer", appliances, "KitchPro", 109.99, 89.99, 60, "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("SmartSweep Robotic Vacuum", "smartsweep-robotic-vacuum", "Wi-Fi smart mapping robot vacuum cleaner.", "SmartSweep Robot", appliances, "CleanTech", 249.99, 199.99, 10, "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("IronSteam Cordless Iron", "ironsteam-cordless-iron", "1500W cordless steam iron with ceramic soleplate.", "IronSteam Iron", appliances, "CleanTech", 49.99, 39.99, 80, "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("AquaFlow Countertop Filter", "aquaflow-countertop-filter", "5-stage drinking water purifier dispenser.", "AquaFlow Dispenser", appliances, "PureAir", 79.99, null, 110, "https://images.unsplash.com/photo-1609842947419-ba4f7577884d?auto=format&fit=crop&q=80&w=400"));
        seedProducts.add(createProd("ChillFreeze Portable Refrigerator", "chillfreeze-portable-refrigerator", "Mini cooler and warming fridge for bedroom.", "ChillFreeze Mini", appliances, "KitchPro", 69.99, 59.99, 5, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400"));

        // Add 5 more categories with 8 products each to total 64 products
        // Let's loop and populate to save space, but make them premium and realistic!
        
        // --- Fashion (8 items) ---
        String[] fashionNames = {"UrbanFit Hooded Sweatshirt", "MetroFit Slim Jeans", "ActiveWalk Running Shoes", "SunShield Polarized Sunglasses", "Classic Leather Wrist Watch", "Vanguard Canvas Backpack", "AllWeather Waterproof Jacket", "ComfortSoft Cotton T-Shirts"};
        double[] fashionPrices = {49.99, 59.99, 89.99, 29.99, 149.99, 39.99, 99.99, 24.99};
        for (int i = 0; i < 8; i++) {
            seedProducts.add(createProd(fashionNames[i], fashionNames[i].toLowerCase().replace(" ", "-"), "Premium fashion item for daily comfort.", fashionNames[i].substring(0, 10), fashion, "TrendWear", fashionPrices[i], fashionPrices[i] * 0.85, 40 + i, "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400"));
        }

        // --- Books (8 items) ---
        String[] bookNames = {"Mastering Spring Boot 3.0", "Clean Code Architecture Guide", "Algorithms and Data Structures", "The Psychology of Success", "Introduction to Quantum Computing", "The Infinite Mystery Novel", "Ultimate Keto Recipe Cookbook", "Creative Thinking Work Book"};
        double[] bookPrices = {54.99, 44.99, 49.99, 19.99, 59.99, 14.99, 24.99, 12.99};
        for (int i = 0; i < 8; i++) {
            seedProducts.add(createProd(bookNames[i], bookNames[i].toLowerCase().replace(" ", "-"), "Invaluable book to expand your knowledge base.", bookNames[i].substring(0, 8), books, "PressPublish", bookPrices[i], null, 100 + i, "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"));
        }

        // --- Sports & Outdoors (8 items) ---
        String[] sportsNames = {"FlexGrip NonSlip Yoga Mat", "HexDumbbell Weight Set 20lb", "CampComfort 4-Person Tent", "TrailBlazer Mountain Bicycle", "HydroFlask Stainless Bottle", "AeroSpeed Sports Sunglasses", "ThermaSleep Outdoor Bag", "FitLife Smart Body Scale"};
        double[] sportsPrices = {29.99, 49.99, 119.99, 349.99, 34.99, 19.99, 59.99, 39.99};
        for (int i = 0; i < 8; i++) {
            seedProducts.add(createProd(sportsNames[i], sportsNames[i].toLowerCase().replace(" ", "-"), "Durable outdoor sports equipment designed for longevity.", sportsNames[i].substring(0, 8), sports, "FitLife", sportsPrices[i], sportsPrices[i] * 0.9, 15 + i, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400"));
        }

        // --- Beauty & Personal Care (8 items) ---
        String[] beautyNames = {"HydroBoost Hydrating Moisturizer", "AeroSonic Ionic Hair Dryer", "GoldGlow AntiAging Serum", "Classic Amber Woody Cologne", "UltraSoft Bamboo Face Wipes", "SatinSmooth Curling Wand", "CharcoalDeep Pore Face Scrub", "Organic Coconut Conditioner"};
        double[] beautyPrices = {18.99, 79.99, 24.99, 45.00, 9.99, 39.99, 12.99, 14.99};
        for (int i = 0; i < 8; i++) {
            seedProducts.add(createProd(beautyNames[i], beautyNames[i].toLowerCase().replace(" ", "-"), "Self-care product formulated with high quality components.", beautyNames[i].substring(0, 9), beauty, "GlowCare", beautyPrices[i], null, 80 + i, "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=400"));
        }

        // --- Toys & Games (8 items) ---
        String[] toyNames = {"Settlers of Board Game", "3D Wooden Mechanical Puzzle", "AeroQuad Micro Hobby Drone", "SmartRobot STEM Coding Kit", "RetroArcade Handheld Console", "Creative Clay Modeling Tub", "SpeedCubing 3x3 Speed Cube", "Giant stack Tumble Tower"};
        double[] toyPrices = {39.99, 29.99, 69.99, 89.99, 34.99, 15.99, 11.99, 24.99};
        for (int i = 0; i < 8; i++) {
            seedProducts.add(createProd(toyNames[i], toyNames[i].toLowerCase().replace(" ", "-"), "Interactive toy that makes a wonderful gift for any age.", toyNames[i].substring(0, 9), toys, "FunMaker", toyNames[i].contains("Drone") ? 69.99 : toyPrices[i], null, 50 + i, "https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?auto=format&fit=crop&q=80&w=400"));
        }

        productRepository.saveAll(seedProducts);
        logger.info("Database seeding complete. Seeded {} products successfully.", seedProducts.size());

        // --- Simulate Initial interactions to populate recommendations instantly! (REQ-08/REQ-09) ---
        User customer = userRepository.findByEmail("customer@pulsecart.com").orElse(null);
        if (customer != null) {
            logger.info("Simulating initial views and cart actions for customer@pulsecart.com...");
            
            // Fetch first few products of Electronics & Gaming
            Product laptop = productRepository.findBySlug("pulsepro-laptop-15").orElse(null);
            Product headphones = productRepository.findBySlug("apexbuds-wireless-headphones").orElse(null);
            Product keyboard = productRepository.findBySlug("progamer-mechanical-keyboard").orElse(null);

            if (laptop != null) {
                interactionRepository.save(new UserInteraction(null, customer, laptop, "PRODUCT_VIEW", 1));
                interactionRepository.save(new UserInteraction(null, customer, laptop, "ADD_TO_CART", 3));
            }
            if (headphones != null) {
                interactionRepository.save(new UserInteraction(null, customer, headphones, "PRODUCT_VIEW", 1));
            }
            if (keyboard != null) {
                interactionRepository.save(new UserInteraction(null, customer, keyboard, "PRODUCT_VIEW", 1));
            }
            logger.info("Sample interactions seeded successfully.");
        }
    }

    private Category getOrCreateCategory(String name, String slug, String description) {
        return categoryRepository.findBySlug(slug)
                .orElseGet(() -> {
                    Category category = new Category();
                    category.setName(name);
                    category.setSlug(slug);
                    category.setDescription(description);
                    return categoryRepository.save(category);
                });
    }

    private Product createProd(String name, String slug, String desc, String shortDesc, Category category, String brand, double price, Double discountPrice, int stock, String imageUrl) {
        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setDescription(desc);
        p.setShortDescription(shortDesc);
        p.setCategory(category);
        p.setBrand(brand);
        p.setPrice(BigDecimal.valueOf(price));
        p.setDiscountPrice(discountPrice != null ? BigDecimal.valueOf(discountPrice) : null);
        p.setStockQuantity(stock);
        // Map seed image to local SVG asset
        p.setImageUrl("/assets/products/" + category.getSlug() + "/" + slug + ".svg");
        p.setActive(true);
        p.setAverageRating(0.0);
        p.setReviewCount(0);
        return p;
    }
}
