// Jerry Can products to update (based on search results)
const jerryCanProducts = [
    {
        id: '7331300114547',
        title: '20L Jerry Can - Green',
        handle: '20l-jerry-can',
        newAltText: '20L Jerry Can - Green - Xtend Outdoors'
    },
    {
        id: '7341149388915', 
        title: '20L Jerry Can - Yellow',
        handle: '20l-jerry-can-yellow',
        newAltText: '20L Jerry Can - Yellow - Xtend Outdoors'
    },
    {
        id: '7331300147315',
        title: '20L Jerry Can Holder', 
        handle: '20l-jerry-can-holder',
        newAltText: '20L Jerry Can Holder - Xtend Outdoors'
    },
    {
        id: '7331300212851',
        title: 'Jerry Can Pourer',
        handle: 'jerry-can-pourer-green',
        newAltText: 'Jerry Can Pourer - Xtend Outdoors'
    }
];

const shopDomain = 'xtendoutdoors-store.myshopify.com';
const accessToken = 'shpat_YOUR_TOKEN_HERE';

if (!accessToken) {
    console.error('❌ Error: Access token not found');
    process.exit(1);
}

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

// Main function to update all Jerry Can products
async function updateJerryCanProducts() {
    console.log('🔧 Starting Jerry Can Alt Text Updates...\n');
    
    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const product of jerryCanProducts) {
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
                successCount++;
                results.push({
                    product: product.title,
                    status: 'success',
                    newAltText: product.newAltText
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

        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 JERRY CAN ALT TEXT UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${failureCount}`);
    console.log(`📦 Total products processed: ${jerryCanProducts.length}`);
    
    console.log('\n📋 Detailed Results:');
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.product}: ${result.status.toUpperCase()}`);
        if (result.newAltText) {
            console.log(`   ✅ New alt text: "${result.newAltText}"`);
        }
        if (result.error) {
            console.log(`   ❌ Error: ${result.error}`);
        }
        if (result.reason) {
            console.log(`   ⚠️  Reason: ${result.reason}`);
        }
    });

    console.log('\n🏁 Jerry Can alt text update process completed!');
}

// Verification function
async function verifyUpdates() {
    console.log('\n🔍 VERIFYING UPDATES...\n');
    
    for (const product of jerryCanProducts) {
        const productData = await fetchProduct(product.id);
        
        if (productData && productData.product) {
            const mainImage = productData.product.images?.find(img => img.position === 1);
            console.log(`📦 ${product.title}:`);
            console.log(`   Main image alt text: "${mainImage?.alt || 'MISSING'}"`);
            
            if (mainImage?.alt === product.newAltText) {
                console.log(`   ✅ VERIFIED - Alt text is correct`);
            } else {
                console.log(`   ❌ MISMATCH - Expected: "${product.newAltText}"`);
            }
        } else {
            console.log(`❌ Could not verify ${product.title}`);
        }
        console.log('');
        
        // Add delay between verification requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Run the update process
updateJerryCanProducts()
    .then(() => verifyUpdates())
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });