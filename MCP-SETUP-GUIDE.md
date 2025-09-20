# Complete MCP Setup Guide for Instagram & Facebook

## 🎯 What This Will Give You

**Important**: MCP integration accesses **YOUR OWN** Instagram Business and Facebook Page accounts, not public search. This is useful for:
- Managing your own social media content
- Analyzing your own posts and engagement
- Automating your social media workflows

## 📱 Instagram MCP Setup

### Step 1: Facebook Developer Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Instagram Basic Display" product
4. Note your App ID and App Secret

### Step 2: Instagram Business Account
1. Convert your Instagram to Business account
2. Connect it to a Facebook Page
3. In Facebook App → Instagram Basic Display → Add Instagram Testers
4. Add your Instagram account as a tester

### Step 3: Generate Access Token
1. Go to [Instagram Basic Display API](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Generate User Access Token with permissions:
   - `instagram_basic`
   - `instagram_manage_insights`
4. Exchange for Long-lived Access Token (60 days)

### Step 4: Environment Variables
Add to your `.env` file:
```bash
# Instagram MCP
INSTAGRAM_MCP_CMD=python
INSTAGRAM_MCP_ARGS=src/instagram_mcp_server.py
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_account_id_here
INSTAGRAM_API_VERSION=v18.0
```

## 📘 Facebook MCP Setup

### Step 1: Facebook Page Setup
1. Create a Facebook Page for your business/brand
2. Go to Page Settings → Page Info → Page ID
3. Note your Page ID

### Step 2: Generate Page Access Token
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Generate Page Access Token with permissions:
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_read_user_content`
   - `pages_show_list`

### Step 3: Environment Variables
Add to your `.env` file:
```bash
# Facebook MCP
FACEBOOK_MCP_CMD=python
FACEBOOK_MCP_ARGS=src/facebook_mcp_server/__main__.py
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_PAGE_ID=your_page_id_here
```

## 🐦 Twitter MCP Setup (Bonus)

### Step 1: Twitter Developer Account
1. Apply for Twitter Developer access
2. Create a new app
3. Generate API keys and access tokens

### Step 2: Environment Variables
Add to your `.env` file:
```bash
# Twitter MCP
TWITTER_MCP_CMD=npx
TWITTER_MCP_ARGS=-y,@enescinar/twitter-mcp
API_KEY=your_api_key_here
API_SECRET_KEY=your_api_secret_key_here
ACCESS_TOKEN=your_access_token_here
ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

## 🚀 Installation & Testing

### Step 1: Install MCP Servers
```bash
# For Instagram (you'll need to find/create the MCP server)
git clone https://github.com/your-username/ig-mcp.git
cd ig-mcp && pip install -r requirements.txt

# For Facebook (you'll need to find/create the MCP server)
git clone https://github.com/your-username/facebook-mcp-server.git
cd facebook-mcp-server && pip install -r requirements.txt

# For Twitter (this one exists)
npm install -g @enescinar/twitter-mcp
```

### Step 2: Test Your Setup
```bash
# Run the setup checker
node setup-mcp.js

# Test Instagram MCP
node dist/socialCli.js "Your Name" --instagram

# Test Facebook MCP
node dist/socialCli.js "Your Name" --facebook

# Test Twitter MCP
node dist/socialCli.js "Your Name" --x
```

## ⚠️ Important Limitations

1. **No Public Search**: MCP only accesses YOUR accounts, not other people's content
2. **API Restrictions**: Instagram and Facebook have strict API limitations
3. **Token Expiration**: Access tokens expire and need renewal
4. **Rate Limits**: APIs have rate limits for requests

## 🔧 Troubleshooting

### Common Issues:
1. **"spawn python ENOENT"**: Python not found in PATH
2. **"Invalid access token"**: Token expired or incorrect permissions
3. **"App not approved"**: Need to submit app for review for production use

### Solutions:
1. Install Python and add to PATH
2. Regenerate access tokens with correct permissions
3. Use test mode for development

## 📚 Additional Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)

## 🎉 What You Can Do Once Set Up

- **Instagram**: Get your profile info, recent posts, insights
- **Facebook**: Get page posts, comments, engagement data
- **Twitter**: Post tweets, search tweets, get user info
- **Combined**: Use all data together for comprehensive analysis

Remember: This is for managing YOUR social media accounts, not searching other people's content!
