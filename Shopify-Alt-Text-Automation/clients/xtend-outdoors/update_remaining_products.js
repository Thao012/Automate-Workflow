// Template script for updating remaining products (5+) from towing-trailer collection
// Requires valid API credentials to function

const token = 'YOUR_VALID_TOKEN_HERE'; // Update with working token
const shop = 'YOUR_SHOP_NAME_HERE';    // Update with correct shop name

async function updateRemainingProducts() {
  try {
    console.log('🔍 Getting towing-trailer collection products...\n');
    
    // Get collection first
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
    const towingCollection = collections.collections.find(c => c.handle === 'towing-trailer');
    
    if (!towingCollection) {
      console.log('❌ Towing-trailer collection not found');
      return;
    }
    
    // Get products in collection
    const productsResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/collections/${towingCollection.id}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    const products = await productsResponse.json();
    console.log(`📦 Found ${products.products.length} products in collection`);
    
    // Filter products starting from position 5 that need updates
    const productsToUpdate = [];
    products.products.forEach((product, index) => {
      if (index >= 4) { // Position 5+ (0-based index)
        const mainImage = product.images && product.images[0];
        const currentAltText = mainImage ? mainImage.alt : '';
        const needsUpdate = !currentAltText || !currentAltText.includes('Xtend Outdoors');
        
        if (needsUpdate && mainImage) {
          productsToUpdate.push({
            position: index + 1,
            title: product.title,
            productId: product.id,
            imageId: mainImage.id,
            currentAltText: currentAltText || 'None'
          });
        }
      }
    });
    
    console.log(`\n🎯 Found ${productsToUpdate.length} products (position 5+) needing alt text updates:`);
    productsToUpdate.forEach(p => {
      console.log(`${p.position}. ${p.title} - Current: "${p.currentAltText}"`);
    });
    
    // Update each product one at a time with verification
    for (const product of productsToUpdate) {
      console.log(`\n🔄 Updating: ${product.title}`);
      
      const newAltText = `${product.title} - Xtend Outdoors`;
      
      try {
        const updateResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/products/${product.productId}/images/${product.imageId}.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: {
              id: product.imageId,
              alt: newAltText
            }
          })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ SUCCESS: ${product.title}`);
          console.log(`   New Alt Text: "${newAltText}"`);
          
          // Brief pause between updates
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          const errorData = await updateResponse.text();
          console.log(`❌ FAILED: ${product.title}`);
          console.log(`   Error: ${updateResponse.status} ${updateResponse.statusText}`);
          console.log(`   Details: ${errorData}`);
          break; // Stop on first error as per safety protocol
        }
        
      } catch (updateError) {
        console.log(`❌ ERROR updating ${product.title}: ${updateError.message}`);
        break; // Stop on first error
      }
    }
    
    console.log('\n🏁 Alt text update process completed');
    
  } catch (error) {
    console.error('❌ Script Error:', error.message);
  }
}

// Uncomment when credentials are ready:
// updateRemainingProducts();