const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('./all_products.json', 'utf8'));
const products = data.products || [];

console.log(`Total products: ${products.length}`);

// Find products with missing alt text on main image (position 1)
const productsNeedingAltText = [];

products.forEach(product => {
    const images = product.images || [];
    if (images.length > 0) {
        // Check the first image (position 1)
        const mainImage = images.find(img => img.position === 1) || images[0];
        
        if (!mainImage.alt || mainImage.alt === null || mainImage.alt.trim() === '') {
            productsNeedingAltText.push({
                product_id: product.id,
                product_title: product.title,
                product_handle: product.handle,
                image_id: mainImage.id,
                product_status: product.status,
                current_alt: mainImage.alt
            });
        }
    }
});

console.log(`\nProducts with missing alt text on main image: ${productsNeedingAltText.length}`);
console.log('=' .repeat(60));

// Show first 20 results
productsNeedingAltText.slice(0, 20).forEach((product, index) => {
    console.log(`${index + 1}. ${product.product_title}`);
    console.log(`   Product ID: ${product.product_id}`);
    console.log(`   Image ID: ${product.image_id}`);
    console.log(`   Handle: ${product.product_handle}`);
    console.log(`   Status: ${product.product_status}`);
    console.log(`   Current Alt: ${product.current_alt}`);
    console.log('-'.repeat(50));
});

if (productsNeedingAltText.length > 20) {
    console.log(`... and ${productsNeedingAltText.length - 20} more products need alt text updates.`);
}

// Save results to a file for reference
fs.writeFileSync('products_needing_alt_text.json', JSON.stringify(productsNeedingAltText, null, 2));
console.log('\n✓ Full results saved to products_needing_alt_text.json');