// Verification script for the 8 final products alt text updates
const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shopUrl = 'xtendoutdoors-store.myshopify.com';

// Products to verify
const productsToVerify = [
  { id: 14664826487147, name: "Awning Frameset Safety Straps - 2 Pack", expectedAlt: "Awning Frameset Safety Straps - 2 Pack - Xtend Outdoors" },
  { id: 7418712588403, name: "Canvas Stone Guard Bag", expectedAlt: "Canvas Stone Guard Bag - Xtend Outdoors" },
  { id: 14625309426027, name: "D-Shackle 10mm", expectedAlt: "D-Shackle 10mm - Xtend Outdoors" },
  { id: 6798410481779, name: "Australia Wide Camper Room Walls", expectedAlt: "Australia Wide Camper Room Walls - Xtend Outdoors" },
  { id: 6798412021875, name: "Awning Tie Down Strap Kit", expectedAlt: "Awning Tie Down Strap Kit - Xtend Outdoors" },
  { id: 6798411530355, name: "Camper Bed Fly", expectedAlt: "Camper Bed Fly - Xtend Outdoors" },
  { id: 6965933146227, name: "Camper Trailer Cover", expectedAlt: "Camper Trailer Cover - Xtend Outdoors" },
  { id: 14705556849003, name: "Caravan Awning Rope Clip Kit", expectedAlt: "Caravan Awning Rope Clip Kit - Xtend Outdoors" }
];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: shopUrl,
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
    
    req.end();
  });
}

async function verifyProducts() {
  console.log('🔍 Verifying final 8 products alt text updates...\n');
  
  const results = [];
  let successCount = 0;
  let mismatchCount = 0;
  
  for (let i = 0; i < productsToVerify.length; i++) {
    const product = productsToVerify[i];
    console.log(`--- Verifying ${i + 1}/8: ${product.name} ---`);
    
    try {
      const result = await makeRequest(`/admin/api/2023-10/products/${product.id}.json`);
      
      if (result.success && result.data.product) {
        const productData = result.data.product;
        const mainImage = productData.images && productData.images[0];
        
        if (mainImage) {
          const currentAlt = mainImage.alt || 'NO ALT TEXT';
          const isMatch = currentAlt === product.expectedAlt;
          
          console.log(`📦 Product: ${productData.title}`);
          console.log(`🖼️  Image ID: ${mainImage.id}`);
          console.log(`🏷️  Current Alt: "${currentAlt}"`);
          console.log(`🎯 Expected Alt: "${product.expectedAlt}"`);
          console.log(`${isMatch ? '✅' : '❌'} Status: ${isMatch ? 'MATCH' : 'MISMATCH'}`);
          
          results.push({
            productId: product.id,
            productName: product.name,
            imageId: mainImage.id,
            currentAlt: currentAlt,
            expectedAlt: product.expectedAlt,
            status: isMatch ? 'MATCH' : 'MISMATCH'
          });
          
          if (isMatch) {
            successCount++;
          } else {
            mismatchCount++;
          }
        } else {
          console.log('❌ No images found for this product');
          results.push({
            productId: product.id,
            productName: product.name,
            status: 'NO_IMAGES'
          });
          mismatchCount++;
        }
      } else {
        console.log(`❌ Failed to fetch product: ${result.error || 'Unknown error'}`);
        results.push({
          productId: product.id,
          productName: product.name,
          status: 'FETCH_ERROR',
          error: result.error
        });
        mismatchCount++;
      }
      
      console.log('');
      
      // Brief pause between requests
      if (i < productsToVerify.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      results.push({
        productId: product.id,
        productName: product.name,
        status: 'ERROR',
        error: error.message
      });
      mismatchCount++;
      console.log('');
    }
  }
  
  // Final summary
  console.log('🎯 VERIFICATION SUMMARY');
  console.log('=======================');
  console.log(`✅ Matching alt text: ${successCount}`);
  console.log(`❌ Mismatches/Errors: ${mismatchCount}`);
  console.log(`📊 Total verified: ${results.length}`);
  
  if (successCount === 8) {
    console.log('\n🏆 ALL PRODUCTS SUCCESSFULLY VERIFIED!');
    console.log('   All alt text updates are confirmed to be working correctly.');
  } else {
    console.log('\n⚠️  Some products need attention:');
    results.filter(r => r.status !== 'MATCH').forEach(result => {
      console.log(`   - ${result.productName}: ${result.status}`);
      if (result.currentAlt && result.expectedAlt) {
        console.log(`     Current: "${result.currentAlt}"`);
        console.log(`     Expected: "${result.expectedAlt}"`);
      }
    });
  }
  
  // Save verification results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fs = require('fs');
  const resultsFile = `verification_final_8_products_${timestamp}.json`;
  
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    shopUrl: shopUrl,
    totalVerified: results.length,
    successCount: successCount,
    mismatchCount: mismatchCount,
    results: results
  }, null, 2));
  
  console.log(`\n💾 Verification results saved to: ${resultsFile}`);
}

verifyProducts();