const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend-outdoors';

async function testShop() {
  try {
    console.log('🔍 Testing different endpoints...');
    
    // Test shop info endpoint
    console.log('\n1. Testing shop.json endpoint...');
    const shopResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Shop endpoint status: ${shopResponse.status}`);
    const shopText = await shopResponse.text();
    console.log('Shop response:', shopText);
    
    // Test products endpoint directly
    console.log('\n2. Testing products.json endpoint...');
    const productsResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/products.json?limit=5`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Products endpoint status: ${productsResponse.status}`);
    const productsText = await productsResponse.text();
    console.log('Products response:', productsText);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testShop();