const https = require('https');
const fs = require('fs');

const token = 'shpat_YOUR_TOKEN_HERE';
const shopUrl = 'xtend-outdoors.myshopify.com';

async function getAllProducts() {
    console.log('Fetching all products to search for stone guard and sticker items...\n');
    
    let allProducts = [];
    let page = 1;
    let hasNextPage = true;
    
    while (hasNextPage) {
        console.log(`Fetching page ${page}...`);
        
        try {
            const response = await new Promise((resolve, reject) => {
                const options = {
                    hostname: shopUrl,
                    path: `/admin/api/2023-10/products.json?limit=250&page=${page}`,
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
                allProducts = allProducts.concat(jsonData.products);
                console.log(`  Got ${jsonData.products.length} products`);
                
                // Check if we got less than the limit, indicating last page
                if (jsonData.products.length < 250) {
                    hasNextPage = false;
                }
            } else {
                hasNextPage = false;
            }
            
            page++;
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error.message);
            hasNextPage = false;
        }
    }
    
    console.log(`\nTotal products fetched: ${allProducts.length}`);
    
    // Now search for our target products
    const searchTerms = [
        'stone guard',
        'caravan stone',
        'trailer stone',
        'canvas stone',
        'stone bag',
        'overtake turning',
        'do not overtake',
        'turning vehicle',
        'uhf channel',
        'customisable uhf',
        'channel sticker',
        'sticker'
    ];
    
    const results = [];
    
    console.log('\nSearching for matching products...\n');
    
    for (const product of allProducts) {
        const titleLower = product.title.toLowerCase();
        
        // Check if product matches any of our search terms
        let isMatch = false;
        let matchedTerm = '';
        
        for (const term of searchTerms) {
            if (titleLower.includes(term)) {
                isMatch = true;
                matchedTerm = term;
                break;
            }
        }
        
        if (isMatch) {
            console.log(`✓ Found match: "${product.title}" (matched: "${matchedTerm}")`);
            
            // Get main image info
            let mainImage = null;
            if (product.images && product.images.length > 0) {
                mainImage = product.images[0];
            }
            
            results.push({
                id: product.id,
                title: product.title,
                handle: product.handle,
                matchedTerm: matchedTerm,
                mainImage: mainImage ? {
                    id: mainImage.id,
                    alt: mainImage.alt,
                    src: mainImage.src,
                    currentAlt: mainImage.alt || 'NO ALT TEXT'
                } : null,
                totalImages: product.images ? product.images.length : 0,
                allImages: product.images || []
            });
        }
    }
    
    console.log(`\n=== SEARCH RESULTS ===`);
    console.log(`Found ${results.length} matching products:\n`);
    
    if (results.length > 0) {
        results.forEach((product, index) => {
            console.log(`${index + 1}. ${product.title}`);
            console.log(`   ID: ${product.id}`);
            console.log(`   Handle: ${product.handle}`);
            console.log(`   Matched Term: "${product.matchedTerm}"`);
            console.log(`   Main Image: ${product.mainImage ? 'Yes' : 'No'}`);
            if (product.mainImage) {
                console.log(`   Current Alt Text: "${product.mainImage.currentAlt}"`);
                console.log(`   Image ID: ${product.mainImage.id}`);
            }
            console.log(`   Total Images: ${product.totalImages}`);
            console.log('');
        });
    } else {
        console.log('No matching products found with the search terms.');
    }
    
    // Save results to file
    fs.writeFileSync('stone_guard_sticker_search_results.json', JSON.stringify(results, null, 2));
    console.log(`Results saved to stone_guard_sticker_search_results.json`);
    
    return results;
}

// Run the search
getAllProducts().catch(console.error);