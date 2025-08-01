// Final update script for 8 remaining products with alt text fixes
// Auto-discovers correct shop URL and updates all specified products

const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';

// Products to update with their specific data
const productsToUpdate = [
  // NULL alt text updates (set to "[Product Name] - Xtend Outdoors")
  {
    id: 14664826487147,
    imageId: 53361702338923,
    name: "Awning Frameset Safety Straps - 2 Pack",
    newAltText: "Awning Frameset Safety Straps - 2 Pack - Xtend Outdoors",
    type: "NULL_ALT_TEXT"
  },
  {
    id: 7418712588403,
    imageId: 33656607473779,
    name: "Canvas Stone Guard Bag",
    newAltText: "Canvas Stone Guard Bag - Xtend Outdoors",
    type: "NULL_ALT_TEXT"
  },
  {
    id: 14625309426027,
    imageId: 53050401325419,
    name: "D-Shackle 10mm",
    newAltText: "D-Shackle 10mm - Xtend Outdoors",
    type: "NULL_ALT_TEXT"
  },
  // Branding additions (need to fetch current alt text and add " - Xtend Outdoors")
  {
    id: 6798410481779,
    name: "Australia Wide Camper Room Walls",
    newAltText: "Australia Wide Camper Room Walls - Xtend Outdoors",
    type: "ADD_BRANDING"
  },
  {
    id: 6798412021875,
    name: "Awning Tie Down Strap Kit",
    newAltText: "Awning Tie Down Strap Kit - Xtend Outdoors",
    type: "ADD_BRANDING"
  },
  {
    id: 6798411530355,
    name: "Camper Bed Fly",
    newAltText: "Camper Bed Fly - Xtend Outdoors",
    type: "ADD_BRANDING"
  },
  {
    id: 6965933146227,
    name: "Camper Trailer Cover",
    newAltText: "Camper Trailer Cover - Xtend Outdoors",
    type: "ADD_BRANDING"
  },
  {
    id: 14705556849003,
    name: "Caravan Awning Rope Clip Kit",
    newAltText: "Caravan Awning Rope Clip Kit - Xtend Outdoors",
    type: "ADD_BRANDING"
  }
];

// Test different shop URL formats
const shopFormats = [
  'xtendoutdoors-store.myshopify.com',
  'xtend-outdoors.myshopify.com',
  'xtendoutdoors.myshopify.com', 
  'xtend-outdoors-australia.myshopify.com'
];

function makeRequest(shopUrl, path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: shopUrl,
      path: path,
      method: method,
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
          const result = JSON.parse(data);
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, data: result, statusCode: res.statusCode });
        } catch (e) {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function findWorkingShopUrl() {
  console.log('🔍 Finding correct shop URL...\n');
  
  for (const shopUrl of shopFormats) {
    try {
      console.log(`Testing: ${shopUrl}`);
      const result = await makeRequest(shopUrl, '/admin/api/2023-10/shop.json');
      
      if (result.success && result.data.shop) {
        console.log(`✅ SUCCESS! Found shop: ${result.data.shop.name}`);
        console.log(`   Domain: ${result.data.shop.domain}`);
        return shopUrl;
      } else {
        console.log(`❌ Failed: ${result.error || 'No shop data'}`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  throw new Error('No working shop URL found');
}

async function getProductDetails(shopUrl, productId) {
  try {
    const result = await makeRequest(shopUrl, `/admin/api/2023-10/products/${productId}.json`);
    
    if (result.success && result.data.product) {
      return result.data.product;
    } else {
      throw new Error(`Failed to fetch product ${productId}: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    throw new Error(`Error fetching product ${productId}: ${error.message}`);
  }
}

async function updateImageAltText(shopUrl, productId, imageId, newAltText) {
  try {
    const body = {
      image: {
        id: imageId,
        alt: newAltText
      }
    };
    
    const result = await makeRequest(
      shopUrl, 
      `/admin/api/2023-10/products/${productId}/images/${imageId}.json`, 
      'PUT', 
      body
    );
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      throw new Error(`API Error: ${result.statusCode} - ${JSON.stringify(result.data || result.error)}`);
    }
  } catch (error) {
    throw new Error(`Update failed: ${error.message}`);
  }
}

async function updateProducts() {
  try {
    console.log('🚀 Starting final 8 products alt text update process...\n');
    
    // Find working shop URL
    const shopUrl = await findWorkingShopUrl();
    console.log(`\n🏪 Using shop URL: ${shopUrl}\n`);
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    // Process each product
    for (let i = 0; i < productsToUpdate.length; i++) {
      const product = productsToUpdate[i];
      console.log(`\n--- Processing ${i + 1}/8: ${product.name} ---`);
      
      try {
        // Get product details to find main image if needed
        const productDetails = await getProductDetails(shopUrl, product.id);
        console.log(`📦 Product found: ${productDetails.title}`);
        
        let imageIdToUpdate = product.imageId;
        let currentAltText = '';
        
        if (product.type === "ADD_BRANDING" && !product.imageId) {
          // For branding additions, find the main image
          if (productDetails.images && productDetails.images.length > 0) {
            const mainImage = productDetails.images[0];
            imageIdToUpdate = mainImage.id;
            currentAltText = mainImage.alt || '';
            console.log(`🖼️  Main image ID: ${imageIdToUpdate}`);
            console.log(`🏷️  Current alt text: "${currentAltText}"`);
          } else {
            throw new Error('No images found for this product');
          }
        } else if (product.type === "NULL_ALT_TEXT") {
          // For NULL alt text updates, we already have the image ID
          const targetImage = productDetails.images.find(img => img.id === product.imageId);
          if (targetImage) {
            currentAltText = targetImage.alt || 'NULL';
            console.log(`🖼️  Target image ID: ${imageIdToUpdate}`);
            console.log(`🏷️  Current alt text: "${currentAltText}"`);
          } else {
            throw new Error(`Image ID ${product.imageId} not found in product`);
          }
        }
        
        // Update the alt text
        console.log(`🔄 Updating alt text to: "${product.newAltText}"`);
        
        const updateResult = await updateImageAltText(
          shopUrl, 
          product.id, 
          imageIdToUpdate, 
          product.newAltText
        );
        
        if (updateResult.success) {
          console.log(`✅ SUCCESS: ${product.name}`);
          console.log(`   Updated alt text: "${product.newAltText}"`);
          
          results.push({
            product: product.name,
            productId: product.id,
            imageId: imageIdToUpdate,
            status: 'SUCCESS',
            oldAltText: currentAltText,
            newAltText: product.newAltText,
            type: product.type
          });
          
          successCount++;
        } else {
          throw new Error('Update returned success=false');
        }
        
        // Brief pause between updates to avoid rate limiting
        if (i < productsToUpdate.length - 1) {
          console.log('⏱️  Pausing 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.log(`❌ FAILED: ${product.name}`);
        console.log(`   Error: ${error.message}`);
        
        results.push({
          product: product.name,
          productId: product.id,
          status: 'FAILED',
          error: error.message,
          type: product.type
        });
        
        failureCount++;
        
        // Continue with next product instead of stopping
        console.log('   Continuing with next product...');
      }
    }
    
    // Final summary
    console.log('\n🎯 FINAL SUMMARY');
    console.log('================');
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${failureCount}`);
    console.log(`📊 Total processed: ${results.length}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.product} (${result.type})`);
      console.log(`   Status: ${result.status}`);
      if (result.status === 'SUCCESS') {
        console.log(`   Old: "${result.oldAltText}"`);
        console.log(`   New: "${result.newAltText}"`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fs = require('fs');
    const resultsFile = `final_8_products_update_${timestamp}.json`;
    
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      shopUrl: shopUrl,
      totalProcessed: results.length,
      successCount: successCount,
      failureCount: failureCount,
      results: results
    }, null, 2));
    
    console.log(`💾 Results saved to: ${resultsFile}`);
    console.log('\n🏁 Update process completed!');
    
  } catch (error) {
    console.error('❌ SCRIPT ERROR:', error.message);
    console.error('   Stack trace:', error.stack);
  }
}

// Run the update process
updateProducts();