// Update all Jerry Can Pourer images with proper alt text
const shopDomain = 'xtendoutdoors-store.myshopify.com';
const accessToken = 'shpat_YOUR_TOKEN_HERE';

const productId = '7331300212851';

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

async function updateJerryCanPourerImages() {
    console.log('🔧 Starting Jerry Can Pourer Image Alt Text Updates...\n');
    
    try {
        // Fetch current product data
        const productData = await fetchProduct(productId);
        
        if (!productData || !productData.product) {
            console.log(`❌ Failed to fetch product data`);
            return;
        }

        const product = productData.product;
        console.log(`📦 Processing: "${product.title}" (ID: ${productId})`);
        
        if (!product.images || product.images.length === 0) {
            console.log(`⚠️  No images found`);
            return;
        }

        console.log(`\n📋 Current images:`);
        product.images.forEach((image, index) => {
            console.log(`${index + 1}. Position ${image.position}: "${image.alt || 'MISSING'}"`);
            console.log(`   URL: ${image.src}`);
        });

        // Define alt text based on image content/position
        const updatedImages = product.images.map(image => {
            let newAlt = image.alt; // Keep existing if already set
            
            // Analyze image URL to determine appropriate alt text
            const imageUrl = image.src.toLowerCase();
            
            if (imageUrl.includes('jerrycans_pourer_grn') || imageUrl.includes('jerrycans_grn')) {
                if (image.position === 1) {
                    newAlt = 'Jerry Can Pourer - Green - Xtend Outdoors';
                } else {
                    newAlt = 'Jerry Can Pourer Green - Xtend Outdoors';
                }
            } else if (imageUrl.includes('jerrycans_pourer_ylw') || imageUrl.includes('jerrycans_ylw')) {
                if (imageUrl.includes('_01')) {
                    newAlt = 'Jerry Can Pourer - Yellow - Xtend Outdoors';
                } else {
                    newAlt = 'Jerry Can Pourer Yellow - Xtend Outdoors';
                }
            } else if (!image.alt || image.alt.trim() === '') {
                // Fallback for any remaining images without alt text
                newAlt = 'Jerry Can Pourer - Xtend Outdoors';
            }
            
            const oldAlt = image.alt || 'MISSING';
            if (oldAlt !== newAlt) {
                console.log(`🔄 Position ${image.position}: "${oldAlt}" → "${newAlt}"`);
            } else {
                console.log(`✅ Position ${image.position}: Already correct "${newAlt}"`);
            }
            
            return {
                ...image,
                alt: newAlt
            };
        });

        // Update the product
        const updateResult = await updateProductImages(productId, updatedImages);
        
        if (updateResult && updateResult.product) {
            console.log(`\n✅ Successfully updated all Jerry Can Pourer images`);
            
            // Show final results
            console.log(`\n📋 Updated images:`);
            updateResult.product.images.forEach((image, index) => {
                console.log(`${index + 1}. Position ${image.position}: "${image.alt}"`);
            });
        } else {
            console.log(`\n❌ Failed to update Jerry Can Pourer images`);
        }

    } catch (error) {
        console.log(`❌ Error processing Jerry Can Pourer: ${error.message}`);
    }
}

// Verification function
async function verifyJerryCanPourerImages() {
    console.log('\n🔍 VERIFYING JERRY CAN POURER IMAGE UPDATES...\n');
    
    const productData = await fetchProduct(productId);
    
    if (productData && productData.product) {
        console.log(`📦 ${productData.product.title}:`);
        
        productData.product.images.forEach((image, index) => {
            console.log(`   Image ${index + 1} (Position ${image.position}): "${image.alt}"`);
            
            if (image.alt && image.alt.includes('Xtend Outdoors')) {
                console.log(`   ✅ VERIFIED - Alt text is correct`);
            } else {
                console.log(`   ❌ ISSUE - Alt text missing or incorrect`);
            }
        });
    } else {
        console.log(`❌ Could not verify Jerry Can Pourer images`);
    }
}

// Run the update process
updateJerryCanPourerImages()
    .then(() => verifyJerryCanPourerImages())
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });