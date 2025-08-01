const fs = require('fs');

// Products that need alt text updates - including the D-Shackle 8mm we found
const towingProductsNeedingAltText = [
    {
        product_id: 14625309360491,
        product_title: "D-Shackle 8mm",
        product_handle: "d-shackle-8mm",
        image_id: 53050401128811,
        product_status: "active",
        current_alt: null
    },
    {
        product_id: 14625309426027,
        product_title: "D-Shackle 10mm",
        product_handle: "d-shackle-10mm",
        image_id: 53050401325419,
        product_status: "active",
        current_alt: null
    },
    {
        product_id: 14625309458795,
        product_title: "D-Shackle 11mm",
        product_handle: "d-shackle-11mm",
        image_id: 53050401358187,
        product_status: "active",
        current_alt: null
    },
    {
        product_id: 14625309491563,
        product_title: "D-Shackle 13mm",
        product_handle: "d-shackle-13mm",
        image_id: 53050401390955,
        product_status: "active",
        current_alt: null
    },
    {
        product_id: 14664826487147,
        product_title: "Awning Frameset Safety Straps - 2 Pack",
        product_handle: "caravan-awning-safety-strap-2-pack",
        image_id: 53361702338923,
        product_status: "active",
        current_alt: null
    },
    {
        product_id: 7321639452787,
        product_title: "Camper Trailer Stone Guard",
        product_handle: "camper-trailer-stone-guard",
        image_id: 53880784421227,
        product_status: "active",
        current_alt: null
    },
    {
        product_id: 7418712588403,
        product_title: "Canvas Stone Guard Bag",
        product_handle: "stone-guard-bag",
        image_id: 33656607473779,
        product_status: "active",
        current_alt: null
    }
];

console.log('FINAL REPORT: Towing/Trailer Products Needing Alt Text Updates');
console.log('=' .repeat(80));
console.log(`Total products found: ${towingProductsNeedingAltText.length}`);
console.log('');

towingProductsNeedingAltText.forEach((product, index) => {
    console.log(`${index + 1}. ${product.product_title}`);
    console.log(`   Product ID: ${product.product_id}`);
    console.log(`   Image ID: ${product.image_id}`);
    console.log(`   Handle: ${product.product_handle}`);
    console.log(`   Status: ${product.product_status}`);
    console.log(`   Current Alt Text: ${product.current_alt}`);
    console.log('');
});

console.log('SHOPIFY API UPDATE COMMANDS:');
console.log('=' .repeat(80));
console.log('To update these products, use the following Shopify API calls:\n');

towingProductsNeedingAltText.forEach((product, index) => {
    const suggestedAltText = `${product.product_title} - Xtend Outdoors`;
    console.log(`${index + 1}. Update ${product.product_title}:`);
    console.log(`   PUT /admin/api/2024-01/products/${product.product_id}/images/${product.image_id}.json`);
    console.log(`   Body: { "image": { "id": ${product.image_id}, "alt": "${suggestedAltText}" } }`);
    console.log('');
});

// Save the final results
fs.writeFileSync('final_towing_products_report.json', JSON.stringify({
    summary: {
        total_products: towingProductsNeedingAltText.length,
        report_date: new Date().toISOString(),
        store: "xtendoutdoors-store.myshopify.com"
    },
    products: towingProductsNeedingAltText
}, null, 2));

console.log('✓ Final report saved to final_towing_products_report.json');