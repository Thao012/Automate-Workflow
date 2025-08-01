const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store';

// Only the product that needs updating
const STABILISER_PRODUCT_TO_UPDATE = {
  id: '7043845128307',
  imageId: '35445549269107',
  title: 'Stabiliser Jack Pads - 4 Pack',
  expectedAlt: 'Stabiliser Jack Pads - 4 Pack - Xtend Outdoors',
  currentAlt: 'None'
};

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

async function updateImageAltText(productId, imageId, altText, productTitle) {
  console.log(`\n🔄 UPDATING ALT TEXT FOR: ${productTitle}`);
  console.log(`   Product ID: ${productId}`);
  console.log(`   Image ID: ${imageId}`);
  console.log(`   New Alt Text: "${altText}"`);
  
  const updateData = {
    image: {
      id: imageId,
      alt: altText
    }
  };
  
  const response = await makeRequest(
    `/admin/api/2023-10/products/${productId}/images/${imageId}.json`,
    'PUT',
    updateData
  );
  
  if (response.status === 200) {
    console.log(`   ✅ SUCCESS: Alt text updated successfully`);
    return true;
  } else {
    console.log(`   ❌ FAILED: Status ${response.status}`);
    console.log(`   Response:`, response.data);
    return false;
  }
}

async function updateStabiliserProduct() {
  console.log('🔧 STABILISER PRODUCT ALT TEXT UPDATE');
  console.log('='.repeat(60));
  console.log(`Shop: ${shop}.myshopify.com`);
  console.log('Updating the one stabiliser product that needs alt text...\n');
  
  const product = STABILISER_PRODUCT_TO_UPDATE;
  
  console.log(`🎯 PRODUCT TO UPDATE: ${product.title}`);
  console.log(`   Current Alt: "${product.currentAlt}"`);
  console.log(`   Target Alt: "${product.expectedAlt}"`);
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    
    const success = await updateImageAltText(
      product.id,
      product.imageId,
      product.expectedAlt,
      product.title
    );
    
    console.log(`\n${'='.repeat(60)}`);
    
    if (success) {
      console.log('🎉 STABILISER ALT TEXT UPDATE COMPLETE!');
      console.log(`✅ Successfully updated: ${product.title}`);
      console.log(`📝 Alt text: "${product.expectedAlt}"`);
      console.log('\n📈 BENEFITS:');
      console.log('- Improved SEO visibility for caravan stabiliser accessories');
      console.log('- Enhanced accessibility for screen readers');
      console.log('- Consistent branding with "Xtend Outdoors" suffix');
      console.log('- Better product discoverability in search engines');
    } else {
      console.log('❌ STABILISER ALT TEXT UPDATE FAILED');
      console.log(`💥 Failed to update: ${product.title}`);
      console.log('Please check the error details above.');
    }
    
  } catch (error) {
    console.log(`❌ Error updating ${product.title}:`, error.message);
    console.log('🔍 Please check your network connection and API credentials.');
  }
  
  console.log('\n🔍 VERIFICATION RECOMMENDED:');
  console.log('Visit the product page to confirm the alt text was applied correctly.');
  console.log(`Product: ${product.title}`);
}

// Run the script
updateStabiliserProduct().catch(console.error);