const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store';

// Robot Trolley products to update (focusing on active high-value ones first)
const ROBOT_TROLLEY_PRODUCTS = [
  {
    id: '14704364716395',
    imageId: '53758650941803',
    title: 'Robot Trolley CT1500 G4 with Portable Battery',
    expectedAlt: 'Robot Trolley CT1500 G4 with Portable Battery - Xtend Outdoors',
    priority: 'HIGH',
    status: 'active'
  },
  {
    id: '14704364749163',
    imageId: '53758651662699',
    title: 'Robot Trolley CT2500 G2 with Portable Battery',
    expectedAlt: 'Robot Trolley CT2500 G2 with Portable Battery - Xtend Outdoors',
    priority: 'HIGH',
    status: 'active'
  },
  {
    id: '14704364781931',
    imageId: '53758652350827',
    title: 'Robot Trolley CT4500 G2 with Portable Battery',
    expectedAlt: 'Robot Trolley CT4500 G2 with Portable Battery - Xtend Outdoors',
    priority: 'HIGH',
    status: 'active'
  },
  {
    id: '14704363733355',
    imageId: '53758646452587',
    title: 'Robot Trolley CT1500',
    expectedAlt: 'Robot Trolley CT1500 - Xtend Outdoors',
    priority: 'MEDIUM',
    status: 'draft'
  },
  {
    id: '14704363766123',
    imageId: '53758646976875',
    title: 'Robot Trolley CT4500',
    expectedAlt: 'Robot Trolley CT4500 - Xtend Outdoors',
    priority: 'MEDIUM',
    status: 'draft'
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

async function processRobotTrolleyProducts() {
  console.log('🤖 ROBOT TROLLEY ALT TEXT UPDATE SCRIPT');
  console.log('='.repeat(60));
  console.log(`Processing ${ROBOT_TROLLEY_PRODUCTS.length} Robot Trolley products...`);
  console.log(`Shop: ${shop}.myshopify.com`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Process high priority items first
  const highPriority = ROBOT_TROLLEY_PRODUCTS.filter(p => p.priority === 'HIGH');
  const mediumPriority = ROBOT_TROLLEY_PRODUCTS.filter(p => p.priority === 'MEDIUM');
  
  console.log(`\n🎯 PROCESSING HIGH PRIORITY PRODUCTS (${highPriority.length})`);
  console.log('These are the active, high-value products mentioned in the original request.');
  
  for (const product of highPriority) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔥 HIGH PRIORITY: ${product.title}`);
    console.log(`   Status: ${product.status.toUpperCase()}`);
    console.log(`   Priority: ${product.priority}`);
    
    try {
      const success = await updateImageAltText(
        product.id,
        product.imageId,
        product.expectedAlt,
        product.title
      );
      
      if (success) {
        successCount++;
        console.log(`   🎉 ${product.title} - SUCCESSFULLY UPDATED`);
      } else {
        failureCount++;
        console.log(`   💥 ${product.title} - UPDATE FAILED`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`   ❌ Error updating ${product.title}:`, error.message);
      failureCount++;
    }
  }
  
  console.log(`\n📊 MEDIUM PRIORITY PRODUCTS (${mediumPriority.length})`);
  console.log('These are draft products, updating for completeness.');
  
  for (const product of mediumPriority) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 MEDIUM PRIORITY: ${product.title}`);
    console.log(`   Status: ${product.status.toUpperCase()}`);
    console.log(`   Priority: ${product.priority}`);
    
    try {
      const success = await updateImageAltText(
        product.id,
        product.imageId,
        product.expectedAlt,
        product.title
      );
      
      if (success) {
        successCount++;
        console.log(`   ✅ ${product.title} - SUCCESSFULLY UPDATED`);
      } else {
        failureCount++;
        console.log(`   ❌ ${product.title} - UPDATE FAILED`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.log(`   ❌ Error updating ${product.title}:`, error.message);
      failureCount++;
    }
  }
  
  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('🏁 ROBOT TROLLEY ALT TEXT UPDATE COMPLETE');
  console.log(`✅ Successful updates: ${successCount}`);
  console.log(`❌ Failed updates: ${failureCount}`);
  console.log(`📊 Total processed: ${successCount + failureCount}/${ROBOT_TROLLEY_PRODUCTS.length}`);
  
  const highPrioritySuccess = highPriority.length - failureCount;
  
  if (highPrioritySuccess === highPriority.length) {
    console.log('\n🎉 ALL HIGH-VALUE ROBOT TROLLEY PRODUCTS UPDATED SUCCESSFULLY!');
    console.log('The $3000+ Robot Trolley products now have proper alt text for SEO.');
    console.log('\nUpdated products:');
    highPriority.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Alt text: "${product.expectedAlt}"`);
    });
  } else if (successCount > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some products updated');
    console.log(`High priority updates successful: ${Math.max(0, highPrioritySuccess)}/${highPriority.length}`);
  } else {
    console.log('\n❌ NO PRODUCTS UPDATED - Please check errors above');
  }
  
  if (successCount > 0) {
    console.log('\n📈 SEO IMPACT:');
    console.log('- Improved search engine visibility for high-value products');
    console.log('- Better accessibility for screen readers');
    console.log('- Enhanced user experience with descriptive image alt text');
    console.log('- Professional branding with "Xtend Outdoors" in alt text');
  }
}

// Run the script
processRobotTrolleyProducts().catch(console.error);