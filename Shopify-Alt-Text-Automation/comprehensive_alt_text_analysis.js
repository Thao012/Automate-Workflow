const fs = require('fs');
const path = require('path');

// Comprehensive Alt Text Analysis for Towing-Trailer Collection
// This script analyzes all available product data to find remaining products needing alt text

function loadJSONFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.log(`Error loading ${filePath}:`, error.message);
        return null;
    }
}

function analyzeAltText(altText) {
    if (!altText || altText === null || altText === "") {
        return "missing";
    }
    
    if (altText.toLowerCase() === "none") {
        return "none_value";
    }
    
    if (!altText.includes("Xtend Outdoors")) {
        return "missing_brand";
    }
    
    return "valid";
}

function findProductsNeedingAltText() {
    const dataDir = path.join(__dirname, 'data', 'products');
    const resultsDir = path.join(__dirname, 'results', 'updates');
    
    console.log('🔍 COMPREHENSIVE ALT TEXT ANALYSIS');
    console.log('==================================');
    
    // Load all available data files
    const towingProducts = loadJSONFile(path.join(dataDir, 'towing_trailer_products.json'));
    const completeTowingAnalysis = loadJSONFile(path.join(dataDir, 'complete_towing_products_analysis.json'));
    const towingNeedingAlt = loadJSONFile(path.join(dataDir, 'towing_products_needing_alt_text.json'));
    const finalReport = loadJSONFile(path.join(dataDir, 'final_towing_products_report.json'));
    
    // Load recent update results
    const recentUpdate = loadJSONFile(path.join(resultsDir, 'remaining_towing_products_final_update_2025-08-01T10-33-42-991Z.json'));
    
    console.log('\n📊 DATA FILES LOADED:');
    console.log(`- Towing Products: ${towingProducts ? towingProducts.length || 'loaded' : 'not found'}`);
    console.log(`- Complete Analysis: ${completeTowingAnalysis ? 'loaded' : 'not found'}`);
    console.log(`- Products Needing Alt: ${towingNeedingAlt ? towingNeedingAlt.length : 'not found'}`);
    console.log(`- Final Report: ${finalReport ? finalReport.products?.length : 'not found'}`);
    console.log(`- Recent Update: ${recentUpdate ? recentUpdate.successful_updates?.length + ' updated' : 'not found'}`);
    
    // Get list of recently updated product IDs
    const updatedProductIds = new Set();
    if (recentUpdate && recentUpdate.successful_updates) {
        recentUpdate.successful_updates.forEach(update => {
            updatedProductIds.add(update.productId);
        });
    }
    
    console.log(`\n✅ Recently Updated Products: ${updatedProductIds.size}`);
    
    // Analyze complete towing products if available
    let allTowingProducts = [];
    if (completeTowingAnalysis && completeTowingAnalysis.all_towing_products) {
        allTowingProducts = completeTowingAnalysis.all_towing_products;
    } else if (towingProducts) {
        allTowingProducts = towingProducts;
    }
    
    console.log(`\n🔎 ANALYZING ${allTowingProducts.length} TOTAL TOWING PRODUCTS`);
    
    const analysis = {
        missing_alt: [],
        has_valid_alt: [],
        recently_updated: [],
        needs_attention: []
    };
    
    allTowingProducts.forEach(product => {
        const productId = product.id;
        const wasRecentlyUpdated = updatedProductIds.has(productId);
        
        // Find the main image (position 1)
        let mainImage = null;
        if (product.images && product.images.length > 0) {
            mainImage = product.images.find(img => img.position === 1) || product.images[0];
        }
        
        if (mainImage) {
            const altStatus = analyzeAltText(mainImage.alt);
            const productInfo = {
                product_id: productId,
                product_title: product.title,
                product_handle: product.handle,
                image_id: mainImage.id,
                current_alt: mainImage.alt,
                alt_status: altStatus,
                product_status: product.status,
                recently_updated: wasRecentlyUpdated
            };
            
            if (wasRecentlyUpdated) {
                analysis.recently_updated.push(productInfo);
            } else if (altStatus === "missing" || altStatus === "none_value" || altStatus === "missing_brand") {
                analysis.missing_alt.push(productInfo);
                if (altStatus === "missing_brand") {
                    analysis.needs_attention.push(productInfo);
                }
            } else {
                analysis.has_valid_alt.push(productInfo);
            }
        }
    });
    
    // Cross-reference with final report to catch any missed products
    if (finalReport && finalReport.products) {
        console.log('\n🔍 CROSS-REFERENCING WITH FINAL REPORT');
        finalReport.products.forEach(reportProduct => {
            const existsInAnalysis = analysis.missing_alt.some(p => p.product_id === reportProduct.product_id) ||
                                   analysis.recently_updated.some(p => p.product_id === reportProduct.product_id) ||
                                   analysis.has_valid_alt.some(p => p.product_id === reportProduct.product_id);
            
            if (!existsInAnalysis && !updatedProductIds.has(reportProduct.product_id)) {
                console.log(`⚠️  Found unreported product: ${reportProduct.product_title} (ID: ${reportProduct.product_id})`);
                analysis.missing_alt.push({
                    product_id: reportProduct.product_id,
                    product_title: reportProduct.product_title,
                    product_handle: reportProduct.product_handle,
                    image_id: reportProduct.image_id,
                    current_alt: reportProduct.current_alt,
                    alt_status: "missing",
                    product_status: reportProduct.product_status,
                    recently_updated: false,
                    source: "final_report"
                });
            }
        });
    }
    
    console.log('\n📈 ANALYSIS RESULTS:');
    console.log('==================');
    console.log(`✅ Products with valid alt text: ${analysis.has_valid_alt.length}`);
    console.log(`🔄 Recently updated products: ${analysis.recently_updated.length}`);
    console.log(`❌ Products missing alt text: ${analysis.missing_alt.length}`);
    console.log(`⚠️  Products needing attention: ${analysis.needs_attention.length}`);
    
    if (analysis.missing_alt.length > 0) {
        console.log('\n🚨 PRODUCTS STILL MISSING ALT TEXT:');
        console.log('=================================');
        analysis.missing_alt.forEach((product, index) => {
            console.log(`${index + 1}. ${product.product_title}`);
            console.log(`   - Product ID: ${product.product_id}`);
            console.log(`   - Image ID: ${product.image_id}`);
            console.log(`   - Current Alt: ${product.current_alt || 'null'}`);
            console.log(`   - Status: ${product.alt_status}`);
            console.log(`   - Handle: ${product.product_handle}`);
            if (product.source) console.log(`   - Source: ${product.source}`);
            console.log('');
        });
    }
    
    if (analysis.needs_attention.length > 0) {
        console.log('\n⚠️  PRODUCTS WITH ALT TEXT BUT MISSING "XTEND OUTDOORS":');
        console.log('====================================================');
        analysis.needs_attention.forEach((product, index) => {
            console.log(`${index + 1}. ${product.product_title}`);
            console.log(`   - Current Alt: "${product.current_alt}"`);
            console.log(`   - Product ID: ${product.product_id}`);
            console.log('');
        });
    }
    
    // Save comprehensive results
    const timestamp = new Date().toISOString();
    const results = {
        analysis_timestamp: timestamp,
        summary: {
            total_products_analyzed: allTowingProducts.length,
            products_with_valid_alt: analysis.has_valid_alt.length,
            products_recently_updated: analysis.recently_updated.length,
            products_missing_alt: analysis.missing_alt.length,
            products_needing_attention: analysis.needs_attention.length
        },
        products_missing_alt_text: analysis.missing_alt,
        products_needing_attention: analysis.needs_attention,
        recently_updated_products: analysis.recently_updated.map(p => ({
            product_id: p.product_id,
            product_title: p.product_title,
            current_alt: p.current_alt
        }))
    };
    
    const outputFile = path.join(__dirname, 'results', `comprehensive_alt_text_analysis_${timestamp.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    console.log(`\n💾 Results saved to: ${outputFile}`);
    
    return results;
}

// Run the analysis
if (require.main === module) {
    try {
        findProductsNeedingAltText();
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

module.exports = { findProductsNeedingAltText };