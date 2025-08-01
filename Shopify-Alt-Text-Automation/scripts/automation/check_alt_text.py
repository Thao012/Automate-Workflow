#!/usr/bin/env python3
import json

# Read the JSON file
with open('towing_trailer_products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products_missing_alt = []
completed_product = "Digital Wheel Weight Scale 1500kg"

print("=== TOWING-TRAILER COLLECTION ALT TEXT ANALYSIS ===\n")

for product in data['products']:
    product_name = product['title']
    product_handle = product['handle']
    
    # Skip the already completed product
    if product_name == completed_product:
        print(f"SKIPPED: {product_name} (already completed)")
        continue
    
    # Check if product has images
    if not product['images']:
        print(f"WARNING: {product_name} has no images")
        continue
    
    # Get the main image (position 1)
    main_image = None
    for image in product['images']:
        if image['position'] == 1:
            main_image = image
            break
    
    if not main_image:
        print(f"WARNING: {product_name} has no main image (position 1)")
        continue
    
    # Check if alt text is missing or empty
    alt_text = main_image.get('alt')
    if not alt_text or alt_text.strip() == '':
        products_missing_alt.append({
            'name': product_name,
            'handle': product_handle,
            'image_id': main_image['id'],
            'image_src': main_image['src']
        })
        print(f"NEEDS ALT TEXT: {product_name}")
        print(f"  Handle: {product_handle}")
        print(f"  Image ID: {main_image['id']}")
        print()
    else:
        print(f"HAS ALT TEXT: {product_name}")
        print(f"  Alt: {alt_text}")
        print()

print("=== SUMMARY ===")
print(f"Total products checked: {len(data['products']) - 1}")  # -1 for skipped product
print(f"Products needing alt text: {len(products_missing_alt)}")
print(f"Skipped (already completed): {completed_product}")

if products_missing_alt:
    print("\n=== PRODUCTS NEEDING ALT TEXT UPDATES ===")
    for i, product in enumerate(products_missing_alt, 1):
        print(f"{i}. {product['name']}")
        print(f"   Handle: {product['handle']}")
        print(f"   Image ID: {product['image_id']}")
        print()