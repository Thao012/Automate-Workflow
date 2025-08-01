const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store';

// Test with just a few products from our towing list
const testProducts = [
  {
    product_id: 14625309426027,
    product_title: "D-Shackle 10mm",
    image_id: 53050401325419
  },
  {
    product_id: 14664826487147,
    product_title: "Awning Frameset Safety Straps - 2 Pack",
    image_id: 53361702338923
  },
  {
    product_id: 7418712588403,
    product_title: "Canvas Stone Guard Bag",
    image_id: 33656607473779
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
  console.log(`Product ID: ${productId}, Image ID: ${imageId}`);
  console.log(`New Alt Text: "${altText}"`);

  try {
    const updatePath = `/admin/api/2023-10/products/${productId}/images/${imageId}.json`;
    const updateData = {
      image: {
        id: imageId,
        alt: altText
      }
    };

    const updateResult = await makeRequest(updatePath, 'PUT', updateData);
    
    if (updateResult.status === 200) {
      console.log(`✅ SUCCESS: Alt text updated successfully!`);
      console.log(`New alt text: "${updateResult.data.image.alt}"`);
      return { success: true, data: updateResult.data };
    } else {
      console.log(`❌ FAILED: Status ${updateResult.status}`);
      console.log(`Error:`, updateResult.data);
      return { success: false, error: updateResult.data };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testProductUpdates() {
  console.log('🧪 TESTING PRODUCT ALT TEXT UPDATES');
  console.log('=====================================\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const product of testProducts) {
    const altText = `${product.product_title} - Xtend Outdoors`;
    const result = await updateImageAltText(
      product.product_id,
      product.image_id,
      altText,
      product.product_title
    );
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total products tested: ${testProducts.length}`);
  console.log(`Successful updates: ${successCount}`);
  console.log(`Failed updates: ${failureCount}`);
  
  if (successCount > 0) {
    console.log('\n✅ API is working! Ready to update all remaining products.');
  } else {
    console.log('\n❌ API issues detected. Check credentials and product IDs.');
  }
}

testProductUpdates().catch(console.error);