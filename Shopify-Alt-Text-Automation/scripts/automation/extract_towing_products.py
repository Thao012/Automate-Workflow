#!/usr/bin/env python3
import json
import re

# Load the products JSON file
with open('products_page1.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products = data['products']

# Define towing/trailer related keywords
towing_keywords = [
    'robot', 'trolley', 'trailer', 'reflector', 'stabiliser', 'stabilizer', 
    'jack', 'jerry', 'can', 'wheel', 'clamp', 'towing', 'hitch', 'caravan', 
    'rv', 'coupling', 'safety', 'chain', 'winch', 'jockey', 'brake', 'tail', 
    'light', 'signal', 'indicator', 'amber', 'red', 'white', 'led', 'lamp',
    'mount', 'bracket', 'spare', 'tyre', 'tire', 'hub', 'bearing', 'axle',
    'drawbar', 'tongue', 'ball', 'pin', 'lock', 'security', 'tie', 'down',
    'strap', 'rope', 'bungee', 'elastic', 'cargo', 'load', 'weight',
    'distribution', 'sway', 'control', 'anti', 'reversing', 'backup',
    'camera', 'mirror', 'extension', 'electric', 'brake', 'controller',
    'breakaway', 'safety', 'kit', 'socket', 'plug', 'adapter', 'wiring',
    'harness', 'fuse', 'relay', 'switch'
]

# Function to check if product is towing/trailer related
def is_towing_related(product):
    title = product.get('title', '').lower()
    body = product.get('body_html', '').lower()
    tags = ' '.join(product.get('tags', '').split(', ')).lower()
    
    text_to_search = f"{title} {body} {tags}"
    
    for keyword in towing_keywords:
        if keyword in text_to_search:
            return True
    return False

# Find towing/trailer related products
towing_products = []
for product in products:
    if is_towing_related(product):
        towing_products.append(product)

print(f"Found {len(towing_products)} towing/trailer related products:")
print()

# Check each product for missing alt text
products_needing_alt_text = []

for product in towing_products:
    title = product.get('title', '')
    product_id = product.get('id', '')
    
    # Check main image (position 1)
    main_image = None
    if product.get('images'):
        for image in product['images']:
            if image.get('position') == 1:
                main_image = image
                break
    
    if main_image:
        image_id = main_image.get('id', '')
        alt_text = main_image.get('alt', '')
        
        # Check if alt text is missing or generic
        needs_alt_text = (
            not alt_text or 
            alt_text.strip() == '' or
            alt_text == title or  # Generic alt text same as title
            'Xtend Outdoors' in alt_text and len(alt_text.split()) <= 5  # Generic store name only
        )
        
        if needs_alt_text:
            products_needing_alt_text.append({
                'product_id': product_id,
                'title': title,
                'image_id': image_id,
                'current_alt': alt_text or 'None'
            })
        
        print(f"Product: {title}")
        print(f"  Product ID: {product_id}")
        print(f"  Image ID: {image_id}")
        print(f"  Current Alt Text: '{alt_text or 'None'}'")
        print(f"  Needs Alt Text: {'YES' if needs_alt_text else 'NO'}")
        print()

print(f"\n=== SUMMARY ===")
print(f"Total towing/trailer products found: {len(towing_products)}")
print(f"Products needing alt text updates: {len(products_needing_alt_text)}")
print()

if products_needing_alt_text:
    print("=== PRODUCTS NEEDING ALT TEXT UPDATES ===")
    for product in products_needing_alt_text:
        print(f"Product ID: {product['product_id']}")
        print(f"Title: {product['title']}")
        print(f"Image ID: {product['image_id']}")
        print(f"Current Alt: {product['current_alt']}")
        print("---")