const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('towing_trailer_products.json', 'utf8'));

  const targetProducts = [
    'Stabiliser Jack Pads - 4 Pack',
    'Stabiliser Feet with Pins - 4 Pack', 
    'Stabiliser Stands - Aluminium',
    'Stabiliser Stands - Plastic',
    'Trailer Reflectors Red - 2 Pack',
    'Trailer Reflectors Amber - 2 Pack',
    'Trailer Reflectors White - 2 Pack'
  ];

  console.log('🔍 Searching for target products...\n');

  const foundProducts = [];

  data.products.forEach((product, index) => {
    if (targetProducts.includes(product.title)) {
      console.log(`✅ Found: ${product.title}`);
      console.log(`   Product ID: ${product.id}`);
      
      if (product.images && product.images[0]) {
        console.log(`   Main Image ID: ${product.images[0].id}`);
        console.log(`   Current Alt Text: ${product.images[0].alt || 'None'}`);
        
        foundProducts.push({
          id: product.id,
          title: product.title,
          imageId: product.images[0].id,
          currentAlt: product.images[0].alt || 'None'
        });
      } else {
        console.log(`   ❌ No images found`);
      }
      console.log('');
    }
  });

  console.log(`\n📊 Summary: Found ${foundProducts.length} out of ${targetProducts.length} target products`);
  
  // Save for use in update script
  fs.writeFileSync('target_products_data.json', JSON.stringify(foundProducts, null, 2));
  console.log('💾 Product data saved to target_products_data.json');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}