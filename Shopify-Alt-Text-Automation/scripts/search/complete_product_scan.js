const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store';

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

async function getAllProducts() {
  try {
    console.log('🔍 COMPLETE PRODUCT SCAN FOR ROBOT TROLLEY PRODUCTS');
    console.log('='.repeat(60));
    console.log(`Shop: ${shop}.myshopify.com`);
    
    let allProducts = [];
    let sinceId = null;
    let iteration = 1;
    const limit = 250;
    
    while (true) {
      let path = `/admin/api/2023-10/products.json?limit=${limit}`;
      if (sinceId) {
        path += `&since_id=${sinceId}`;
      }
      
      console.log(`\n📦 Iteration ${iteration}: Fetching products...`);
      console.log(`Path: ${path}`);
      
      const response = await makeRequest(path);
      
      if (response.status !== 200) {
        console.log(`❌ API Error: Status ${response.status}`);
        console.log('Response:', response.data);
        break;
      }
      
      const products = response.data.products || [];
      console.log(`Found ${products.length} products`);
      
      if (products.length === 0) {
        console.log('No more products found');
        break;
      }
      
      allProducts = allProducts.concat(products);
      console.log(`Total products so far: ${allProducts.length}`);
      
      // Update since_id for next iteration
      sinceId = products[products.length - 1].id;
      console.log(`Next since_id: ${sinceId}`);
      
      // If we got less than the limit, we've reached the end
      if (products.length < limit) {
        console.log('Last batch reached (less than limit returned)');
        break;
      }
      
      iteration++;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Safety break to prevent infinite loop
      if (iteration > 20) {
        console.log('⚠️  Safety break: More than 20 iterations');
        break;
      }
    }
    
    console.log(`\n📊 FINAL RESULTS: ${allProducts.length} total products scanned`);
    
    // Now search for Robot Trolley products
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
    
    if (robotTrolleyProducts.length > 0) {
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
          console.log(`   Needs Update: ${mainImage.alt !== product.title + ' - Xtend Outdoors' ? 'YES' : 'NO'}`);
        } else {
          console.log(`   ❌ No main image found`);
        }
      });
    } else {
      console.log('\n❌ No Robot Trolley products found in entire catalog');
      
      // Search for any products with "Robot" in the name
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
      
      // Search for products with "trolley" in the name  
      const trolleyProducts = allProducts.filter(product => {
        const title = product.title.toLowerCase();
        return title.includes('trolley');
      });
      
      console.log(`\n🛒 Products containing "Trolley": ${trolleyProducts.length}`);
      trolleyProducts.forEach((product, index) => {
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) / 100 : 0;
        console.log(`${index + 1}. ${product.title} - $${price.toFixed(2)} (ID: ${product.id}) - Vendor: ${product.vendor}`);
      });
      
      // Show highest priced products
      const expensiveProducts = allProducts.filter(product => {
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) : 0;
        return price >= 300000; // $3000+ (prices are in cents)
      }).sort((a, b) => {
        const priceA = a.variants && a.variants[0] ? parseFloat(a.variants[0].price) : 0;
        const priceB = b.variants && b.variants[0] ? parseFloat(b.variants[0].price) : 0;
        return priceB - priceA;
      });
      
      console.log(`\n💰 HIGH-VALUE PRODUCTS ($3000+): ${expensiveProducts.length}`);
      expensiveProducts.slice(0, 10).forEach((product, index) => {
        const price = product.variants && product.variants[0] ? parseFloat(product.variants[0].price) / 100 : 0;
        const mainImage = product.images && product.images[0];
        const altText = mainImage ? (mainImage.alt || 'EMPTY') : 'NO IMAGE';
        
        console.log(`${index + 1}. ${product.title}`);
        console.log(`    Price: $${price.toFixed(2)} | ID: ${product.id} | Vendor: ${product.vendor}`);
        console.log(`    Alt Text: "${altText}"`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getAllProducts();