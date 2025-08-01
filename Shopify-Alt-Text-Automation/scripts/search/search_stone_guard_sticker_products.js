const fs = require('fs');
const https = require('https');

// Use the working credentials and shop URL from test-api.js
const token = 'shpat_YOUR_TOKEN_HERE';
const shopUrl = 'xtend-outdoors.myshopify.com';

async function searchProducts() {
    
    // Products we're looking for
    const targetProducts = [
        'Caravan Stone Guard',
        'Camper Trailer Stone Guard',
        'Canvas Stone Guard Bag',
        'Do Not Overtake Turning Vehicle Sticker',
        'Customisable UHF Channel Sticker'
    ];
    
    console.log('Searching for stone guard and sticker products...\n');
    
    const results = [];
    
    for (const productName of targetProducts) {
        console.log(`Searching for: ${productName}`);
        
        try {
            // Search using the working API format
            const response = await new Promise((resolve, reject) => {
                const options = {
                    hostname: shopUrl,
                    path: `/admin/api/2023-10/products.json?limit=250`,
                    method: 'GET',
                    headers: {
                        'X-Shopify-Access-Token': token,
                        'Content-Type': 'application/json'
                    }
                };
                
                const req = https.request(options, resolve);
                req.on('error', reject);
                req.end();
            });
            
            let data = '';
            response.on('data', chunk => data += chunk);
            
            await new Promise(resolve => response.on('end', resolve));
            
            const jsonData = JSON.parse(data);
            
            if (jsonData.products && jsonData.products.length > 0) {
                for (const product of jsonData.products) {
                    // Check if product title contains our search terms
                    const titleLower = product.title.toLowerCase();
                    const searchLower = productName.toLowerCase();
                    
                    // More flexible matching
                    const isMatch = titleLower.includes(searchLower) || 
                                  searchLower.split(' ').every(word => titleLower.includes(word));
                    
                    if (isMatch) {
                        console.log(`✓ Found: ${product.title} (ID: ${product.id})`);
                        
                        // Get main image info
                        let mainImage = null;
                        if (product.images && product.images.length > 0) {
                            mainImage = product.images[0];
                        }
                        
                        results.push({
                            id: product.id,
                            title: product.title,
                            handle: product.handle,
                            mainImage: mainImage ? {
                                id: mainImage.id,
                                alt: mainImage.alt,
                                src: mainImage.src,
                                currentAlt: mainImage.alt || 'NO ALT TEXT'
                            } : null,
                            totalImages: product.images ? product.images.length : 0
                        });
                    }
                }
            }
            
            // No need for additional keyword search in this simplified version
            
        } catch (error) {
            console.error(`Error searching for ${productName}:`, error.message);
        }
        
        // Small delay between searches
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n=== SEARCH RESULTS ===`);
    console.log(`Total products found: ${results.length}\n`);
    
    if (results.length > 0) {
        results.forEach((product, index) => {
            console.log(`${index + 1}. ${product.title}`);
            console.log(`   ID: ${product.id}`);
            console.log(`   Handle: ${product.handle}`);
            console.log(`   Main Image: ${product.mainImage ? 'Yes' : 'No'}`);
            if (product.mainImage) {
                console.log(`   Current Alt Text: "${product.mainImage.currentAlt}"`);
                console.log(`   Image ID: ${product.mainImage.id}`);
            }
            console.log(`   Total Images: ${product.totalImages}`);
            console.log('');
        });
    } else {
        console.log('No matching products found.');
    }
    
    // Save results to file
    fs.writeFileSync('stone_guard_sticker_products.json', JSON.stringify(results, null, 2));
    console.log('Results saved to stone_guard_sticker_products.json');
    
    return results;
}

// Run the search
searchProducts().catch(console.error);