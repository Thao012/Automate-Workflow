const fs = require('fs');

// Read the all_products.json file and search for the target products
function searchForTargetProducts() {
    try {
        console.log('Reading all_products.json file...');
        const data = fs.readFileSync('all_products.json', 'utf8');
        const jsonData = JSON.parse(data);
        
        if (!jsonData.products) {
            console.log('No products array found in the JSON data');
            return;
        }
        
        console.log(`Total products in database: ${jsonData.products.length}\n`);
        
        // Search terms we're looking for
        const searchTerms = [
            // Original search terms
            'stone guard',
            'stone bag', 
            'caravan stone',
            'trailer stone',
            'canvas stone',
            'overtake turning',
            'do not overtake',
            'turning vehicle',
            'uhf channel',
            'customisable uhf',
            'channel sticker',
            
            // Broader search terms
            'guard',
            'protection',
            'sticker',
            'decal',
            'uhf',
            'channel',
            'overtake',
            'turning',
            'vehicle',
            'customisable',
            'custom'
        ];
        
        const matchedProducts = [];
        
        console.log('Searching for products with relevant terms...\n');
        
        // Search through all products
        for (const product of jsonData.products) {
            const titleLower = product.title.toLowerCase();
            const bodyLower = (product.body_html || '').toLowerCase();
            const tagsLower = (product.tags || '').toLowerCase();
            
            // Combine all searchable text
            const searchableText = `${titleLower} ${bodyLower} ${tagsLower}`;
            
            let matchedTerms = [];
            
            // Check which search terms match
            for (const term of searchTerms) {
                if (searchableText.includes(term.toLowerCase())) {
                    matchedTerms.push(term);
                }
            }
            
            // If we found any matches, add the product
            if (matchedTerms.length > 0) {
                const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
                
                matchedProducts.push({
                    id: product.id,
                    title: product.title,
                    handle: product.handle,
                    status: product.status,
                    matchedTerms: matchedTerms,
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
        
        console.log(`=== SEARCH RESULTS ===`);
        console.log(`Found ${matchedProducts.length} products with relevant terms:\n`);
        
        if (matchedProducts.length > 0) {
            // Group by most relevant matches first
            matchedProducts.sort((a, b) => {
                // Prioritize products with more matched terms
                if (b.matchedTerms.length !== a.matchedTerms.length) {
                    return b.matchedTerms.length - a.matchedTerms.length;
                }
                // Then prioritize products with specific terms in title
                const aSpecificInTitle = a.matchedTerms.some(term => 
                    ['stone guard', 'uhf channel', 'overtake turning', 'canvas stone'].includes(term) && 
                    a.title.toLowerCase().includes(term.toLowerCase())
                );
                const bSpecificInTitle = b.matchedTerms.some(term => 
                    ['stone guard', 'uhf channel', 'overtake turning', 'canvas stone'].includes(term) && 
                    b.title.toLowerCase().includes(term.toLowerCase())
                );
                
                if (bSpecificInTitle && !aSpecificInTitle) return 1;
                if (aSpecificInTitle && !bSpecificInTitle) return -1;
                
                return 0;
            });
            
            matchedProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.title}`);
                console.log(`   ID: ${product.id}`);
                console.log(`   Handle: ${product.handle}`);
                console.log(`   Status: ${product.status}`);
                console.log(`   Matched Terms: ${product.matchedTerms.join(', ')}`);
                console.log(`   Main Image: ${product.mainImage ? 'Yes' : 'No'}`);
                if (product.mainImage) {
                    console.log(`   Current Alt Text: "${product.mainImage.currentAlt}"`);
                    console.log(`   Image ID: ${product.mainImage.id}`);
                }
                console.log(`   Total Images: ${product.totalImages}`);
                console.log('');
            });
            
            // Save detailed results
            fs.writeFileSync('comprehensive_search_results.json', JSON.stringify(matchedProducts, null, 2));
            console.log('Detailed results saved to comprehensive_search_results.json');
            
            // Now look specifically for products that might need alt text updates
            const productsNeedingAltText = matchedProducts.filter(product => 
                product.mainImage && 
                (!product.mainImage.alt || 
                 product.mainImage.alt === 'NO ALT TEXT' || 
                 !product.mainImage.alt.includes('- Xtend Outdoors'))
            );
            
            if (productsNeedingAltText.length > 0) {
                console.log(`\n=== PRODUCTS NEEDING ALT TEXT UPDATES ===`);
                console.log(`Found ${productsNeedingAltText.length} products that need alt text updates:\n`);
                
                productsNeedingAltText.forEach((product, index) => {
                    console.log(`${index + 1}. ${product.title}`);
                    console.log(`   Current Alt: "${product.mainImage.currentAlt}"`);
                    console.log(`   Suggested Alt: "${product.title} - Xtend Outdoors"`);
                    console.log('');
                });
            }
            
        } else {
            console.log('No products found matching the search criteria.');
            console.log('\nLet me also check for some common product types...\n');
            
            // Check for some common product categories
            const commonCategories = ['caravan', 'trailer', 'camping', 'accessory', 'protection'];
            for (const category of commonCategories) {
                const categoryProducts = jsonData.products.filter(p => 
                    p.title.toLowerCase().includes(category) ||
                    (p.tags && p.tags.toLowerCase().includes(category))
                );
                console.log(`Products with "${category}": ${categoryProducts.length}`);
            }
        }
        
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error.message);
    }
}

// Run the search
searchForTargetProducts();