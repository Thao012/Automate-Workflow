const https = require('https');

const token = 'shpat_YOUR_TOKEN_HERE';
const shopUrl = 'xtend-outdoors.myshopify.com';

async function debugApiResponse() {
    console.log('Debugging API response...\n');
    
    try {
        const response = await new Promise((resolve, reject) => {
            const options = {
                hostname: shopUrl,
                path: `/admin/api/2023-10/products.json?limit=10`,
                method: 'GET',
                headers: {
                    'X-Shopify-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            };
            
            console.log('Making request to:', `https://${shopUrl}${options.path}`);
            console.log('Headers:', options.headers);
            
            const req = https.request(options, resolve);
            req.on('error', reject);
            req.end();
        });
        
        console.log('Response status:', response.statusCode);
        console.log('Response headers:', response.headers);
        
        let data = '';
        response.on('data', chunk => data += chunk);
        
        await new Promise(resolve => response.on('end', resolve));
        
        console.log('Raw response data length:', data.length);
        console.log('Raw response (first 500 chars):', data.substring(0, 500));
        
        try {
            const jsonData = JSON.parse(data);
            console.log('Parsed JSON successfully');
            console.log('Response keys:', Object.keys(jsonData));
            
            if (jsonData.products) {
                console.log('Products count:', jsonData.products.length);
                if (jsonData.products.length > 0) {
                    console.log('First product title:', jsonData.products[0].title);
                }
            } else {
                console.log('No products key in response');
            }
            
            if (jsonData.errors) {
                console.log('API Errors:', jsonData.errors);
            }
            
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
        }
        
    } catch (error) {
        console.error('Request error:', error.message);
    }
}

debugApiResponse();