# ElevenLabs AI Agent Setup Workflow

## Overview
This workflow guides the complete setup of an ElevenLabs AI agent for phone calls and website chatbot functionality, including brand research, prompt engineering, webhook integration, and automated email notifications.

## Phase 1: Strategic Planning & Brand Research

### Step 1: Brand Analysis & Research
1. **Website Content Analysis**
   - Review homepage messaging and value propositions
   - Identify key services and offerings
   - Note team member names and roles
   - Extract contact information and business hours
   - Analyse brand tone of voice and communication style

2. **Brand Voice Documentation**
   - Professional communication style
   - Australian English requirements
   - Key terminology and industry language
   - Customer service approach and standards
   - Escalation procedures and protocols

3. **Agent Purpose Definition**
   - Primary role (reception, customer service, lead capture)
   - Operating hours and after-hours messaging
   - Integration points (phone, website chat)
   - Success metrics and objectives

### Step 2: Competitive Research
- Analyse competitor AI implementations
- Review industry best practices for AI assistants
- Identify unique positioning opportunities
- Document customer service benchmarks

## Phase 2: ElevenLabs Agent Configuration

### Step 3: Agent Creation Setup
1. **Basic Agent Configuration**
   - Agent name (brand-appropriate)
   - Voice selection (Australian accent preferred)
   - Response speed settings
   - Language and accent configuration

2. **Agent Personality Setup**
   - Professional but friendly demeanour
   - Australian English speaking patterns
   - Brand-consistent terminology
   - Appropriate level of formality

### Step 4: Advanced Agent Settings
1. **Time-Awareness Configuration**
   - Business hours detection (Melbourne timezone)
   - After-hours messaging protocols
   - Weekend and holiday handling
   - Dynamic greeting adjustments

2. **Knowledge Base Integration**
   - Company information and services
   - Team member details and availability
   - FAQ responses and common queries
   - Escalation pathways and procedures

## Phase 3: Prompt Engineering

### Step 5: Master Prompt Development

#### Core Prompt Structure
```markdown
# [Company Name] AI Assistant - Time-Aware Customer Service

## Role & Context
You are the AI assistant for [Company Name] ([website URL]).
Your behaviour adapts based on Melbourne business hours (Australia/Melbourne timezone).

## Time-Based Behaviour
**Business Hours** (Monday-Friday, 9:00 AM - 5:30 PM AEST):
- Act as live front-desk assistant
- Offer immediate assistance or same-day callbacks
- Connect to available team members when appropriate

**After Hours** (Evenings, weekends, public holidays):
- Act as professional message-taking service
- Reassure callers of next business day response
- Capture detailed messages for follow-up

## Core Responsibilities
1. **Information Capture**
   - Full name (confirm spelling if uncertain)
   - Best contact number
   - Email address
   - Reason for enquiry
   - Preferred contact method
   - Urgency level

2. **Service Information**
   - Answer questions about company services
   - Provide business location and hours
   - Share relevant team member information
   - Explain service processes and timelines

3. **Call Management**
   - Identify requests for specific team members
   - Handle unavailability professionally
   - Schedule callbacks when appropriate
   - Transfer calls during business hours

## Conversation Templates
### Business Hours Greeting
"Good [morning/afternoon]! You've reached [Company Name]. I'm [Agent Name], your AI assistant. How may I help you today?"

### After Hours Greeting
"Hello! You've reached [Company Name] after hours. I'm [Agent Name], and I'm here to take your message for our team. How can I assist you this [evening/weekend]?"

### Information Gathering
"To ensure our team can assist you properly, could you please provide:
- Your full name
- Best contact number
- Brief description of how we can help you"

### Message Confirmation
"Let me confirm your details:
- Name: [Name]
- Contact: [Phone/Email]
- Enquiry: [Description]
- Time recorded: [Timestamp]
Is this information correct?"

## Quality Standards
- Use Australian English spelling and terminology
- Maintain professional but friendly tone
- Confirm all captured information
- Provide realistic timeframes for responses
- Escalate urgent matters appropriately
```

### Step 6: Prompt Customisation
- Adapt template to specific company details
- Include specific service offerings
- Add team member names and specialties
- Integrate company-specific procedures
- Include brand-specific language patterns

## Phase 4: Integration & Webhook Setup

### Step 7: ElevenLabs MCP Integration
1. **MCP Configuration**
   - Install ElevenLabs MCP connector
   - Configure API credentials
   - Set up agent connection
   - Test basic functionality

2. **Agent Deployment**
   - Deploy agent to ElevenLabs platform
   - Configure phone number integration
   - Set up website chatbot embedding
   - Test multi-channel functionality

### Step 8: Webhook Configuration
1. **Webhook Endpoint Setup**
   - Create webhook URL for message capture
   - Configure POST request handling
   - Set up JSON payload processing
   - Implement security authentication

2. **Data Processing Pipeline**
   - Parse incoming agent conversations
   - Extract customer details and messages
   - Format data for email transmission
   - Log interactions for analysis

### Step 9: SMTP Email Integration
1. **Email Configuration**
   - Configure SMTP server settings
   - Set up authentication credentials
   - Define email templates
   - Configure recipient lists

2. **Automated Email System**
   - Real-time message forwarding
   - Business hours vs after-hours handling
   - Email formatting and structure
   - Attachment handling for transcripts

## Phase 5: Testing & Quality Assurance

### Step 10: Comprehensive Testing
1. **Functional Testing**
   - Business hours detection accuracy
   - Message capture completeness
   - Email delivery reliability
   - Multi-channel consistency

2. **User Experience Testing**
   - Conversation flow naturalness
   - Response accuracy and relevance
   - Brand voice consistency
   - Customer satisfaction simulation

3. **Integration Testing**
   - Webhook reliability
   - Email automation functionality
   - Data accuracy and completeness
   - Error handling and recovery

### Step 11: Performance Optimisation
1. **Response Quality**
   - Monitor conversation success rates
   - Analyse customer feedback
   - Refine prompt effectiveness
   - Adjust personality settings

2. **Technical Performance**
   - Response time optimisation
   - Webhook reliability monitoring
   - Email delivery tracking
   - System uptime analysis

## Phase 6: Deployment & Monitoring

### Step 12: Go-Live Preparation
1. **Final Configuration**
   - Production environment setup
   - Security settings verification
   - Backup and recovery procedures
   - Documentation completion

2. **Launch Strategy**
   - Soft launch with limited traffic
   - Gradual rollout to full capacity
   - Team training on new system
   - Customer communication about AI assistant

### Step 13: Ongoing Monitoring
1. **Performance Metrics**
   - Call/chat volume tracking
   - Response accuracy monitoring
   - Customer satisfaction measurement
   - Conversion rate analysis

2. **Continuous Improvement**
   - Regular prompt refinement
   - Agent personality adjustments
   - Integration optimisation
   - Feature enhancement planning

## Technical Requirements

### ElevenLabs MCP Tools Needed
- Agent creation and management
- Voice configuration
- Knowledge base integration
- Webhook setup
- Performance monitoring

### Infrastructure Requirements
- Webhook server capability
- SMTP email service
- SSL certificates for security
- Database for logging (optional)
- Monitoring and alerting systems

### Security Considerations
- API key management
- Webhook authentication
- Email encryption
- Data privacy compliance
- Access control and permissions

## Success Metrics
- Call/chat handling efficiency
- Message capture accuracy
- Customer satisfaction scores
- Lead conversion rates
- System uptime and reliability
- Cost per interaction optimisation

## Troubleshooting Guide

### Phone Number & Email Debugging Procedures

#### Phone Number Format Issues
**Problem**: Transcripts convert phone numbers to spelled-out format (e.g., "zero four two three" instead of "0423")

**Root Cause Analysis**:
1. ElevenLabs transcription settings converting numbers to text
2. AI agent reformatting numbers during confirmation
3. Webhook post-processing modifying number format

**Debugging Steps**:
1. **Agent Prompt Fix**:
   ```markdown
   When confirming phone numbers, ALWAYS repeat them in numerical format only.
   Example: "0423 615 161" NOT "zero four two three six one five one six one"
   Use format: [mobile prefix] [space] [three digits] [space] [three digits]
   ```

2. **Webhook Processing Check**:
   - Verify webhook isn't converting numbers during processing
   - Check JSON payload format preservation
   - Test with regex pattern matching for phone numbers

3. **ElevenLabs Settings**:
   - Review transcription settings for number handling
   - Check voice model configuration
   - Test with different voice models if needed

#### Email Address Display & Confirmation Debugging
**Problem**: AI agents spelling out email addresses as "name at company dot com" instead of proper format

**Root Cause Analysis**:
1. AI voice agents naturally converting symbols to words during speech
2. Transcription systems converting @ and . symbols to spoken words
3. Lack of specific formatting instructions in agent prompts

**Debugging Steps**:
1. **Agent Prompt Enhancement**:
   ```markdown
   🚨 MANDATORY EMAIL ADDRESS PROTOCOL
   When confirming email addresses, NEVER spell out characters or use words like "at" and "dot".
   
   ❌ FORBIDDEN: "jj at integralmedia dot com dot au"
   ✅ REQUIRED: "Perfect - just to confirm that's jj@integralmedia.com.au"
   
   Always use proper @ and . symbols in email confirmations.
   ```

2. **Voice Model Configuration**:
   - Test different voice models for symbol pronunciation
   - Adjust transcription settings for email format recognition
   - Implement post-processing to convert spoken emails to proper format

3. **Webhook Email Processing**:
   - Add regex pattern matching to detect spelled-out emails
   - Implement automatic conversion from "at" to @ and "dot" to .
   - Validate email format before storage

#### SMTP Email Delivery Debugging
**Common Issues & Solutions**:

1. **SMTP Authentication Failures**:
   - Verify SMTP credentials are correct
   - Check if 2FA is blocking app passwords
   - Test SMTP connection independently

2. **Email Not Received**:
   - Check spam/junk folders
   - Verify recipient email addresses
   - Test with different email providers

3. **Webhook Payload Issues**:
   - Log webhook POST data for analysis
   - Verify JSON structure is correct
   - Check for special character encoding

#### Chat vs Call Context Issues
**Problem**: Agent says "reason for your call" in chat sessions

**Solution**: Dynamic context detection in prompt:
```markdown
Context Detection:
- If interaction_type == "chat" or "website": Use "chat session", "message", "enquiry"
- If interaction_type == "phone" or "call": Use "call", "phone call"

Avoid: "reason for your call" in chat contexts
Use: "reason for your enquiry" or "how can I help you today?"
```

#### Natural Conversation Flow Debugging
**Problem**: Agent sounds robotic or insists on too much information when customer wants human contact

**Root Cause Analysis**:
1. Overly rigid prompt structure forcing conversation flow
2. Lack of respect for customer preferences in agent programming
3. Too many qualification requirements before human handoff

**Debugging Steps**:
1. **Conversation Flow Enhancement**:
   ```markdown
   PRINCIPLE: Be helpful FIRST, qualify SECOND
   
   If customer says "I want to speak to someone":
   ✅ "Of course! Let me see if I can get someone for you right away."
   ❌ "First, let me just ask a few questions about your business..."
   
   Respect customer preferences over rigid qualification processes.
   ```

2. **Natural Response Patterns**:
   - Ask ONE question at a time instead of multiple questions
   - Follow their conversational lead rather than forcing agenda
   - Use warm, consultative language: "What's the biggest headache..." vs "Please describe your processes"

3. **Human Handoff Triggers**:
   - Immediate transfer when explicitly requested
   - Don't insist on information collection before handoff
   - Capture minimal details only: name and contact method

### Advanced Debugging Tools

#### Webhook Testing
```bash
# Test webhook endpoint with phone and email data
curl -X POST [webhook_url] \
  -H "Content-Type: application/json" \
  -d '{"test": "phone number 0423 615 161", "email": "test@example.com", "timestamp": "2025-07-04T10:30:00Z"}'
```

#### Email Format Testing
```python
# Test email confirmation formatting
import re

def validate_email_confirmation(agent_response):
    """Check if agent response contains proper email format"""
    # Check for spelled-out email patterns
    forbidden_patterns = [
        r'\b\w+ at \w+',  # "name at company"
        r'\b\w+ dot \w+', # "name dot com"
        r'at .+ dot'      # "at company dot"
    ]
    
    for pattern in forbidden_patterns:
        if re.search(pattern, agent_response, re.IGNORECASE):
            return False, f"Found forbidden pattern: {pattern}"
    
    # Check for proper email format
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if re.search(email_pattern, agent_response):
        return True, "Proper email format detected"
    
    return False, "No proper email format found"

# Example usage
response = "Perfect - just to confirm that's john@company.com"
is_valid, message = validate_email_confirmation(response)
print(f"Validation: {is_valid}, Message: {message}")
```

#### SMTP Connection Testing
```python
# Test SMTP connection
import smtplib
from email.mime.text import MIMEText

def test_smtp_connection():
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(username, password)
        print("SMTP connection successful")
        server.quit()
    except Exception as e:
        print(f"SMTP error: {e}")
```

#### Transcript Analysis
- Monitor for number format consistency
- Check conversation flow naturalness
- Verify context-appropriate language
- Test error handling scenarios

## Maintenance Schedule
- Weekly performance reviews
- Monthly prompt optimisation
- Quarterly system updates
- Annual comprehensive audit
- Continuous monitoring protocols