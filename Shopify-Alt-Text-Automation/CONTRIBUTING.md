# Contributing to Shopify Alt Text Automation

## Code Standards

### JavaScript/Node.js
- Use ES6+ features
- Implement proper error handling
- Add JSDoc comments for functions
- Follow consistent naming conventions

### Python
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Include docstrings for functions
- Handle exceptions gracefully

### API Integration
- Always implement rate limiting
- Use environment variables for credentials
- Log API requests and responses
- Implement retry logic for failed requests

## Testing

### Before Submitting Changes
1. Test API connections with test credentials
2. Run scripts in dry-run mode first
3. Verify data validation logic
4. Check error handling scenarios

### Required Tests
- API connectivity tests
- Data validation tests
- Error handling verification
- Rate limiting compliance

## Documentation

### Code Documentation
- Comment complex logic
- Document API endpoints used
- Explain data transformation steps
- Include usage examples

### README Updates
- Update script descriptions
- Add new configuration options
- Document any breaking changes
- Include troubleshooting steps

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] API credentials validated
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] Documentation updated

### Post-Deployment
- [ ] Monitor API usage
- [ ] Check error logs
- [ ] Verify update success rates
- [ ] Update project statistics

## Security Guidelines

### API Security
- Never commit credentials to version control
- Use environment variables for sensitive data
- Implement proper access token rotation
- Log security-relevant events

### Data Protection
- Backup data before bulk updates
- Implement rollback procedures
- Validate data before processing
- Monitor for unauthorized access