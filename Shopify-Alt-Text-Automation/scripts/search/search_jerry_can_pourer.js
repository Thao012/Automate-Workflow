const fs = require('fs');

// Read the all_products.json file
const data = fs.readFileSync('C:\\Users\\Thảo\\Desktop\\Projects\\all_products.json', 'utf-8');
const productsData = JSON.parse(data);

// Search for Jerry Can Pourer products
const pourerProducts = productsData.products.filter(product => {
    return product.title.toLowerCase().includes('jerry can pourer') || 
           product.title.toLowerCase().includes('pourer');
});

console.log('Found Jerry Can Pourer products:');
pourerProducts.forEach((product, index) => {
    console.log(`\n${index + 1}. "${product.title}" (ID: ${product.id})`);
    console.log(`   Handle: ${product.handle}`);
    if (product.image && product.image.alt) {
        console.log(`   Main Image Alt Text: "${product.image.alt}"`);
    } else {
        console.log(`   Main Image Alt Text: MISSING`);
    }
    
    // Show all images with alt text
    if (product.images && product.images.length > 0) {
        console.log(`   All Images:`);
        product.images.forEach((img, imgIndex) => {
            console.log(`     Image ${imgIndex + 1}: Alt="${img.alt || 'MISSING'}", Position=${img.position}`);
        });
    }
    
    // Show variants
    if (product.variants && product.variants.length > 0) {
        console.log('   Variants:');
        product.variants.forEach((variant, varIndex) => {
            console.log(`     ${varIndex + 1}. ${variant.title}`);
        });
    }
});