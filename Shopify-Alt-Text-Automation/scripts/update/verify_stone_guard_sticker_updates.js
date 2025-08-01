const shopDomain = 'xtendoutdoors-store.myshopify.com';
const accessToken = 'shpat_YOUR_TOKEN_HERE';

// Products to verify
const productsToVerify = [
    {
        id: '14664826290539',
        title: 'Customisable UHF Channel Sticker',
        expectedAlt: 'Customisable UHF Channel Sticker - Xtend Outdoors'
    },
    {
        id: '7418712588403',
        title: 'Canvas Stone Guard Bag',
        expectedAlt: 'Canvas Stone Guard Bag - Xtend Outdoors'
    },
    {
        id: '7321639452787',
        title: 'Camper Trailer Stone Guard',
        expectedAlt: 'Camper Trailer Stone Guard - Xtend Outdoors'
    },
    {
        id: '7321639387251',
        title: 'Caravan Stone Guard',
        expectedAlt: 'Caravan Stone Guard - Xtend Outdoors'
    }
];

// Function to fetch product data
async function fetchProduct(productId) {
    const url = `https://${shopDomain}/admin/api/2023-10/products/${productId}.json`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ Error fetching product ${productId}:`, error.message);
        return null;
    }
}

async function verifyUpdates() {
    console.log('🔍 Verifying Stone Guard & Sticker Alt Text Updates...\n');
    
    let verifiedCount = 0;
    let failedCount = 0;
    const results = [];
    
    for (const product of productsToVerify) {
        console.log(`📦 Verifying: "${product.title}" (ID: ${product.id})`);
        
        try {
            const productData = await fetchProduct(product.id);
            
            if (!productData || !productData.product) {
                console.log(`❌ Could not fetch product data`);
                failedCount++;
                results.push({
                    product: product.title,
                    status: 'failed',
                    error: 'Could not fetch product data'
                });
                continue;
            }
            
            const currentProduct = productData.product;
            const mainImage = currentProduct.images?.find(img => img.position === 1);
            
            if (!mainImage) {
                console.log(`❌ No main image found`);
                failedCount++;
                results.push({
                    product: product.title,
                    status: 'failed',
                    error: 'No main image found'
                });
                continue;
            }
            
            const currentAlt = mainImage.alt || 'MISSING';
            const isCorrect = currentAlt === product.expectedAlt;
            
            if (isCorrect) {
                console.log(`✅ VERIFIED: Alt text is correct: "${currentAlt}"`);
                verifiedCount++;
                results.push({
                    product: product.title,
                    status: 'verified',
                    currentAlt: currentAlt,
                    expectedAlt: product.expectedAlt
                });
            } else {
                console.log(`❌ MISMATCH: Expected "${product.expectedAlt}" but found "${currentAlt}"`);
                failedCount++;
                results.push({
                    product: product.title,
                    status: 'mismatch',
                    currentAlt: currentAlt,
                    expectedAlt: product.expectedAlt
                });
            }
            
        } catch (error) {
            console.log(`❌ Error verifying "${product.title}": ${error.message}`);
            failedCount++;
            results.push({
                product: product.title,
                status: 'error',
                error: error.message
            });
        }
        
        console.log('');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Final verification summary
    console.log('='.repeat(50));
    console.log('🔍 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Verified correct: ${verifiedCount}`);
    console.log(`❌ Failed/Mismatched: ${failedCount}`);
    console.log(`📦 Total products checked: ${productsToVerify.length}`);
    
    if (verifiedCount === productsToVerify.length) {
        console.log('\n🎉 ALL PRODUCTS VERIFIED SUCCESSFULLY!');
        console.log('All stone guard and sticker products now have correct alt text format.');
    } else {
        console.log('\n⚠️  Some products need attention:');
        results.filter(r => r.status !== 'verified').forEach(r => {
            console.log(`  • ${r.product}: ${r.error || 'Alt text mismatch'}`);
        });
    }
    
    // Save verification results
    const fs = require('fs');
    fs.writeFileSync('stone_guard_sticker_verification.json', JSON.stringify(results, null, 2));
    console.log('\n📄 Verification results saved to stone_guard_sticker_verification.json');
    
    return results;
}

// Run verification
verifyUpdates().catch(console.error);