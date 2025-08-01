const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend-outdoors';

async function scanProducts() {
  try {
    // First get the collection ID for towing-trailer
    const collectionsResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/collections.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    const collections = await collectionsResponse.json();
    const towingCollection = collections.collections.find(c => c.handle === 'towing-trailer');
    
    if (!towingCollection) {
      console.log('❌ Towing-trailer collection not found');
      return;
    }
    
    console.log(`✅ Found collection: ${towingCollection.title} (ID: ${towingCollection.id})`);
    
    // Get products in the collection
    const productsResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/collections/${towingCollection.id}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    const products = await productsResponse.json();
    console.log(`\n📦 Found ${products.products.length} products in towing-trailer collection:`);
    
    let needsUpdateCount = 0;
    const productsNeedingUpdate = [];
    
    products.products.forEach((product, index) => {
      const mainImage = product.images && product.images[0];
      const currentAltText = mainImage ? mainImage.alt : 'No image';
      const needsUpdate = !currentAltText || !currentAltText.includes('Xtend Outdoors');
      
      if (needsUpdate && product.title !== 'Digital Wheel Weight Scale 1500kg') {
        needsUpdateCount++;
        productsNeedingUpdate.push({
          title: product.title,
          handle: product.handle,
          id: product.id,
          imageId: mainImage ? mainImage.id : null,
          currentAltText: currentAltText || 'None'
        });
      }
      
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   Handle: ${product.handle}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Current Alt Text: ${currentAltText || 'None'}`);
      console.log(`   Needs Update: ${needsUpdate ? '✅ YES' : '❌ NO'}`);
      if (mainImage) {
        console.log(`   Image ID: ${mainImage.id}`);
      }
    });
    
    console.log(`\n🎯 Products needing alt text updates (excluding Digital Wheel Weight Scale): ${needsUpdateCount}`);
    console.log('\n📋 First 5 products to update:');
    productsNeedingUpdate.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (Handle: ${product.handle})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
  }
}

scanProducts();