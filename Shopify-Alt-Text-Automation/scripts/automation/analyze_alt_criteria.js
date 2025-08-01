const data = require('./products_needing_alt_text.json');

console.log('Alt Text Detection Criteria Analysis');
console.log('='.repeat(50));

const criteria = {};
const examples = {};

data.forEach(product => {
    const alt = product.current_alt;
    let category;
    
    if (alt === null || alt === 'None' || alt === 'null') {
        category = 'null/None values';
    } else if (alt === '' || alt === undefined) {
        category = 'empty string';
    } else if (alt && typeof alt === 'string' && alt.length > 0) {
        if (!alt.includes('Xtend Outdoors')) {
            if (alt === product.title || alt === product.product_title) {
                category = 'title only (missing branding)';
            } else {
                category = 'other text (missing branding)';
            }
        } else {
            category = 'has branding (why detected?)';
        }
    } else {
        category = 'unknown/other';
    }
    
    criteria[category] = (criteria[category] || 0) + 1;
    
    // Store examples
    if (!examples[category]) {
        examples[category] = [];
    }
    if (examples[category].length < 3) {
        examples[category].push({
            title: product.product_title || product.title,
            alt: alt,
            id: product.product_id
        });
    }
});

console.log('\nDetection Criteria Breakdown:');
Object.entries(criteria).forEach(([key, count]) => {
    console.log(`  ${key}: ${count} products`);
});

console.log('\nExamples by Category:');
Object.entries(examples).forEach(([category, prods]) => {
    console.log(`\n${category.toUpperCase()}:`);
    prods.forEach((p, i) => {
        console.log(`  ${i+1}. "${p.title}" - Alt: "${p.alt}" (ID: ${p.id})`);
    });
});

console.log(`\nTotal products analyzed: ${data.length}`);