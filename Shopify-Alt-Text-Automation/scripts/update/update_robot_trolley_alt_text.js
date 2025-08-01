const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend-outdoors';

// High-value Robot Trolley products to update
const ROBOT_TROLLEY_PRODUCTS = [
  {
    id: '14704364716395',
    title: 'Robot Trolley CT1500 G4',
    expectedAlt: 'Robot Trolley CT1500 G4 - Xtend Outdoors'
  },
  {
    id: '14704364749163',
    title: 'Robot Trolley CT2500 G2',
    expectedAlt: 'Robot Trolley CT2500 G2 - Xtend Outdoors'
  },
  {
    id: '14704364781931',
    title: 'Robot Trolley CT4500 G2',
    expectedAlt: 'Robot Trolley CT4500 G2 - Xtend Outdoors'
  }
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

async function getProductDetails(productId) {
  console.log(`\n=== Getting details for product ${productId} ===`);
  
  const response = await makeRequest(`/admin/api/2023-10/products/${productId}.json`);
  
  if (response.status !== 200) {
    console.log(`❌ Failed to get product ${productId}. Status: ${response.status}`);
    console.log('Response:', response.data);
    return null;
  }
  
  return response.data.product;
}

async function updateImageAltText(productId, imageId, altText) {
  console.log(`\n=== Updating image ${imageId} alt text ===`);
  console.log(`New alt text: "${altText}"`);
  
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
    console.log(`✅ Successfully updated alt text for image ${imageId}`);
    return true;
  } else {
    console.log(`❌ Failed to update image ${imageId}. Status: ${response.status}`);
    console.log('Response:', response.data);
    return false;
  }
}

async function processRobotTrolleyProducts() {
  console.log('🤖 ROBOT TROLLEY ALT TEXT UPDATE SCRIPT');
  console.log('='.repeat(50));
  console.log(`Processing ${ROBOT_TROLLEY_PRODUCTS.length} high-value Robot Trolley products...`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const productInfo of ROBOT_TROLLEY_PRODUCTS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 PROCESSING: ${productInfo.title}`);
    console.log(`Product ID: ${productInfo.id}`);
    console.log(`Target Alt Text: "${productInfo.expectedAlt}"`);
    
    try {
      // Get full product details
      const product = await getProductDetails(productInfo.id);
      
      if (!product) {
        console.log(`❌ Could not retrieve product details for ${productInfo.title}`);
        failureCount++;
        continue;
      }
      
      console.log(`📊 Product: ${product.title}`);
      console.log(`📦 Handle: ${product.handle}`);
      console.log(`🏷️  Vendor: ${product.vendor}`);
      console.log(`🔢 Total Images: ${product.images ? product.images.length : 0}`);
      
      // Find main image (first image)
      if (!product.images || product.images.length === 0) {
        console.log(`❌ No images found for ${productInfo.title}`);
        failureCount++;
        continue;
      }
      
      const mainImage = product.images[0];
      console.log(`\n🖼️  MAIN IMAGE DETAILS:`);
      console.log(`   Image ID: ${mainImage.id}`);
      console.log(`   Current Alt: "${mainImage.alt || 'EMPTY'}"`);
      console.log(`   Image URL: ${mainImage.src}`);
      console.log(`   Position: ${mainImage.position}`);
      
      // Check if alt text needs updating
      if (mainImage.alt === productInfo.expectedAlt) {
        console.log(`✅ Alt text already correct for ${productInfo.title}`);
        successCount++;
        continue;
      }
      
      // Update alt text
      console.log(`\n🔄 UPDATING ALT TEXT...`);
      console.log(`   From: "${mainImage.alt || 'EMPTY'}"`);
      console.log(`   To: "${productInfo.expectedAlt}"`);
      
      const updateSuccess = await updateImageAltText(
        productInfo.id,
        mainImage.id,
        productInfo.expectedAlt
      );
      
      if (updateSuccess) {
        successCount++;
        console.log(`✅ ${productInfo.title} - ALT TEXT UPDATED SUCCESSFULLY`);
      } else {
        failureCount++;
        console.log(`❌ ${productInfo.title} - FAILED TO UPDATE ALT TEXT`);
      }
      
      // Small delay between requests to be respectful to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Error processing ${productInfo.title}:`, error.message);
      failureCount++;
    }
  }
  
  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('🏁 ROBOT TROLLEY UPDATE COMPLETE');
  console.log(`✅ Successful updates: ${successCount}`);
  console.log(`❌ Failed updates: ${failureCount}`);
  console.log(`📊 Total processed: ${successCount + failureCount}/${ROBOT_TROLLEY_PRODUCTS.length}`);
  
  if (successCount === ROBOT_TROLLEY_PRODUCTS.length) {
    console.log('\n🎉 ALL ROBOT TROLLEY PRODUCTS UPDATED SUCCESSFULLY!');
    console.log('These high-value products now have proper alt text for SEO.');
  } else if (successCount > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some products updated');
  } else {
    console.log('\n❌ NO PRODUCTS UPDATED - Please check errors above');
  }
}

// Run the script
processRobotTrolleyProducts().catch(console.error);