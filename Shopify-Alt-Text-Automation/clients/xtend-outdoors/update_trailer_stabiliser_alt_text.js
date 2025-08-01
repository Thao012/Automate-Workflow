// Script to update alt text for Trailer Reflectors and Stabiliser products
// Updates each product with format: "[Product Name] - Xtend Outdoors"

const token = 'shpat_YOUR_TOKEN_HERE'; // From .env file
const shop = 'xtend-outdoors'; // Assuming shop name based on directory

// Target products to update
const targetProducts = [
  // Trailer Reflectors
  { id: 7752076525683, name: "Trailer Reflectors Red - 2 Pack" },
  { id: 7752076591219, name: "Trailer Reflectors Amber - 2 Pack" },
  { id: 7752076427379, name: "Trailer Reflectors White - 2 Pack" },
  
  // Stabiliser Products
  { id: 7043845128307, name: "Stabiliser Jack Pads - 4 Pack" },
  { id: 6965930950771, name: "Stabiliser Feet with Pins - 4 Pack" },
  { id: 6965931147379, name: "Stabiliser Stands - Aluminium" },
  { id: 6965931245683, name: "Stabiliser Stands - Plastic" }
];

async function updateAltText() {
  if (!token) {
    console.log('❌ Error: Token not available');
    return;
  }

  console.log('🎯 Updating alt text for Trailer Reflectors and Stabiliser products...\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const product of targetProducts) {
    console.log(`🔄 Processing: ${product.name}`);
    
    try {
      // Get product details first to find the main image
      const productResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/products/${product.id}.json`, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!productResponse.ok) {
        console.log(`❌ FAILED to get product details: ${productResponse.status} ${productResponse.statusText}`);
        failureCount++;
        continue;
      }
      
      const productData = await productResponse.json();
      const mainImage = productData.product.images && productData.product.images[0];
      
      if (!mainImage) {
        console.log(`⚠️  SKIPPED: No images found for ${product.name}`);
        continue;
      }
      
      const currentAltText = mainImage.alt || 'None';
      const newAltText = `${product.name} - Xtend Outdoors`;
      
      console.log(`   Current Alt Text: "${currentAltText}"`);
      console.log(`   New Alt Text: "${newAltText}"`);
      
      // Skip if already has correct format
      if (currentAltText === newAltText) {
        console.log(`✅ ALREADY CORRECT: ${product.name}`);
        successCount++;
        continue;
      }
      
      // Update the alt text
      const updateResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/products/${product.id}/images/${mainImage.id}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: {
            id: mainImage.id,
            alt: newAltText
          }
        })
      });
      
      if (updateResponse.ok) {
        console.log(`✅ SUCCESS: ${product.name}`);
        successCount++;
      } else {
        const errorData = await updateResponse.text();
        console.log(`❌ FAILED: ${product.name}`);
        console.log(`   Error: ${updateResponse.status} ${updateResponse.statusText}`);
        console.log(`   Details: ${errorData}`);
        failureCount++;
      }
      
      // Brief pause between updates to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ERROR processing ${product.name}: ${error.message}`);
      failureCount++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 Update Summary:');
  console.log(`   ✅ Successful updates: ${successCount}`);
  console.log(`   ❌ Failed updates: ${failureCount}`);
  console.log(`   📦 Total products processed: ${targetProducts.length}`);
}

// Check if this script is being run directly
if (require.main === module) {
  updateAltText().catch(console.error);
}

module.exports = { updateAltText, targetProducts };