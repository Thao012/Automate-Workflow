// Check Jerry Can Pourer variants
const shopDomain = 'xtendoutdoors-store.myshopify.com';
const accessToken = 'shpat_YOUR_TOKEN_HERE';

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

async function checkJerryCanPourerVariants() {
    console.log('🔍 Checking Jerry Can Pourer product variants...\n');
    
    const productData = await fetchProduct('7331300212851');
    
    if (productData && productData.product) {
        const product = productData.product;
        console.log(`📦 Product: ${product.title}`);
        console.log(`🏷️  Handle: ${product.handle}`);
        console.log(`🖼️  Main image alt: "${product.image?.alt || 'MISSING'}"`);
        
        console.log('\n🎨 Variants:');
        product.variants.forEach((variant, index) => {
            console.log(`${index + 1}. ${variant.title} (SKU: ${variant.sku})`);
            console.log(`   Price: $${variant.price}`);
            console.log(`   Options: ${variant.option1}, ${variant.option2}, ${variant.option3}`);
        });
        
        console.log('\n🖼️  All Images:');
        product.images.forEach((image, index) => {
            console.log(`${index + 1}. Position ${image.position}: Alt="${image.alt || 'MISSING'}"`);
            console.log(`   URL: ${image.src}`);
            console.log(`   ID: ${image.id}`);
        });
        
        console.log('\n🔧 Product Options:');
        product.options.forEach((option, index) => {
            console.log(`${index + 1}. ${option.name}: [${option.values.join(', ')}]`);
        });
        
    } else {
        console.log('❌ Could not fetch Jerry Can Pourer product');
    }
}

checkJerryCanPourerVariants();