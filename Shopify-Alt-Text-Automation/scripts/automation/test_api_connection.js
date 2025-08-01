const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend-outdoors';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    console.log(`Making request to: https://${shop}.myshopify.com${path}`);
    
    const options = {
      hostname: shop + '.myshopify.com',
      path: path,
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Response status: ${res.statusCode}`);
      console.log(`Response headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Response body length: ${data.length} characters`);
        
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          console.log('Response is not valid JSON, returning raw data');
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log('Request error:', error);
      reject(error);
    });
    
    req.end();
  });
}

async function testAPIConnection() {
  try {
    console.log('🔧 TESTING SHOPIFY API CONNECTION');
    console.log('='.repeat(50));
    console.log(`Shop: ${shop}`);
    console.log(`Token: ${token.substring(0, 10)}...`);
    
    // Test 1: Try to get shop info
    console.log('\n📊 Test 1: Getting shop information...');
    const shopResponse = await makeRequest('/admin/api/2023-10/shop.json');
    
    if (shopResponse.status === 200) {
      console.log('✅ Shop API connection successful');
      console.log(`Shop name: ${shopResponse.data.shop?.name || 'N/A'}`);
      console.log(`Shop domain: ${shopResponse.data.shop?.domain || 'N/A'}`);
    } else {
      console.log(`❌ Shop API failed. Status: ${shopResponse.status}`);
      console.log('Response:', shopResponse.data);
    }
    
    // Test 2: Try to get products with different parameters
    console.log('\n📦 Test 2: Getting products...');
    const productsResponse = await makeRequest('/admin/api/2023-10/products.json?limit=10');
    
    if (productsResponse.status === 200) {
      const products = productsResponse.data.products || [];
      console.log(`✅ Products API connection successful`);
      console.log(`Found ${products.length} products`);
      
      if (products.length > 0) {
        console.log('\n📋 First few products:');
        products.slice(0, 5).forEach((product, index) => {
          console.log(`${index + 1}. ${product.title} (ID: ${product.id})`);
        });
      }
    } else {
      console.log(`❌ Products API failed. Status: ${productsResponse.status}`);
      console.log('Response:', productsResponse.data);
    }
    
    // Test 3: Try different API version
    console.log('\n🔄 Test 3: Trying different API version...');
    const altVersionResponse = await makeRequest('/admin/api/2024-01/products.json?limit=5');
    
    if (altVersionResponse.status === 200) {
      console.log('✅ Alternative API version works');
    } else {
      console.log(`❌ Alternative API version failed. Status: ${altVersionResponse.status}`);
    }
    
    // Test 4: Check if it's the specific shop domain
    console.log('\n🌐 Test 4: Checking shop domain...');
    console.log(`Current shop URL: https://${shop}.myshopify.com`);
    
    // Try the full domain from the collection page we saw earlier
    const fullDomainTest = await makeRequest('/admin/api/2023-10/shop.json').catch(() => null);
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testAPIConnection();