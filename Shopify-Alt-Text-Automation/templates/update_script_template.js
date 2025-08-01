/**
 * Product Update Template for Alt Text Automation
 * 
 * This template provides a customizable framework for updating alt text
 * across your Shopify product images. Adapt the configuration and alt text
 * generation logic to match your specific brand and product requirements.
 * 
 * Usage:
 * 1. Copy this file to scripts/update/
 * 2. Rename to match your category (e.g., update_electronics_alt_text.js)
 * 3. Customize the configuration and alt text generation logic
 * 4. Test with a small batch first
 * 5. Run: node scripts/update/your_update_script.js
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

const UPDATE_CONFIG = {
    // Source data file (from your search script)
    inputFile: 'data/products/your_category_products.json',
    
    // Output files
    resultsFile: 'results/updates/your_category_update_results.json',
    backupFile: 'backups/your_category_backup.json',
    logFile: 'logs/your_category_updates.log',
    
    // Safety settings
    maxUpdatesPerRun: 50,           // Limit updates per execution
    confirmBeforeUpdate: true,      // Require confirmation before updating
    createBackup: true,             // Create backup before updates
    testMode: false,                // Set to true for dry run (no actual updates)
    
    // Rate limiting
    delayBetweenUpdates: parseInt(process.env.API_RATE_LIMIT_DELAY) || 1000,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3
};

const BRAND_CONFIG = {
    // Your brand name and formatting
    brandName: process.env.BRAND_NAME || 'Your Brand',
    
    // Alt text format templates
    // Available variables: {productName}, {brandName}, {variant}, {color}, {size}
    defaultFormat: '{productName} - {brandName}',
    variantFormat: '{productName} - {variant} - {brandName}',
    
    // Custom formatting rules for specific product types
    customFormats: {
        // Example custom formats - adapt to your products
        'electronics': '{productName} - {variant} - {brandName}',
        'clothing': '{productName} - {color} {size} - {brandName}',
        'accessories': '{productName} - {brandName}',
        // Add your specific product type formats here
    }
};

// ===========================================
// ALT TEXT GENERATION LOGIC
// ===========================================

/**
 * Generate alt text for a product image
 * CUSTOMIZE THIS FUNCTION FOR YOUR SPECIFIC NEEDS
 */
function generateAltText(product, image, imageIndex = 0) {
    try {
        // Extract product information
        const productName = cleanProductName(product.title);
        const { brandName } = BRAND_CONFIG;
        
        // Determine if this is a variant-specific image
        const variant = extractVariantInfo(product, image, imageIndex);
        
        // Determine product category for custom formatting
        const category = determineProductCategory(product);
        
        // Select appropriate format
        let format = BRAND_CONFIG.defaultFormat;
        
        if (variant && variant !== productName) {
            format = BRAND_CONFIG.variantFormat;
        }
        
        if (BRAND_CONFIG.customFormats[category]) {
            format = BRAND_CONFIG.customFormats[category];
        }
        
        // Generate alt text using the selected format
        let altText = format
            .replace('{productName}', productName)
            .replace('{brandName}', brandName)
            .replace('{variant}', variant || '')
            .replace('{color}', extractColor(product, variant))
            .replace('{size}', extractSize(product, variant));
        
        // Clean up the generated text
        altText = altText
            .replace(/\s+/g, ' ')           // Remove extra spaces
            .replace(/\s-\s-/g, ' -')       // Remove double dashes
            .replace(/^-\s|\s-$/g, '')      // Remove leading/trailing dashes
            .trim();
        
        return altText;
        
    } catch (error) {
        console.error(`Error generating alt text for product ${product.id}:`, error);
        return `${cleanProductName(product.title)} - ${BRAND_CONFIG.brandName}`;
    }
}

/**
 * Clean and normalize product names
 * CUSTOMIZE THIS FUNCTION FOR YOUR NAMING CONVENTIONS
 */
function cleanProductName(title) {
    return title
        // Remove common prefixes/suffixes that shouldn't be in alt text
        .replace(/^(New|Sale|Featured|Hot)\s+/i, '')
        .replace(/\s+(New|Sale|Featured|Hot)$/i, '')
        
        // Remove special characters that don't belong in alt text
        .replace(/[<>{}]/g, '')
        
        // Normalize spacing
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract variant information from product
 * CUSTOMIZE THIS FUNCTION FOR YOUR VARIANT STRUCTURE
 */
function extractVariantInfo(product, image, imageIndex) {
    // Strategy 1: Check if product has variants with specific images
    if (product.variants && product.variants.length > 1) {
        // Look for variant that might correspond to this image
        const variant = product.variants.find(v => 
            v.image_id === image.id || 
            (imageIndex > 0 && product.variants[imageIndex - 1])
        );
        
        if (variant && variant.title !== 'Default Title') {
            return variant.title;
        }
    }
    
    // Strategy 2: Extract from product title
    const titleVariants = extractVariantsFromTitle(product.title);
    if (titleVariants.length > imageIndex) {
        return titleVariants[imageIndex];
    }
    
    return null;
}

/**
 * Extract variants from product title
 * CUSTOMIZE THIS FUNCTION FOR YOUR TITLE FORMAT
 */
function extractVariantsFromTitle(title) {
    const variants = [];
    
    // Example patterns - adapt to your title formats
    const patterns = [
        /\b(\d+mm|\d+cm|\d+inch)\b/gi,     // Sizes: 10mm, 5cm, 12inch
        /\b(small|medium|large|xl|xxl)\b/gi, // Clothing sizes
        /\b(red|blue|green|yellow|black|white|grey|gray)\b/gi, // Colors
        /\b(v\d+|\d+\.\d+)\b/gi,           // Versions: v2, 1.5
    ];
    
    patterns.forEach(pattern => {
        const matches = title.match(pattern);
        if (matches) {
            variants.push(...matches);
        }
    });
    
    return [...new Set(variants)]; // Remove duplicates
}

/**
 * Determine product category for custom formatting
 * CUSTOMIZE THIS FUNCTION FOR YOUR CATEGORIES
 */
function determineProductCategory(product) {
    const title = product.title.toLowerCase();
    const handle = product.handle.toLowerCase();
    
    // Define your category keywords
    const categories = {
        'electronics': ['phone', 'laptop', 'tablet', 'computer', 'electronic'],
        'clothing': ['shirt', 'pants', 'dress', 'jacket', 'clothing', 'apparel'],
        'accessories': ['bag', 'wallet', 'belt', 'watch', 'accessory'],
        'tools': ['wrench', 'hammer', 'screwdriver', 'tool'],
        // Add your specific categories here
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => title.includes(keyword) || handle.includes(keyword))) {
            return category;
        }
    }
    
    return 'default';
}

/**
 * Extract color information
 * CUSTOMIZE THIS FUNCTION FOR YOUR COLOR VARIANTS
 */
function extractColor(product, variant) {
    const searchText = `${product.title} ${variant || ''}`.toLowerCase();
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'grey', 'gray', 'pink', 'purple'];
    
    return colors.find(color => searchText.includes(color)) || '';
}

/**
 * Extract size information
 * CUSTOMIZE THIS FUNCTION FOR YOUR SIZE VARIANTS
 */
function extractSize(product, variant) {
    const searchText = `${product.title} ${variant || ''}`.toLowerCase();
    const sizePatterns = [
        /\b(xs|s|m|l|xl|xxl|xxxl)\b/,
        /\b(\d+mm|\d+cm|\d+inch)\b/,
        /\b(small|medium|large)\b/
    ];
    
    for (const pattern of sizePatterns) {
        const match = searchText.match(pattern);
        if (match) return match[1];
    }
    
    return '';
}

// ===========================================
// API AND UPDATE LOGIC
// ===========================================

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Ensure output directories exist
[UPDATE_CONFIG.resultsFile, UPDATE_CONFIG.backupFile, UPDATE_CONFIG.logFile].forEach(file => {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Logging function
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    
    if (UPDATE_CONFIG.logFile) {
        fs.appendFileSync(UPDATE_CONFIG.logFile, logMessage + '\n');
    }
}

// API helper functions
function makeShopifyRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: `${STORE_CONFIG.shop}.myshopify.com`,
            path: `/admin/api/${STORE_CONFIG.apiVersion}${endpoint}`,
            method: method,
            headers: {
                'X-Shopify-Access-Token': STORE_CONFIG.token,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`API Error ${res.statusCode}: ${responseData}`));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Update product images with new alt text
async function updateProductImages(product, updates) {
    const updatedImages = [];
    
    for (const update of updates) {
        try {
            const updateData = {
                product: {
                    id: product.id,
                    images: [
                        {
                            id: update.imageId,
                            alt: update.newAltText
                        }
                    ]
                }
            };
            
            if (!UPDATE_CONFIG.testMode) {
                await makeShopifyRequest(`/products/${product.id}.json`, 'PUT', updateData);
                log(`✅ Updated image ${update.imageId}: "${update.newAltText}"`);
            } else {
                log(`🧪 TEST MODE - Would update image ${update.imageId}: "${update.newAltText}"`);
            }
            
            updatedImages.push({
                imageId: update.imageId,
                oldAltText: update.oldAltText,
                newAltText: update.newAltText,
                success: true,
                timestamp: new Date().toISOString()
            });
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, UPDATE_CONFIG.delayBetweenUpdates));
            
        } catch (error) {
            log(`❌ Failed to update image ${update.imageId}: ${error.message}`, 'ERROR');
            updatedImages.push({
                imageId: update.imageId,
                oldAltText: update.oldAltText,
                newAltText: update.newAltText,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    return updatedImages;
}

// Main execution function
async function main() {
    try {
        log('='.repeat(60));
        log('SHOPIFY ALT TEXT AUTOMATION - PRODUCT UPDATES');
        log('='.repeat(60));
        log(`Store: ${STORE_CONFIG.shop}`);
        log(`Brand: ${BRAND_CONFIG.brandName}`);
        log(`Test Mode: ${UPDATE_CONFIG.testMode ? 'ENABLED' : 'DISABLED'}`);
        log(`Max Updates: ${UPDATE_CONFIG.maxUpdatesPerRun}`);

        // Load product data
        if (!fs.existsSync(UPDATE_CONFIG.inputFile)) {
            throw new Error(`Input file not found: ${UPDATE_CONFIG.inputFile}`);
        }
        
        const inputData = JSON.parse(fs.readFileSync(UPDATE_CONFIG.inputFile, 'utf8'));
        const products = inputData.products || inputData;
        
        log(`Loaded ${products.length} products from ${UPDATE_CONFIG.inputFile}`);

        // Prepare updates
        const updates = [];
        for (const product of products) {
            const productUpdates = [];
            
            product.images.forEach((image, index) => {
                if (image.needsUpdate || !image.alt || image.alt.trim() === '' || image.alt === 'Image') {
                    const newAltText = generateAltText(product, image, index);
                    productUpdates.push({
                        imageId: image.id,
                        oldAltText: image.alt || '',
                        newAltText: newAltText
                    });
                }
            });
            
            if (productUpdates.length > 0) {
                updates.push({
                    product: product,
                    updates: productUpdates
                });
            }
        }

        log(`Prepared ${updates.length} products for update`);
        
        // Limit updates if configured
        const limitedUpdates = updates.slice(0, UPDATE_CONFIG.maxUpdatesPerRun);
        if (limitedUpdates.length < updates.length) {
            log(`Limited to ${limitedUpdates.length} products (max per run: ${UPDATE_CONFIG.maxUpdatesPerRun})`);
        }

        // Confirmation prompt
        if (UPDATE_CONFIG.confirmBeforeUpdate && !UPDATE_CONFIG.testMode) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const answer = await new Promise(resolve => {
                rl.question(`\nProceed with updating ${limitedUpdates.length} products? (y/N): `, resolve);
            });
            
            rl.close();
            
            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                log('Update cancelled by user');
                return;
            }
        }

        // Create backup
        if (UPDATE_CONFIG.createBackup) {
            const backupData = {
                timestamp: new Date().toISOString(),
                originalData: limitedUpdates
            };
            fs.writeFileSync(UPDATE_CONFIG.backupFile, JSON.stringify(backupData, null, 2));
            log(`Backup created: ${UPDATE_CONFIG.backupFile}`);
        }

        // Execute updates
        const results = [];
        for (let i = 0; i < limitedUpdates.length; i++) {
            const { product, updates: productUpdates } = limitedUpdates[i];
            
            log(`\n[${i + 1}/${limitedUpdates.length}] Processing: ${product.title}`);
            
            const updatedImages = await updateProductImages(product, productUpdates);
            
            results.push({
                productId: product.id,
                productTitle: product.title,
                updatedImages: updatedImages,
                timestamp: new Date().toISOString()
            });
        }

        // Save results
        const finalResults = {
            config: {
                testMode: UPDATE_CONFIG.testMode,
                brandName: BRAND_CONFIG.brandName,
                timestamp: new Date().toISOString()
            },
            summary: {
                totalProductsProcessed: results.length,
                totalImagesUpdated: results.reduce((sum, r) => sum + r.updatedImages.filter(img => img.success).length, 0),
                totalImagesFailed: results.reduce((sum, r) => sum + r.updatedImages.filter(img => !img.success).length, 0)
            },
            results: results
        };

        fs.writeFileSync(UPDATE_CONFIG.resultsFile, JSON.stringify(finalResults, null, 2));
        log(`\nResults saved to: ${UPDATE_CONFIG.resultsFile}`);

        // Summary
        log('\n' + '='.repeat(60));
        log('UPDATE COMPLETE');
        log('='.repeat(60));
        log(`Products processed: ${finalResults.summary.totalProductsProcessed}`);
        log(`Images updated: ${finalResults.summary.totalImagesUpdated}`);
        log(`Images failed: ${finalResults.summary.totalImagesFailed}`);
        log(`Success rate: ${((finalResults.summary.totalImagesUpdated / (finalResults.summary.totalImagesUpdated + finalResults.summary.totalImagesFailed)) * 100).toFixed(1)}%`);

    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { generateAltText, updateProductImages };

/**
 * CUSTOMIZATION CHECKLIST:
 * 
 * □ 1. Update STORE_CONFIG with your credentials
 * □ 2. Modify BRAND_CONFIG with your brand name and formats
 * □ 3. Customize generateAltText() for your product types
 * □ 4. Update cleanProductName() for your naming conventions
 * □ 5. Modify extractVariantInfo() for your variant structure
 * □ 6. Update determineProductCategory() with your categories
 * □ 7. Test with a small batch first (set maxUpdatesPerRun: 5)
 * □ 8. Enable testMode: true for dry runs
 * □ 9. Adjust rate limiting if needed
 * □ 10. Set up proper backup and logging paths
 * 
 * SAFETY REMINDERS:
 * - Always test with testMode: true first
 * - Start with small batches (maxUpdatesPerRun: 5-10)
 * - Keep createBackup: true enabled
 * - Monitor rate limits and adjust delays if needed
 * - Review generated alt text before running
 */