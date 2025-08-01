const fs = require('fs');

// Read all products
const allProducts = JSON.parse(fs.readFileSync('./all_products.json', 'utf8')).products;

// Towing/trailer keywords to search for
const towingKeywords = [
    'shackle', 'reflector', 'stabiliser', 'stabilizer', 'jack pad', 'jack pads',
    'hitch lock', 'hitch', 'tow', 'trailer', 'towing', 'd-shackle', 'tow bar',
    'tow ball', 'coupling', 'safety chain', 'brake controller', 'winch',
    'load restraint', 'tie down', 'cargo', 'ratchet', 'strap'
];

const allTowingProducts = allProducts.filter(product => {
    const title = product.title.toLowerCase();
    const handle = product.handle.toLowerCase();
    const tags = product.tags ? product.tags.toLowerCase() : '';
    
    return towingKeywords.some(keyword => 
        title.includes(keyword) || handle.includes(keyword) || tags.includes(keyword)
    );
});

console.log(`All ${allTowingProducts.length} towing/trailer related products in store:`);
console.log('=' .repeat(80));

allTowingProducts.forEach((product, index) => {
    const mainImage = product.images && product.images.length > 0 ? 
        (product.images.find(img => img.position === 1) || product.images[0]) : null;
    
    const needsAltText = mainImage && (!mainImage.alt || mainImage.alt === null || mainImage.alt.trim() === '');
    
    console.log(`${index + 1}. ${product.title}`);
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Handle: ${product.handle}`);
    console.log(`   Status: ${product.status}`);
    if (mainImage) {
        console.log(`   Main Image Alt: "${mainImage.alt}" ${needsAltText ? '*** NEEDS UPDATE ***' : ''}`);
        console.log(`   Image ID: ${mainImage.id}`);
    } else {
        console.log(`   No images found`);
    }
    console.log('-'.repeat(70));
});

// Create summary of products needing alt text updates
const towingProductsNeedingAltText = allTowingProducts.filter(product => {
    const mainImage = product.images && product.images.length > 0 ? 
        (product.images.find(img => img.position === 1) || product.images[0]) : null;
    return mainImage && (!mainImage.alt || mainImage.alt === null || mainImage.alt.trim() === '');
}).map(product => {
    const mainImage = product.images.find(img => img.position === 1) || product.images[0];
    return {
        product_id: product.id,
        product_title: product.title,
        product_handle: product.handle,
        image_id: mainImage.id,
        product_status: product.status,
        current_alt: mainImage.alt
    };
});

console.log('\n\nSUMMARY: Towing/Trailer Products Needing Alt Text Updates');
console.log('=' .repeat(80));
towingProductsNeedingAltText.forEach((product, index) => {
    console.log(`${index + 1}. ${product.product_title}`);
    console.log(`   Product ID: ${product.product_id}, Image ID: ${product.image_id}`);
});

fs.writeFileSync('complete_towing_products_analysis.json', JSON.stringify({
    all_towing_products: allTowingProducts,
    products_needing_alt_text: towingProductsNeedingAltText
}, null, 2));

console.log(`\n✓ Complete analysis saved to complete_towing_products_analysis.json`);