/**
 * Product Search Template
 * 
 * This template provides a customizable framework for searching products
 * in your Shopify store. Adapt the search terms and strategies to match
 * your specific product categories and naming conventions.
 * 
 * Usage:
 * 1. Copy this file to scripts/search/
 * 2. Rename to match your product category (e.g., search_electronics.js)
 * 3. Customize the search terms and strategies below
 * 4. Run: node scripts/search/your_search_script.js
 */

require('dotenv').config();

// ===========================================
// CONFIGURATION - CUSTOMIZE FOR YOUR STORE
// ===========================================

const STORE_CONFIG = {
    // Your store's API credentials
    token: process.env.SHOPIFY_TOKEN,
    shop: process.env.SHOPIFY_SHOP_NAME,
    apiVersion: process.env.SHOPIFY_API_VERSION || '2023-10'
};

// Define your product search terms
const SEARCH_TERMS = [
    // Primary product names
    'your-main-product',
    'product-category',
    'brand-specific-term',
    
    // Alternative spellings and variations
    'product-variant',
    'alternative-name',
    'common-misspelling',
    
    // Product types and categories
    'product-type',
    'category-name',
    'subcategory',
    
    // Add your specific search terms here
    // Example for electronics store:
    // 'smartphone', 'phone', 'mobile',
    // 'laptop', 'computer', 'notebook',
    // 'tablet', 'ipad', 'android'
];

// Define search strategies to use
const SEARCH_STRATEGIES = {
    titleBased: true,        // Search in product titles
    handleBased: true,       // Search in product handles (URLs)
    descriptionBased: true,  // Search in product descriptions
    variantBased: true,      // Search in variant titles
    collectionBased: false,  // Search in collection names
    tagBased: false,         // Search in product tags
    vendorBased: false       // Search in vendor names
};

// Output configuration
const OUTPUT_CONFIG = {
    outputFile: 'data/products/your_category_products.json',
    logFile: 'logs/your_category_search.log',
    includeMissingAltText: true,
    includeExistingAltText: false
};

// ===========================================
// SEARCH IMPLEMENTATION
// ===========================================

const https = require('https');
const fs = require('fs');
const path = require('path');

// Ensure output directories exist
const dataDir = path.dirname(OUTPUT_CONFIG.outputFile);
const logDir = path.dirname(OUTPUT_CONFIG.logFile);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    if (OUTPUT_CONFIG.logFile) {
        fs.appendFileSync(OUTPUT_CONFIG.logFile, logMessage + '\n');
    }
}

// API helper function
function makeShopifyRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: `${STORE_CONFIG.shop}.myshopify.com`,
            path: `/admin/api/${STORE_CONFIG.apiVersion}${endpoint}`,
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': STORE_CONFIG.token,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Product search function
async function searchProducts() {
    log('Starting product search...');
    const foundProducts = [];
    const processedIds = new Set();

    try {
        // Strategy 1: Title-based search
        if (SEARCH_STRATEGIES.titleBased) {
            log('Executing title-based search...');
            for (const term of SEARCH_TERMS) {
                const response = await makeShopifyRequest(`/products.json?title=${encodeURIComponent(term)}&limit=250`);
                if (response.products) {
                    response.products.forEach(product => {
                        if (!processedIds.has(product.id)) {
                            foundProducts.push(product);
                            processedIds.add(product.id);
                        }
                    });
                }
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, parseInt(process.env.API_RATE_LIMIT_DELAY) || 1000));
            }
        }

        // Strategy 2: Handle-based search
        if (SEARCH_STRATEGIES.handleBased) {
            log('Executing handle-based search...');
            // Implementation for handle-based search
            // Add your specific logic here
        }

        // Add more search strategies as needed

        log(`Found ${foundProducts.length} unique products`);
        return foundProducts;

    } catch (error) {
        log(`Error during search: ${error.message}`);
        throw error;
    }
}

// Filter products based on alt text requirements
function filterProducts(products) {
    log('Filtering products based on alt text requirements...');
    
    const needsAltText = [];
    const hasAltText = [];

    products.forEach(product => {
        let productNeedsUpdate = false;
        const productData = {
            id: product.id,
            title: product.title,
            handle: product.handle,
            images: product.images.map(image => ({
                id: image.id,
                alt: image.alt,
                src: image.src,
                needsUpdate: !image.alt || image.alt.trim() === '' || image.alt === 'Image'
            }))
        };

        if (productData.images.some(img => img.needsUpdate)) {
            productNeedsUpdate = true;
        }

        if (productNeedsUpdate && OUTPUT_CONFIG.includeMissingAltText) {
            needsAltText.push(productData);
        } else if (!productNeedsUpdate && OUTPUT_CONFIG.includeExistingAltText) {
            hasAltText.push(productData);
        }
    });

    log(`Products needing alt text: ${needsAltText.length}`);
    log(`Products with alt text: ${hasAltText.length}`);

    return { needsAltText, hasAltText };
}

// Main execution function
async function main() {
    try {
        log('='.repeat(50));
        log('SHOPIFY ALT TEXT AUTOMATION - PRODUCT SEARCH');
        log('='.repeat(50));
        log(`Store: ${STORE_CONFIG.shop}`);
        log(`Search terms: ${SEARCH_TERMS.length} terms`);
        log(`Output file: ${OUTPUT_CONFIG.outputFile}`);

        // Search for products
        const products = await searchProducts();

        // Filter products
        const filtered = filterProducts(products);

        // Save results
        const results = {
            searchConfig: {
                terms: SEARCH_TERMS,
                strategies: SEARCH_STRATEGIES,
                timestamp: new Date().toISOString()
            },
            summary: {
                totalFound: products.length,
                needingAltText: filtered.needsAltText.length,
                hasAltText: filtered.hasAltText.length
            },
            products: filtered.needsAltText.length > 0 ? filtered.needsAltText : filtered.hasAltText
        };

        fs.writeFileSync(OUTPUT_CONFIG.outputFile, JSON.stringify(results, null, 2));
        log(`Results saved to: ${OUTPUT_CONFIG.outputFile}`);

        log('='.repeat(50));
        log('SEARCH COMPLETE');
        log('='.repeat(50));

    } catch (error) {
        log(`FATAL ERROR: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { searchProducts, filterProducts };

/**
 * CUSTOMIZATION NOTES:
 * 
 * 1. Search Terms:
 *    - Add your specific product names, categories, and variations to SEARCH_TERMS
 *    - Include common misspellings and alternative names
 *    - Consider different languages if applicable
 * 
 * 2. Search Strategies:
 *    - Enable/disable strategies based on your needs
 *    - titleBased: Most common, searches product titles
 *    - handleBased: Searches URL handles (product-name format)
 *    - descriptionBased: Searches product descriptions (slower)
 * 
 * 3. Output Configuration:
 *    - Change outputFile to match your category name
 *    - Set includeMissingAltText: true to find products needing updates
 *    - Set includeExistingAltText: true to audit existing alt text
 * 
 * 4. Rate Limiting:
 *    - Adjust API_RATE_LIMIT_DELAY in your .env file
 *    - Default 1000ms (1 second) between requests is safe
 * 
 * 5. Advanced Features:
 *    - Add collection-based search for specific product categories
 *    - Implement tag-based search for organized inventories
 *    - Add vendor-based search for multi-vendor stores
 */