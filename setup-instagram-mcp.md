# Instagram MCP Setup Guide

## Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Instagram Basic Display" product
4. Get your App ID and App Secret

## Step 2: Configure Instagram Basic Display
1. In your Facebook App, go to Instagram Basic Display
2. Add Instagram Testers (your Instagram account)
3. Generate a User Access Token
4. Exchange for Long-lived Access Token (60 days)

## Step 3: Set Environment Variables
Add to your `.env` file:
```bash
# Instagram MCP Configuration
INSTAGRAM_MCP_CMD=python
INSTAGRAM_MCP_ARGS=src/instagram_mcp_server.py
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id_here
INSTAGRAM_API_VERSION=v18.0
```

## Step 4: Install Instagram MCP Server
```bash
# Clone the Instagram MCP server
git clone https://github.com/your-username/ig-mcp.git
cd ig-mcp

# Install dependencies
pip install -r requirements.txt
```

## Step 5: Test the Setup
```bash
# Test Instagram MCP
node dist/socialCli.js "Your Name" --instagram
```
