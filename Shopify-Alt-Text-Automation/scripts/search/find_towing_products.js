const fs = require('fs');

// Read the products needing alt text
const productsNeedingAltText = JSON.parse(fs.readFileSync('./products_needing_alt_text.json', 'utf8'));

// Towing/trailer keywords to search for
const towingKeywords = [
    'shackle', 'reflector', 'stabiliser', 'stabilizer', 'jack pad', 'jack pads',
    'hitch lock', 'hitch', 'tow', 'trailer', 'towing', 'd-shackle', 'tow bar',
    'tow ball', 'coupling', 'safety chain', 'brake controller', 'winch',
    'load restraint', 'tie down', 'cargo', 'ratchet', 'strap'
];

console.log('Searching for towing/trailer products that need alt text updates...\n');

const towingProducts = productsNeedingAltText.filter(product => {
    const title = product.product_title.toLowerCase();
    const handle = product.product_handle.toLowerCase();
    
    return towingKeywords.some(keyword => 
        title.includes(keyword) || handle.includes(keyword)
    );
});

console.log(`Found ${towingProducts.length} towing/trailer products needing alt text updates:`);
console.log('=' .repeat(80));

towingProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.product_title}`);
    console.log(`   Product ID: ${product.product_id}`);
    console.log(`   Image ID: ${product.image_id}`);
    console.log(`   Handle: ${product.product_handle}`);
    console.log(`   Status: ${product.product_status}`);
    console.log(`   Current Alt: ${product.current_alt}`);
    console.log('-'.repeat(70));
});

// Save towing products results
fs.writeFileSync('towing_products_needing_alt_text.json', JSON.stringify(towingProducts, null, 2));
console.log(`\n✓ Towing products results saved to towing_products_needing_alt_text.json`);

// Also search in ALL products for any towing-related items (even those with alt text)
const allProducts = JSON.parse(fs.readFileSync('./all_products.json', 'utf8')).products;
const allTowingProducts = allProducts.filter(product => {
    const title = product.title.toLowerCase();
    const handle = product.handle.toLowerCase();
    const tags = product.tags ? product.tags.toLowerCase() : '';
    
    return towingKeywords.some(keyword => 
        title.includes(keyword) || handle.includes(keyword) || tags.includes(keyword)
    );
});

console.log(`\n\nAll towing/trailer related products in store: ${allTowingProducts.length}`);
console.log('=' .repeat(80));

allTowingProducts.slice(0, 10).forEach((product, index) => {
    const mainImage = product.images && product.images.length > 0 ? 
        (product.images.find(img => img.position === 1) || product.images[0]) : null;
    
    console.log(`${index + 1}. ${product.title}`);
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Handle: ${product.handle}`);
    console.log(`   Status: ${product.status}`);
    if (mainImage) {
        console.log(`   Main Image Alt: "${mainImage.alt}"`);
        console.log(`   Image ID: ${mainImage.id}`);
    } else {
        console.log(`   No images found`);
    }
    console.log('-'.repeat(70));
});

if (allTowingProducts.length > 10) {
    console.log(`... and ${allTowingProducts.length - 10} more towing/trailer products in the store.`);
}