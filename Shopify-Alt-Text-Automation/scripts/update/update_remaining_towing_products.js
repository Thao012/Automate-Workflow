const axios = require('axios');

// Configuration
const SHOPIFY_DOMAIN = 'xtendoutdoors-store.myshopify.com';
const ACCESS_TOKEN = 'shpat_YOUR_TOKEN_HERE';

// Products that still need alt text updates from comprehensive search
const productsToUpdate = [
  {
    product_id: 14664826290539,
    product_title: "Customisable UHF Channel Sticker",
    image_id: 53608562983275
  },
  {
    product_id: 7418712588403,
    product_title: "Canvas Stone Guard Bag",
    image_id: 33656607473779
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
    product_id: 14625309426027,
    product_title: "D-Shackle 10mm",
    image_id: 53050401325419
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
  },
  {
    product_id: 14664826487147,
    product_title: "Awning Frameset Safety Straps - 2 Pack",
    image_id: 53361702338923
  }
];

async function updateProductImage(productId, imageId, altText) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products/${productId}/images/${imageId}.json`;
  
  try {
    const response = await axios.put(url, {
      image: {
        id: imageId,
        alt: altText
      }
    }, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      product_id: productId,
      image_id: imageId,
      alt_text: altText,
      response: response.data
    };
  } catch (error) {
    return {
      success: false,
      product_id: productId,
      image_id: imageId,
      alt_text: altText,
      error: error.response?.data || error.message
    };
  }
}

async function updateAllProducts() {
  console.log(`Starting update of ${productsToUpdate.length} products...`);
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  for (const product of productsToUpdate) {
    const altText = `${product.product_title} - Xtend Outdoors`;
    
    console.log(`\nUpdating: ${product.product_title}`);
    console.log(`Alt text: ${altText}`);
    
    const result = await updateProductImage(
      product.product_id,
      product.image_id,
      altText
    );
    
    results.push(result);
    
    if (result.success) {
      console.log(`✅ SUCCESS: Updated ${product.product_title}`);
      successCount++;
    } else {
      console.log(`❌ FAILED: ${product.product_title}`);
      console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
      failureCount++;
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('UPDATE SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total products processed: ${productsToUpdate.length}`);
  console.log(`Successful updates: ${successCount}`);
  console.log(`Failed updates: ${failureCount}`);
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fs = require('fs');
  fs.writeFileSync(
    `remaining_towing_products_update_results_${timestamp}.json`,
    JSON.stringify({
      summary: {
        total_processed: productsToUpdate.length,
        successful: successCount,
        failed: failureCount,
        timestamp: new Date().toISOString()
      },
      results: results
    }, null, 2)
  );
  
  console.log(`\nDetailed results saved to: remaining_towing_products_update_results_${timestamp}.json`);
  
  return results;
}

// Run the update
updateAllProducts().catch(console.error);