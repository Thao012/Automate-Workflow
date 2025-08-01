const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store';

// Stabiliser products from the target list
const STABILISER_PRODUCTS = [
  { id: '7043845128307', name: 'Stabiliser Jack Pads - 4 Pack' },
  { id: '6965930950771', name: 'Stabiliser Feet with Pins - 4 Pack' },
  { id: '6965931147379', name: 'Stabiliser Stands - Aluminium' },
  { id: '6965931245683', name: 'Stabiliser Stands - Plastic' }
];

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: shop + '.myshopify.com',
      path: path,
      method: method,
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function getProductImageIds() {
  console.log('🔍 GETTING IMAGE IDS FOR STABILISER PRODUCTS');
  console.log('='.repeat(60));
  console.log(`Shop: ${shop}.myshopify.com`);
  console.log(`Processing ${STABILISER_PRODUCTS.length} products...\n`);
  
  const productData = [];
  
  for (const product of STABILISER_PRODUCTS) {
    console.log(`🔄 Getting details for: ${product.name}`);
    console.log(`   Product ID: ${product.id}`);
    
    try {
      const response = await makeRequest(`/admin/api/2023-10/products/${product.id}.json`);
      
      if (response.status === 200 && response.data.product) {
        const productInfo = response.data.product;
        const mainImage = productInfo.images && productInfo.images[0];
        
        if (mainImage) {
          const currentAlt = mainImage.alt || 'None';
          const newAlt = `${product.name} - Xtend Outdoors`;
          
          console.log(`   ✅ SUCCESS`);
          console.log(`   Main Image ID: ${mainImage.id}`);
          console.log(`   Current Alt: "${currentAlt}"`);
          console.log(`   Proposed Alt: "${newAlt}"`);
          
          productData.push({
            id: product.id,
            name: product.name,
            imageId: mainImage.id,
            currentAlt: currentAlt,
            newAlt: newAlt,
            needsUpdate: currentAlt !== newAlt
          });
        } else {
          console.log(`   ⚠️  NO IMAGES FOUND`);
          productData.push({
            id: product.id,
            name: product.name,
            imageId: null,
            currentAlt: 'No image',
            newAlt: `${product.name} - Xtend Outdoors`,
            needsUpdate: false
          });
        }
      } else {
        console.log(`   ❌ FAILED: Status ${response.status}`);
        console.log(`   Response:`, response.data);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`Total products checked: ${productData.length}`);
  
  const needsUpdate = productData.filter(p => p.needsUpdate);
  const hasImages = productData.filter(p => p.imageId);
  
  console.log(`Products with images: ${hasImages.length}`);
  console.log(`Products needing alt text update: ${needsUpdate.length}`);
  
  if (needsUpdate.length > 0) {
    console.log('\n🎯 PRODUCTS NEEDING UPDATE:');
    needsUpdate.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}, Image ID: ${product.imageId}`);
      console.log(`   From: "${product.currentAlt}" → To: "${product.newAlt}"`);
    });
  } else {
    console.log('\n✅ All products already have correct alt text!');
  }
  
  // Write data to file for use in update script
  const fs = require('fs');
  fs.writeFileSync('stabiliser_products_data.json', JSON.stringify(productData, null, 2));
  console.log('\n💾 Product data saved to stabiliser_products_data.json');
  
  return productData;
}

// Run the script
getProductImageIds().catch(console.error);