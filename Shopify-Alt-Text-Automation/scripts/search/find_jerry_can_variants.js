const fs = require('fs');

// Read the all_products.json file
const data = fs.readFileSync('C:\\Users\\Thảo\\Desktop\\Projects\\all_products.json', 'utf-8');
const productsData = JSON.parse(data);

// Search for Jerry Can Pourer to see if it has variants
const jerryCanPourer = productsData.products.find(product => 
    product.id === 7331300212851
);

if (jerryCanPourer) {
    console.log('Found Jerry Can Pourer product:');
    console.log(`Title: ${jerryCanPourer.title}`);
    console.log(`Handle: ${jerryCanPourer.handle}`);
    console.log(`Main image alt: ${jerryCanPourer.image?.alt || 'MISSING'}`);
    
    console.log('\nVariants:');
    jerryCanPourer.variants.forEach((variant, index) => {
        console.log(`${index + 1}. Title: "${variant.title}", SKU: ${variant.sku}`);
    });
    
    console.log('\nAll Images:');
    jerryCanPourer.images.forEach((image, index) => {
        console.log(`${index + 1}. Position ${image.position}: Alt="${image.alt || 'MISSING'}", ID=${image.id}`);
        console.log(`   URL: ${image.src}`);
    });
} else {
    console.log('Jerry Can Pourer not found');
}

// Also search for any other products with "pourer" in title or handle
console.log('\n\nSearching for any other pourer products...');
const pourerProducts = productsData.products.filter(product => 
    product.title.toLowerCase().includes('pourer') || 
    product.handle.toLowerCase().includes('pourer')
);

if (pourerProducts.length > 0) {
    pourerProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. "${product.title}" (ID: ${product.id})`);
        console.log(`   Handle: ${product.handle}`);
        console.log(`   Main image alt: ${product.image?.alt || 'MISSING'}`);
        if (product.variants && product.variants.length > 1) {
            console.log('   Variants:');
            product.variants.forEach((variant, vIndex) => {
                console.log(`     ${vIndex + 1}. ${variant.title}`);
            });
        }
    });
} else {
    console.log('No other pourer products found');
}