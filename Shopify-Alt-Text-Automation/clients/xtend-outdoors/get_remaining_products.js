const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend-outdoors';

async function getRemainingProducts() {
  try {
    // First get the collection ID for towing-trailer
    const collectionsResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/collections.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (!collectionsResponse.ok) {
      throw new Error(`Collections API error: ${collectionsResponse.status} ${collectionsResponse.statusText}`);
    }
    
    const collections = await collectionsResponse.json();
    console.log('Available collections:', collections.collections.map(c => c.handle));
    
    const towingCollection = collections.collections.find(c => c.handle === 'towing-trailer');
    
    if (!towingCollection) {
      console.log('❌ Towing-trailer collection not found');
      console.log('Available collections:', collections.collections.map(c => c.handle));
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
    
    if (!productsResponse.ok) {
      throw new Error(`Products API error: ${productsResponse.status} ${productsResponse.statusText}`);
    }
    
    const products = await productsResponse.json();
    console.log(`\n📦 Found ${products.products.length} products in towing-trailer collection:`);
    
    let needsUpdateCount = 0;
    const allProducts = [];
    
    products.products.forEach((product, index) => {
      const mainImage = product.images && product.images[0];
      const currentAltText = mainImage ? mainImage.alt : 'No image';
      const needsUpdate = !currentAltText || !currentAltText.includes('Xtend Outdoors');
      
      allProducts.push({
        index: index + 1,
        title: product.title,
        handle: product.handle,
        id: product.id,
        imageId: mainImage ? mainImage.id : null,
        currentAltText: currentAltText || 'None',
        needsUpdate: needsUpdate
      });
      
      if (needsUpdate) {
        needsUpdateCount++;
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
    
    console.log(`\n🎯 Total products needing alt text updates: ${needsUpdateCount}`);
    
    // Show products starting from position 5
    const remainingProducts = allProducts.filter(p => p.needsUpdate && p.index >= 5);
    console.log(`\n📋 Products 5+ that need updates (${remainingProducts.length} products):`);
    remainingProducts.forEach((product) => {
      console.log(`${product.index}. ${product.title} (Handle: ${product.handle})`);
      console.log(`   Current Alt Text: ${product.currentAltText}`);
      console.log(`   Product ID: ${product.id}, Image ID: ${product.imageId}`);
    });
    
    return remainingProducts;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getRemainingProducts();