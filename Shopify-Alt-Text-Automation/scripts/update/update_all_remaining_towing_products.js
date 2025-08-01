const https = require('https');
const fs = require('fs');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store';

// All remaining products that need alt text updates
const productsToUpdate = [
  {
    product_id: 14664826290539,
    product_title: "Customisable UHF Channel Sticker",
    image_id: 53608562983275
  },
  {
    product_id: 7321639452787,
    product_title: "Camper Trailer Stone Guard",
    image_id: 53880784421227
  },
  {
    product_id: 7321639387251,
    product_title: "Caravan Stone Guard",
    image_id: 53880784421227
  },
  {
    product_id: 7348056948851,
    product_title: "24\" HD Smart Caravan TV",
    image_id: 33295725101171
  },
  {
    product_id: 7348057047155,
    product_title: "32\" HD DVD Smart Caravan TV",
    image_id: 33295726018675
  },
  {
    product_id: 7331300147315,
    product_title: "20L Jerry Can Holder",
    image_id: 33200135929971
  },
  {
    product_id: 14716243280235,
    product_title: "12V 2kW Diesel Heater",
    image_id: 53863236305259
  },
  {
    product_id: 7471528509555,
    product_title: "21.5\" LED Light Bar Bundle",
    image_id: 33953587855475
  },
  {
    product_id: 6998933667955,
    product_title: "31.5\" LED Light Bar",
    image_id: 35444707459187
  },
  {
    product_id: 6998933733491,
    product_title: "41.5\" LED Light Bar",
    image_id: 35445451161715
  },
  {
    product_id: 14664826159467,
    product_title: "50 Amp Heavy Duty Connector - Grey 2 Pack",
    image_id: 53361698865515
  },
  {
    product_id: 14664826093931,
    product_title: "50 Amp Heavy Duty Connector - Red 2 Pack",
    image_id: 53361698668907
  },
  {
    product_id: 6998932422771,
    product_title: "7\" LED Spotlight Driving Light",
    image_id: 35445470396531
  },
  {
    product_id: 6998932979827,
    product_title: "9\" LED Spotlight Driving Light",
    image_id: 35445475115123
  },
  {
    product_id: 14625309360491,
    product_title: "D-Shackle 8mm",
    image_id: 53050401128811
  },
  {
    product_id: 14625309458795,
    product_title: "D-Shackle 11mm",
    image_id: 53050401358187
  },
  {
    product_id: 14625309491563,
    product_title: "D-Shackle 13mm",
    image_id: 53050401390955
  }
  // Note: D-Shackle 10mm, Awning Frameset Safety Straps, and Canvas Stone Guard Bag were already updated in test
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
      return { 
        success: true, 
        productId: productId,
        imageId: imageId,
        productTitle: productTitle,
        newAltText: altText,
        data: updateResult.data 
      };
    } else {
      console.log(`❌ FAILED: Status ${updateResult.status}`);
      console.log(`Error:`, updateResult.data);
      return { 
        success: false, 
        productId: productId,
        imageId: imageId,
        productTitle: productTitle,
        altText: altText,
        error: updateResult.data 
      };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { 
      success: false, 
      productId: productId,
      imageId: imageId,
      productTitle: productTitle,
      altText: altText,
      error: error.message 
    };
  }
}

async function updateAllRemainingProducts() {
  console.log('🚀 UPDATING ALL REMAINING TOWING PRODUCTS ALT TEXT');
  console.log('=================================================\n');
  console.log(`Total products to update: ${productsToUpdate.length}\n`);
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < productsToUpdate.length; i++) {
    const product = productsToUpdate[i];
    const altText = `${product.product_title} - Xtend Outdoors`;
    
    console.log(`\n[${i + 1}/${productsToUpdate.length}] Processing product...`);
    
    const result = await updateImageAltText(
      product.product_id,
      product.image_id,
      altText,
      product.product_title
    );
    
    results.push(result);
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add delay between requests to be respectful to the API
    if (i < productsToUpdate.length - 1) {
      console.log(`⏳ Waiting 1 second before next request...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total products processed: ${productsToUpdate.length}`);
  console.log(`Successful updates: ${successCount}`);
  console.log(`Failed updates: ${failureCount}`);
  console.log(`Success rate: ${((successCount / productsToUpdate.length) * 100).toFixed(1)}%`);
  
  // List successful updates
  if (successCount > 0) {
    console.log('\n✅ SUCCESSFULLY UPDATED PRODUCTS:');
    results.filter(r => r.success).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.productTitle}`);
    });
  }
  
  // List failed updates
  if (failureCount > 0) {
    console.log('\n❌ FAILED UPDATES:');
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.productTitle} - ${result.error}`);
    });
  }
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFilename = `remaining_towing_products_final_update_${timestamp}.json`;
  
  const report = {
    summary: {
      total_processed: productsToUpdate.length,
      successful: successCount,
      failed: failureCount,
      success_rate: ((successCount / productsToUpdate.length) * 100).toFixed(1) + '%',
      timestamp: new Date().toISOString()
    },
    successful_updates: results.filter(r => r.success),
    failed_updates: results.filter(r => !r.success),
    all_results: results
  };
  
  fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
  console.log(`\n📊 Detailed report saved to: ${reportFilename}`);
  
  console.log('\n🎉 Alt text update process completed!');
  
  return report;
}

// Start the update process
updateAllRemainingProducts().catch(console.error);