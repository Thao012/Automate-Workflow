# Xtend Outdoors Credentials Usage

## Credential File Location
- **File:** `.env`
- **Variable:** `XTEND_OUTDOORS_SHOPIFY_TOKEN`

## Usage Examples

### Node.js
```javascript
require('dotenv').config();
const token = process.env.XTEND_OUTDOORS_SHOPIFY_TOKEN;
```

### Python
```python
import os
from dotenv import load_dotenv

load_dotenv()
token = os.getenv('XTEND_OUTDOORS_SHOPIFY_TOKEN')
```

### PHP
```php
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
$token = $_ENV['XTEND_OUTDOORS_SHOPIFY_TOKEN'];
```

## Security Notes
- The `.env` file is excluded from version control via `.gitignore`
- Never share or log this credential in plain text
- Credential appears to be a Shopify private app access token