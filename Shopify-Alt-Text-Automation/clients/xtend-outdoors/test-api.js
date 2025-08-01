const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';

// Test different shop URL formats
const shopFormats = [
  'xtend-outdoors.myshopify.com',
  'xtendoutdoors.myshopify.com', 
  'xtend-outdoors-australia.myshopify.com'
];

function testShopUrl(shopUrl) {
  return new Promise((resolve) => {
    const options = {
      hostname: shopUrl,
      path: '/admin/api/2023-10/shop.json',
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ shopUrl, success: true, data: result });
        } catch (e) {
          resolve({ shopUrl, success: false, error: data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ shopUrl, success: false, error: e.message });
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      resolve({ shopUrl, success: false, error: 'timeout' });
    });
    
    req.end();
  });
}

async function findCorrectShopUrl() {
  console.log('Testing different shop URL formats...\n');
  
  for (const shopUrl of shopFormats) {
    console.log('Testing: ' + shopUrl);
    const result = await testShopUrl(shopUrl);
    
    if (result.success && result.data.shop) {
      console.log('✅ SUCCESS! Found shop:');
      console.log('  Shop Name: ' + result.data.shop.name);
      console.log('  Domain: ' + result.data.shop.domain);
      console.log('  Shop URL: ' + shopUrl);
      
      // Now test products endpoint
      console.log('\nTesting products endpoint...');
      const productsResult = await testProductsEndpoint(shopUrl);
      if (productsResult.success) {
        console.log('✅ Products endpoint working!');
        console.log('Found ' + productsResult.data.products.length + ' products');
        
        // Show first few product names
        const firstProducts = productsResult.data.products.slice(0, 5);
        console.log('\nFirst 5 products:');
        firstProducts.forEach((product, index) => {
          console.log((index + 1) + '. ' + product.title);
        });
      }
      return shopUrl;
    } else {
      console.log('❌ Failed: ' + result.error);
    }
    console.log('');
  }
  
  console.log('No working shop URL found.');
  return null;
}

function testProductsEndpoint(shopUrl) {
  return new Promise((resolve) => {
    const options = {
      hostname: shopUrl,
      path: '/admin/api/2023-10/products.json?limit=10',
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ success: true, data: result });
        } catch (e) {
          resolve({ success: false, error: data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.end();
  });
}

findCorrectShopUrl();