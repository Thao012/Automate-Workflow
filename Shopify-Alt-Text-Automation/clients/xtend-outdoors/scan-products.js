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

async function findTowingProducts() {
  try {
    console.log('=== SEARCHING ALL PRODUCTS FOR TOWING/TRAILER ITEMS ===');
    
    const response = await makeRequest('/admin/api/2023-10/products.json?limit=250');
    
    if (!response.products) {
      console.log('No products found or API error');
      console.log('Response:', response);
      return;
    }
    
    console.log('Total products found: ' + response.products.length);
    
    const towingProducts = response.products.filter(product => {
      const title = product.title.toLowerCase();
      const handle = product.handle.toLowerCase();
      const description = (product.body_html || '').toLowerCase();
      
      return title.includes('towing') || 
             title.includes('trailer') || 
             title.includes('hitch') ||
             handle.includes('towing') || 
             handle.includes('trailer') || 
             handle.includes('hitch') ||
             description.includes('towing') || 
             description.includes('trailer');
    });
    
    console.log('\n=== FOUND ' + towingProducts.length + ' TOWING/TRAILER PRODUCTS ===');
    
    towingProducts.forEach((product, index) => {
      const mainImage = product.images && product.images[0];
      console.log('Product ' + (index + 1) + ':');
      console.log('  ID: ' + product.id);
      console.log('  Handle: ' + product.handle);
      console.log('  Title: ' + product.title);
      console.log('  Main Image ID: ' + (mainImage ? mainImage.id : 'No image'));
      console.log('  Current Alt Text: "' + (mainImage && mainImage.alt ? mainImage.alt : 'EMPTY') + '"');
      console.log('  Target Alt Text: "' + product.title + ' - Xtend Outdoors"');
      console.log('');
    });
    
    if (towingProducts.length >= 10) {
      console.log('=== PRODUCTS 6-10 FOR BATCH UPDATE ===');
      for (let i = 5; i < 10 && i < towingProducts.length; i++) {
        const product = towingProducts[i];
        const mainImage = product.images && product.images[0];
        console.log('Product ' + (i + 1) + ' (UPDATE TARGET):');
        console.log('  ID: ' + product.id);
        console.log('  Title: ' + product.title);
        console.log('  Image ID: ' + (mainImage ? mainImage.id : 'No image'));
        console.log('  Current Alt: "' + (mainImage && mainImage.alt ? mainImage.alt : 'EMPTY') + '"');
        console.log('  New Alt: "' + product.title + ' - Xtend Outdoors"');
        console.log('');
      }
    } else if (towingProducts.length > 0) {
      console.log('Not enough towing products found for batch 6-10. Total: ' + towingProducts.length);
      console.log('Will show all available products for reference...');
      
      towingProducts.forEach((product, index) => {
        const mainImage = product.images && product.images[0];
        console.log('Available Product ' + (index + 1) + ':');
        console.log('  Title: ' + product.title);
        console.log('  Current Alt: "' + (mainImage && mainImage.alt ? mainImage.alt : 'EMPTY') + '"');
      });
    } else {
      console.log('No towing/trailer products found. Let me show first 20 products to see what\'s available:');
      
      response.products.slice(0, 20).forEach((product, index) => {
        console.log('Product ' + (index + 1) + ': ' + product.title);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

findTowingProducts();