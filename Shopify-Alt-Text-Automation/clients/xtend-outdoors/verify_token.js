const token = 'shpat_YOUR_TOKEN_HERE';
const shop = 'xtend'; // This one gave 401 instead of 404

async function verifyToken() {
  try {
    console.log('🔍 Verifying token with xtend.myshopify.com...\n');
    console.log(`Token format: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
    
    // Try with different API versions
    const apiVersions = ['2023-10', '2023-07', '2023-04', '2024-01'];
    
    for (const version of apiVersions) {
      console.log(`\nTesting API version: ${version}`);
      
      const response = await fetch(`https://${shop}.myshopify.com/admin/api/${version}/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('✅ SUCCESS!');
        console.log(`Shop: ${data.shop.name}`);
        console.log(`Domain: ${data.shop.myshopify_domain}`);
        return { shop, version };
      } else if (response.status === 401) {
        const errorData = await response.text();
        console.log(`❌ 401 Error details: ${errorData}`);
      } else {
        const errorData = await response.text();
        console.log(`❌ Error details: ${errorData}`);
      }
    }
    
    // Try with Authorization header instead
    console.log('\n🔄 Trying with Authorization header...');
    const authResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/shop.json`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Auth header status: ${authResponse.status}`);
    if (authResponse.status === 200) {
      const data = await authResponse.json();
      console.log('✅ SUCCESS with Authorization header!');
      console.log(`Shop: ${data.shop.name}`);
    } else {
      const errorData = await authResponse.text();
      console.log(`❌ Auth header error: ${errorData}`);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

verifyToken();