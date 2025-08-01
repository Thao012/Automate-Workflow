# Shopify Alt Text Detection and Update System
## Technical Specification Document

### Table of Contents
1. [System Overview](#system-overview)
2. [Detection Algorithm](#detection-algorithm)
3. [Search Strategy](#search-strategy)
4. [Update Process](#update-process)
5. [Quality Assurance](#quality-assurance)
6. [Implementation Examples](#implementation-examples)
7. [Best Practices](#best-practices)

---

## System Overview

### Architecture Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Detection     │    │     Search      │    │     Update      │
│   Algorithm     │───▶│    Strategy     │───▶│    Process      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Quality       │    │   Progress      │    │     Error       │
│   Assurance     │    │   Tracking      │    │   Handling      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Features
- **Intelligent Detection**: Multi-layered approach to identify inadequate alt text
- **Scalable Search**: Efficient pagination and filtering for large catalogs
- **Batch Processing**: Handle thousands of products with rate limiting
- **Quality Control**: Comprehensive verification and compliance checking
- **Progress Monitoring**: Real-time tracking and detailed reporting

---

## 1. Detection Algorithm

### Detection Criteria

#### 1.1 Missing Alt Text Detection
```javascript
const detectMissingAltText = (product) => {
    const issues = [];
    
    product.images.forEach((image, index) => {
        // Check for completely missing alt text
        if (!image.alt || image.alt === null || image.alt === '') {
            issues.push({
                type: 'MISSING_ALT',
                imageId: image.id,
                imageIndex: index,
                severity: 'HIGH',
                description: 'Alt text is completely missing'
            });
        }
        
        // Check for whitespace-only alt text
        if (image.alt && image.alt.trim() === '') {
            issues.push({
                type: 'EMPTY_ALT',
                imageId: image.id,
                imageIndex: index,
                severity: 'HIGH',
                description: 'Alt text contains only whitespace'
            });
        }
    });
    
    return issues;
};
```

#### 1.2 Generic Alt Text Detection
```javascript
const detectGenericAltText = (product) => {
    const issues = [];
    const productTitle = product.title.toLowerCase().trim();
    
    product.images.forEach((image, index) => {
        const altText = image.alt ? image.alt.toLowerCase().trim() : '';
        
        // Check if alt text is just the product title
        if (altText === productTitle) {
            issues.push({
                type: 'GENERIC_TITLE_ALT',
                imageId: image.id,
                imageIndex: index,
                severity: 'MEDIUM',
                description: 'Alt text is identical to product title'
            });
        }
        
        // Check for generic phrases
        const genericPhrases = [
            'image', 'picture', 'photo', 'product image',
            'product photo', 'item', 'untitled', 'img'
        ];
        
        if (genericPhrases.includes(altText)) {
            issues.push({
                type: 'GENERIC_PHRASE_ALT',
                imageId: image.id,
                imageIndex: index,
                severity: 'HIGH',
                description: `Alt text uses generic phrase: "${altText}"`
            });
        }
    });
    
    return issues;
};
```

#### 1.3 Non-Descriptive Alt Text Detection
```javascript
const detectNonDescriptiveAltText = (product) => {
    const issues = [];
    
    product.images.forEach((image, index) => {
        const altText = image.alt ? image.alt.trim() : '';
        
        if (altText) {
            // Check for minimum word count
            const wordCount = altText.split(/\s+/).length;
            if (wordCount < 3) {
                issues.push({
                    type: 'TOO_SHORT_ALT',
                    imageId: image.id,
                    imageIndex: index,
                    severity: 'MEDIUM',
                    description: `Alt text too short (${wordCount} words)`
                });
            }
            
            // Check for SEO keywords
            const hasProductKeywords = checkForProductKeywords(altText, product);
            if (!hasProductKeywords) {
                issues.push({
                    type: 'MISSING_KEYWORDS',
                    imageId: image.id,
                    imageIndex: index,
                    severity: 'LOW',
                    description: 'Alt text lacks relevant product keywords'
                });
            }
            
            // Check for brand suffix
            const hasBrandSuffix = checkForBrandSuffix(altText, product);
            if (!hasBrandSuffix) {
                issues.push({
                    type: 'MISSING_BRAND',
                    imageId: image.id,
                    imageIndex: index,
                    severity: 'LOW',
                    description: 'Alt text missing brand name'
                });
            }
        }
    });
    
    return issues;
};

const checkForProductKeywords = (altText, product) => {
    const keywords = [
        ...product.tags,
        product.product_type,
        product.vendor
    ].filter(Boolean).map(k => k.toLowerCase());
    
    const altLower = altText.toLowerCase();
    return keywords.some(keyword => altLower.includes(keyword));
};

const checkForBrandSuffix = (altText, product) => {
    const brand = product.vendor || '';
    return brand && altText.toLowerCase().includes(brand.toLowerCase());
};
```

#### 1.4 Master Detection Function
```javascript
const detectAltTextIssues = (product) => {
    const allIssues = [
        ...detectMissingAltText(product),
        ...detectGenericAltText(product),
        ...detectNonDescriptiveAltText(product)
    ];
    
    return {
        productId: product.id,
        productTitle: product.title,
        totalImages: product.images.length,
        issueCount: allIssues.length,
        issues: allIssues,
        priority: calculatePriority(allIssues)
    };
};

const calculatePriority = (issues) => {
    const highCount = issues.filter(i => i.severity === 'HIGH').length;
    const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;
    
    if (highCount > 0) return 'HIGH';
    if (mediumCount > 0) return 'MEDIUM';
    return 'LOW';
};
```

---

## 2. Search Strategy

### 2.1 Full Catalog Scan with Pagination
```javascript
class ShopifyProductScanner {
    constructor(shopDomain, accessToken) {
        this.shopDomain = shopDomain;
        this.accessToken = accessToken;
        this.apiUrl = `https://${shopDomain}.myshopify.com/admin/api/2024-01/`;
        this.pageSize = 50; // Shopify max is 250, but 50 is more stable
        this.rateLimit = 2; // Requests per second
    }
    
    async scanAllProducts(options = {}) {
        const {
            collectionId = null,
            productType = null,
            vendor = null,
            tags = null,
            onProgress = null
        } = options;
        
        let allProducts = [];
        let pageInfo = null;
        let page = 1;
        
        do {
            try {
                const params = this.buildQueryParams({
                    limit: this.pageSize,
                    page_info: pageInfo,
                    collection_id: collectionId,
                    product_type: productType,
                    vendor: vendor,
                    tags: tags
                });
                
                const response = await this.makeRequest(`products.json?${params}`);
                const products = response.products;
                
                allProducts = allProducts.concat(products);
                
                // Extract next page info from Link header
                pageInfo = this.extractPageInfo(response.headers);
                
                if (onProgress) {
                    onProgress({
                        page,
                        productsFound: allProducts.length,
                        currentBatch: products.length
                    });
                }
                
                page++;
                
                // Rate limiting
                await this.delay(1000 / this.rateLimit);
                
            } catch (error) {
                console.error(`Error scanning page ${page}:`, error);
                throw error;
            }
            
        } while (pageInfo);
        
        return allProducts;
    }
    
    buildQueryParams(params) {
        const query = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                query.append(key, value);
            }
        });
        
        return query.toString();
    }
    
    extractPageInfo(headers) {
        const linkHeader = headers.get('Link');
        if (!linkHeader) return null;
        
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        if (!nextMatch) return null;
        
        const url = new URL(nextMatch[1]);
        return url.searchParams.get('page_info');
    }
    
    async makeRequest(endpoint) {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            headers: {
                'X-Shopify-Access-Token': this.accessToken,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return {
            ...await response.json(),
            headers: response.headers
        };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

### 2.2 Collection-Specific Searches
```javascript
class CollectionScanner extends ShopifyProductScanner {
    async scanCollectionProducts(collectionId, options = {}) {
        const collection = await this.getCollection(collectionId);
        console.log(`Scanning collection: ${collection.title}`);
        
        return await this.scanAllProducts({
            ...options,
            collectionId
        });
    }
    
    async getAllCollections() {
        let allCollections = [];
        let pageInfo = null;
        
        do {
            const params = this.buildQueryParams({
                limit: this.pageSize,
                page_info: pageInfo
            });
            
            const response = await this.makeRequest(`collections.json?${params}`);
            allCollections = allCollections.concat(response.collections);
            pageInfo = this.extractPageInfo(response.headers);
            
            await this.delay(1000 / this.rateLimit);
        } while (pageInfo);
        
        return allCollections;
    }
    
    async getCollection(collectionId) {
        const response = await this.makeRequest(`collections/${collectionId}.json`);
        return response.collection;
    }
}
```

### 2.3 Keyword-Based Filtering
```javascript
class KeywordFilterScanner extends ShopifyProductScanner {
    async scanByKeywords(keywords, options = {}) {
        const {
            searchFields = ['title', 'tags', 'product_type'],
            matchType = 'any' // 'any' or 'all'
        } = options;
        
        const allProducts = await this.scanAllProducts(options);
        
        return allProducts.filter(product => {
            const matches = keywords.map(keyword => 
                this.productMatchesKeyword(product, keyword, searchFields)
            );
            
            return matchType === 'any' 
                ? matches.some(Boolean)
                : matches.every(Boolean);
        });
    }
    
    productMatchesKeyword(product, keyword, searchFields) {
        const keywordLower = keyword.toLowerCase();
        
        return searchFields.some(field => {
            switch (field) {
                case 'title':
                    return product.title.toLowerCase().includes(keywordLower);
                case 'tags':
                    return product.tags.some(tag => 
                        tag.toLowerCase().includes(keywordLower)
                    );
                case 'product_type':
                    return product.product_type.toLowerCase().includes(keywordLower);
                case 'vendor':
                    return product.vendor.toLowerCase().includes(keywordLower);
                default:
                    return false;
            }
        });
    }
}
```

### 2.4 Product Type Categorisation
```javascript
class ProductTypeScanner extends ShopifyProductScanner {
    async scanByProductTypes(productTypes = []) {
        if (productTypes.length === 0) {
            productTypes = await this.getAllProductTypes();
        }
        
        const results = {};
        
        for (const productType of productTypes) {
            console.log(`Scanning product type: ${productType}`);
            
            results[productType] = await this.scanAllProducts({
                productType,
                onProgress: (progress) => {
                    console.log(`${productType}: Found ${progress.productsFound} products`);
                }
            });
            
            await this.delay(1000); // Brief pause between types
        }
        
        return results;
    }
    
    async getAllProductTypes() {
        const allProducts = await this.scanAllProducts();
        const productTypes = new Set();
        
        allProducts.forEach(product => {
            if (product.product_type) {
                productTypes.add(product.product_type);
            }
        });
        
        return Array.from(productTypes).sort();
    }
    
    async getProductTypeStats() {
        const allProducts = await this.scanAllProducts();
        const stats = {};
        
        allProducts.forEach(product => {
            const type = product.product_type || 'Uncategorised';
            stats[type] = (stats[type] || 0) + 1;
        });
        
        return Object.entries(stats)
            .sort(([,a], [,b]) => b - a)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    }
}
```