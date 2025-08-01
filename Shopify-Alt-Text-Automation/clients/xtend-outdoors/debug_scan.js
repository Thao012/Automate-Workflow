const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend-outdoors';

async function debugScan() {
  try {
    console.log('🔍 Testing Shopify API connection...');
    
    // Test basic API access
    const collectionsResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/collections.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${collectionsResponse.status}`);
    console.log(`Response headers:`, Object.fromEntries(collectionsResponse.headers.entries()));
    
    const collectionsText = await collectionsResponse.text();
    console.log('\nRaw response:');
    console.log(collectionsText);
    
    try {
      const collections = JSON.parse(collectionsText);
      console.log('\nParsed collections:', JSON.stringify(collections, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

debugScan();