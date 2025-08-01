const https = require('https');
const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtendoutdoors-store';

// Products to verify
const PRODUCTS_TO_VERIFY = [
  {
    id: '14704364716395',
    imageId: '53758650941803',
    title: 'Robot Trolley CT1500 G4 with Portable Battery',
    expectedAlt: 'Robot Trolley CT1500 G4 with Portable Battery - Xtend Outdoors',
    priority: 'HIGH'
  },
  {
    id: '14704364749163',
    imageId: '53758651662699',
    title: 'Robot Trolley CT2500 G2 with Portable Battery',
    expectedAlt: 'Robot Trolley CT2500 G2 with Portable Battery - Xtend Outdoors',
    priority: 'HIGH'
  },
  {
    id: '14704364781931',
    imageId: '53758652350827',
    title: 'Robot Trolley CT4500 G2 with Portable Battery',
    expectedAlt: 'Robot Trolley CT4500 G2 with Portable Battery - Xtend Outdoors',
    priority: 'HIGH'
  },
  {
    id: '14704363733355',
    imageId: '53758646452587',
    title: 'Robot Trolley CT1500',
    expectedAlt: 'Robot Trolley CT1500 - Xtend Outdoors',
    priority: 'MEDIUM'
  },
  {
    id: '14704363766123',
    imageId: '53758646976875',
    title: 'Robot Trolley CT4500',
    expectedAlt: 'Robot Trolley CT4500 - Xtend Outdoors',
    priority: 'MEDIUM'
  }
];

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
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function verifyProduct(product) {
  console.log(`\n🔍 VERIFYING: ${product.title}`);
  console.log(`   Priority: ${product.priority}`);
  console.log(`   Product ID: ${product.id}`);
  console.log(`   Image ID: ${product.imageId}`);
  
  try {
    const response = await makeRequest(`/admin/api/2023-10/products/${product.id}.json`);
    
    if (response.status !== 200) {
      console.log(`   ❌ Failed to fetch product. Status: ${response.status}`);
      return false;
    }
    
    const productData = response.data.product;
    const mainImage = productData.images.find(img => img.id == product.imageId);
    
    if (!mainImage) {
      console.log(`   ❌ Main image not found`);
      return false;
    }
    
    const currentAlt = mainImage.alt || '';
    console.log(`   Expected Alt: "${product.expectedAlt}"`);
    console.log(`   Current Alt:  "${currentAlt}"`);
    
    if (currentAlt === product.expectedAlt) {
      console.log(`   ✅ ALT TEXT VERIFIED - Update successful!`);
      return true;
    } else {
      console.log(`   ❌ ALT TEXT MISMATCH - Update may have failed`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error verifying product: ${error.message}`);
    return false;
  }
}

async function verifyAllUpdates() {
  console.log('🔎 ROBOT TROLLEY ALT TEXT VERIFICATION');
  console.log('='.repeat(60));
  console.log(`Verifying ${PRODUCTS_TO_VERIFY.length} Robot Trolley products...`);
  
  let verifiedCount = 0;
  let failedCount = 0;
  let highPriorityVerified = 0;
  
  const highPriority = PRODUCTS_TO_VERIFY.filter(p => p.priority === 'HIGH');
  
  for (const product of PRODUCTS_TO_VERIFY) {
    const verified = await verifyProduct(product);
    
    if (verified) {
      verifiedCount++;
      if (product.priority === 'HIGH') {
        highPriorityVerified++;
      }
    } else {
      failedCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 VERIFICATION SUMMARY');
  console.log(`✅ Successfully verified: ${verifiedCount}`);
  console.log(`❌ Verification failed: ${failedCount}`);
  console.log(`📊 Total checked: ${verifiedCount + failedCount}/${PRODUCTS_TO_VERIFY.length}`);
  console.log(`🎯 High priority verified: ${highPriorityVerified}/${highPriority.length}`);
  
  if (highPriorityVerified === highPriority.length) {
    console.log('\n🎉 ALL HIGH-VALUE ROBOT TROLLEY PRODUCTS VERIFIED!');
    console.log('The $3000+ Robot Trolley products have correct alt text.');
    
    console.log('\n✅ VERIFIED HIGH-VALUE PRODUCTS:');
    highPriority.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Alt text: "${product.expectedAlt}"`);
    });
    
    console.log('\n📈 SEO BENEFITS CONFIRMED:');
    console.log('• Enhanced search engine visibility for high-value products');
    console.log('• Improved accessibility compliance');
    console.log('• Professional branding with "Xtend Outdoors" suffix');
    console.log('• Better user experience for screen reader users');
    
  } else {
    console.log('\n⚠️  Some high-priority products may need re-verification');
  }
  
  if (verifiedCount === PRODUCTS_TO_VERIFY.length) {
    console.log('\n🏆 PERFECT SCORE: All Robot Trolley products verified successfully!');
  }
}

verifyAllUpdates().catch(console.error);