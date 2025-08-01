const token = 'shpat_YOUR_TOKEN_HERE';

// Common shop name variations to try
const shopVariations = [
  'xtend-outdoors',
  'xtendoutdoors', 
  'xtend_outdoors',
  'xtend',
  'outdoors-xtend',
  'xtend-outdoor',
  'xtendoutdoor'
];

async function findShop() {
  console.log('🔍 Testing different shop name variations...\n');
  
  for (const shop of shopVariations) {
    try {
      console.log(`Testing: ${shop}.myshopify.com`);
      
      const response = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`✅ SUCCESS! Found shop: ${shop}`);
        console.log(`Shop name: ${data.shop.name}`);
        console.log(`Shop domain: ${data.shop.domain}`);
        console.log(`MyShopify domain: ${data.shop.myshopify_domain}`);
        return shop;
      } else {
        console.log(`❌ ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('❌ No valid shop found with any variation.');
  return null;
}

findShop();