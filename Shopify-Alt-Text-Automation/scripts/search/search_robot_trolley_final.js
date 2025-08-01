const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store'; // Correct shop domain

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
          resolve({ 
            status: res.statusCode, 
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data,
            headers: res.headers
          });
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
    console.log(`Shop: ${shop}.myshopify.com`);
    
    // Start with simple request, no pagination
    console.log('Fetching products (limit 250)...');
    const response = await makeRequest('/admin/api/2023-10/products.json?limit=250');
    
    if (response.status !== 200) {
      console.log(`API Error: Status ${response.status}`);
      console.log('Response:', response.data);
      return;
    }
    
    const allProducts = response.data.products || [];
    console.log(`📊 Total products found: ${allProducts.length}`);
    
    if (allProducts.length === 0) {
      console.log('❌ No products found in the store');
      return;
    }
    
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
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) / 100 : 0;
        console.log(`${index + 1}. ${product.title} - $${price.toFixed(2)} (ID: ${product.id}) - Vendor: ${product.vendor}`);
      });
      
      // Let's search for products with "trolley" in the name
      const trolleyProducts = allProducts.filter(product => {
        const title = product.title.toLowerCase();
        return title.includes('trolley');
      });
      
      console.log(`\n🛒 Products containing "Trolley": ${trolleyProducts.length}`);
      trolleyProducts.forEach((product, index) => {
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) / 100 : 0;
        console.log(`${index + 1}. ${product.title} - $${price.toFixed(2)} (ID: ${product.id}) - Vendor: ${product.vendor}`);
      });
      
      // Let's also check high-value products (over $1000)
      const expensiveProducts = allProducts.filter(product => {
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) : 0;
        return price >= 100000; // $1000+ (prices are in cents)
      }).sort((a, b) => {
        const priceA = a.variants && a.variants[0] ? parseFloat(a.variants[0].price) : 0;
        const priceB = b.variants && b.variants[0] ? parseFloat(b.variants[0].price) : 0;
        return priceB - priceA;
      });
      
      console.log(`\n💰 HIGH-VALUE PRODUCTS ($1000+): ${expensiveProducts.length}`);
      expensiveProducts.slice(0, 15).forEach((product, index) => {
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) / 100 : 0;
        const mainImage = product.images && product.images[0];
        const currentAlt = mainImage ? (mainImage.alt || 'EMPTY') : 'NO IMAGE';
        
        console.log(`${index + 1}. ${product.title}`);
        console.log(`    Price: $${price.toFixed(2)} | ID: ${product.id} | Vendor: ${product.vendor}`);
        console.log(`    Alt Text: "${currentAlt}"`);
        console.log('');
      });
      
      // Check if we have any CT products
      const ctProducts = allProducts.filter(product => {
        const title = product.title.toLowerCase();
        const sku = product.variants && product.variants[0] ? (product.variants[0].sku || '').toLowerCase() : '';
        return title.includes('ct1') || title.includes('ct2') || title.includes('ct4') || 
               sku.includes('ct1') || sku.includes('ct2') || sku.includes('ct4');
      });
      
      console.log(`\n🔍 Products with CT models: ${ctProducts.length}`);
      ctProducts.forEach((product, index) => {
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) / 100 : 0;
        const sku = product.variants && product.variants[0] ? product.variants[0].sku : 'N/A';
        console.log(`${index + 1}. ${product.title} - $${price.toFixed(2)} (SKU: ${sku}) - Vendor: ${product.vendor}`);
      });
      
    } else {
      console.log('\n🎯 ROBOT TROLLEY PRODUCTS DETAILS:');
      console.log('='.repeat(60));
      
      robotTrolleyProducts.forEach((product, index) => {
        const mainImage = product.images && product.images[0];
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) / 100 : 0;
        
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Handle: ${product.handle}`);
        console.log(`   Vendor: ${product.vendor}`);
        console.log(`   Price: $${price.toFixed(2)}`);
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
    console.error('❌ Error:', error.message);
  }
}

searchRobotTrolleyProducts();