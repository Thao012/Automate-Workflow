const shopDomain = 'xtendoutdoors-store.myshopify.com';
const accessToken = 'shpat_YOUR_TOKEN_HERE';

// Target products to update
const targetProducts = [
    {
        id: '14664826290539',
        title: 'Customisable UHF Channel Sticker',
        handle: 'uhf-channel-sticker',
        newAltText: 'Customisable UHF Channel Sticker - Xtend Outdoors'
    },
    {
        id: '7418712588403',
        title: 'Canvas Stone Guard Bag',
        handle: 'stone-guard-bag',
        newAltText: 'Canvas Stone Guard Bag - Xtend Outdoors'
    },
    {
        id: '7321639452787',
        title: 'Camper Trailer Stone Guard',
        handle: 'camper-trailer-stone-guard',
        newAltText: 'Camper Trailer Stone Guard - Xtend Outdoors'
    },
    {
        id: '7321639387251',
        title: 'Caravan Stone Guard',
        handle: 'caravan-stone-guard',
        newAltText: 'Caravan Stone Guard - Xtend Outdoors'
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

// Function to update product images
async function updateProductImages(productId, images) {
    const url = `https://${shopDomain}/admin/api/2023-10/products/${productId}.json`;
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: {
                    id: productId,
                    images: images
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ Error updating product ${productId}:`, error.message);
        return null;
    }
}

// Main function to update all stone guard and sticker products
async function updateAllProducts() {
    console.log('🔧 Starting Stone Guard & Sticker Alt Text Updates...\n');
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const product of targetProducts) {
        console.log(`\n📦 Processing: "${product.title}" (ID: ${product.id})`);
        
        try {
            // Fetch current product data
            const productData = await fetchProduct(product.id);
            
            if (!productData || !productData.product) {
                console.log(`❌ Failed to fetch product data for ${product.title}`);
                failureCount++;
                results.push({
                    product: product.title,
                    status: 'failed',
                    error: 'Could not fetch product data'
                });
                continue;
            }

            const currentProduct = productData.product;
            console.log(`📋 Found product: ${currentProduct.title}`);
            
            if (!currentProduct.images || currentProduct.images.length === 0) {
                console.log(`⚠️  No images found for ${product.title}`);
                results.push({
                    product: product.title,
                    status: 'skipped',
                    reason: 'No images found'
                });
                continue;
            }

            // Update main image (position 1) alt text
            const updatedImages = currentProduct.images.map(image => {
                if (image.position === 1) {
                    const oldAlt = image.alt || 'MISSING';
                    console.log(`🔄 Updating main image alt text from "${oldAlt}" to "${product.newAltText}"`);
                    return {
                        ...image,
                        alt: product.newAltText
                    };
                }
                return image;
            });

            // Update the product
            const updateResult = await updateProductImages(product.id, updatedImages);
            
            if (updateResult && updateResult.product) {
                console.log(`✅ Successfully updated "${product.title}"`);
                
                // Verify the update
                const updatedMainImage = updateResult.product.images.find(img => img.position === 1);
                if (updatedMainImage && updatedMainImage.alt === product.newAltText) {
                    console.log(`✅ Verified: Alt text is now "${updatedMainImage.alt}"`);
                }
                
                successCount++;
                results.push({
                    product: product.title,
                    status: 'success',
                    oldAlt: currentProduct.images.find(img => img.position === 1)?.alt || 'MISSING',
                    newAlt: product.newAltText
                });
            } else {
                console.log(`❌ Failed to update "${product.title}"`);
                failureCount++;
                results.push({
                    product: product.title,
                    status: 'failed',
                    error: 'Update request failed'
                });
            }
            
        } catch (error) {
            console.log(`❌ Error processing "${product.title}": ${error.message}`);
            failureCount++;
            results.push({
                product: product.title,
                status: 'failed',
                error: error.message
            });
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${failureCount}`);
    console.log(`📦 Total products processed: ${targetProducts.length}`);
    
    if (successCount > 0) {
        console.log('\n✅ Successfully updated products:');
        results.filter(r => r.status === 'success').forEach(r => {
            console.log(`  • ${r.product}`);
        });
    }
    
    if (failureCount > 0) {
        console.log('\n❌ Failed updates:');
        results.filter(r => r.status === 'failed').forEach(r => {
            console.log(`  • ${r.product}: ${r.error}`);
        });
    }
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('stone_guard_sticker_update_results.json', JSON.stringify(results, null, 2));
    console.log('\n📄 Detailed results saved to stone_guard_sticker_update_results.json');
    
    return results;
}

// Run the updates
updateAllProducts().catch(console.error);