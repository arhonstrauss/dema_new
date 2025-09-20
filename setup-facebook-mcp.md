# Facebook MCP Setup Guide

## Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" and "Pages" products
4. Get your App ID and App Secret

## Step 2: Create Facebook Page
1. Create a Facebook Page for your business/brand
2. Get the Page ID from Page Settings

## Step 3: Generate Page Access Token
1. Go to Facebook Graph API Explorer
2. Select your app
3. Generate a Page Access Token with these permissions:
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_read_user_content`

## Step 4: Set Environment Variables
Add to your `.env` file:
```bash
# Facebook MCP Configuration
FACEBOOK_MCP_CMD=python
FACEBOOK_MCP_ARGS=src/facebook_mcp_server/__main__.py
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_PAGE_ID=your_facebook_page_id_here
```

## Step 5: Install Facebook MCP Server
```bash
# Clone the Facebook MCP server
git clone https://github.com/your-username/facebook-mcp-server.git
cd facebook-mcp-server

# Install dependencies
pip install -r requirements.txt
```

## Step 6: Test the Setup
```bash
# Test Facebook MCP
node dist/socialCli.js "Your Name" --facebook
```
