const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend-outdoors';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
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
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function searchRobotTrolleyProducts() {
  try {
    console.log('🔍 SEARCHING FOR ROBOT TROLLEY PRODUCTS');
    console.log('='.repeat(50));
    
    // Get all products to search through them
    let allProducts = [];
    let page = 1;
    const limit = 250;
    
    while (true) {
      console.log(`Fetching page ${page}...`);
      const response = await makeRequest(`/admin/api/2023-10/products.json?limit=${limit}&page=${page}`);
      
      if (!response.products || response.products.length === 0) {
        console.log(`No more products found on page ${page}`);
        break;
      }
      
      allProducts = allProducts.concat(response.products);
      console.log(`Page ${page}: Found ${response.products.length} products (Total: ${allProducts.length})`);
      
      if (response.products.length < limit) {
        console.log('Last page reached');
        break;
      }
      
      page++;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 Total products scanned: ${allProducts.length}`);
    
    // Search for Robot Trolley products
    const robotTrolleyProducts = allProducts.filter(product => {
      const title = product.title.toLowerCase();
      const vendor = (product.vendor || '').toLowerCase();
      const handle = product.handle.toLowerCase();
      
      return title.includes('robot trolley') || 
             vendor.includes('robot trolley') ||
             handle.includes('robot-trolley') ||
             title.includes('ct1500') ||
             title.includes('ct2500') ||
             title.includes('ct4500');
    });
    
    console.log(`\n🤖 ROBOT TROLLEY PRODUCTS FOUND: ${robotTrolleyProducts.length}`);
    
    if (robotTrolleyProducts.length === 0) {
      console.log('\n❌ No Robot Trolley products found');
      
      // Let's also search for any products with "Robot" in the name
      const robotProducts = allProducts.filter(product => {
        const title = product.title.toLowerCase();
        const vendor = (product.vendor || '').toLowerCase();
        return title.includes('robot') || vendor.includes('robot');
      });
      
      console.log(`\n🔍 Products containing "Robot": ${robotProducts.length}`);
      robotProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} (ID: ${product.id}) - Vendor: ${product.vendor}`);
      });
      
      // Let's search for products with "trolley" in the name
      const trolleyProducts = allProducts.filter(product => {
        const title = product.title.toLowerCase();
        return title.includes('trolley');
      });
      
      console.log(`\n🛒 Products containing "Trolley": ${trolleyProducts.length}`);
      trolleyProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} (ID: ${product.id}) - Vendor: ${product.vendor}`);
      });
      
    } else {
      console.log('\n🎯 ROBOT TROLLEY PRODUCTS DETAILS:');
      console.log('='.repeat(60));
      
      robotTrolleyProducts.forEach((product, index) => {
        const mainImage = product.images && product.images[0];
        
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Handle: ${product.handle}`);
        console.log(`   Vendor: ${product.vendor}`);
        console.log(`   Price: $${(product.variants[0]?.price / 100).toFixed(2) || 'N/A'}`);
        console.log(`   Status: ${product.status}`);
        console.log(`   Images: ${product.images ? product.images.length : 0}`);
        
        if (mainImage) {
          console.log(`   Main Image ID: ${mainImage.id}`);
          console.log(`   Current Alt: "${mainImage.alt || 'EMPTY'}"`);
          console.log(`   Target Alt: "${product.title} - Xtend Outdoors"`);
        } else {
          console.log(`   ❌ No main image found`);
        }
      });
      
      // Show update commands
      console.log(`\n${'='.repeat(60)}`);
      console.log('📝 PRODUCTS READY FOR ALT TEXT UPDATE:');
      
      robotTrolleyProducts.forEach((product, index) => {
        const mainImage = product.images && product.images[0];
        if (mainImage && mainImage.alt !== `${product.title} - Xtend Outdoors`) {
          console.log(`\n${index + 1}. ${product.title}`);
          console.log(`   Product ID: ${product.id}`);
          console.log(`   Image ID: ${mainImage.id}`);
          console.log(`   Current: "${mainImage.alt || 'EMPTY'}"`);
          console.log(`   Target: "${product.title} - Xtend Outdoors"`);
          console.log(`   ⚠️  NEEDS UPDATE`);
        } else if (mainImage) {
          console.log(`\n${index + 1}. ${product.title} - ✅ Already has correct alt text`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

searchRobotTrolleyProducts();