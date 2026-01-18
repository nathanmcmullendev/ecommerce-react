# Shopify MCP Setup Guide: Dev Dashboard Method

> **Version:** 1.0
> **Date:** January 11, 2026
> **Author:** Claude Code Automation
> **Store:** demo-exec-2026.myshopify.com

## Overview

This guide documents the complete process of setting up Shopify MCP (Model Context Protocol) connectivity using the **modern Dev Dashboard approach** instead of legacy custom apps. This is the recommended method as of 2026, as legacy custom apps are deprecated.

### Key Differences: Dev Dashboard vs Legacy Custom Apps

| Feature | Dev Dashboard (New) | Legacy Custom Apps |
|---------|--------------------|--------------------|
| Token Type | Rotating (shpca_) - 24h expiry | Static (shpat_) |
| Authentication | Client Credentials OAuth | API Key/Secret |
| Distribution | Custom or Public | Store-specific |
| Management | dev.shopify.com/dashboard | Partners Dashboard |
| Status | **Recommended** | Deprecated (Jan 2026) |

---

## Prerequisites

Before starting, ensure you have:

- [ ] A Shopify Partner account
- [ ] Access to a development store or Plus organization
- [ ] Admin access to modify `~/.claude.json`

---

## Step-by-Step Guide

### Step 1: Access Shopify Partners Dashboard

1. Navigate to [partners.shopify.com](https://partners.shopify.com)
2. Log in with your Partner credentials
3. Select your organization (e.g., "aiged INC")

**Credentials Location:** `C:\xampp\htdocs\PRIVATE\CREDENTIALS-MASTER.md`
```
Email:    bromermuseum@gmail.com
Password: FreeWyse3018$!
```

---

### Step 2: Access Your Store's App Development

1. From Partners Dashboard, click **Stores** in the sidebar
2. Find your target store (e.g., "demo-exec-2026")
3. Click **Log in** to access the store admin
4. Navigate to **Settings > Apps > App development**

**Important:** You'll see two options:
- **Build apps in Dev Dashboard** - Use this (modern approach)
- **Legacy custom apps** - Don't use (deprecated)

---

### Step 3: Access Dev Dashboard

1. Click **"Build apps in Dev Dashboard"**
2. This opens `dev.shopify.com/dashboard/{org_id}`
3. You'll see all apps for your organization

---

### Step 4: Create or Select an App

#### Option A: Create New App
1. Click **"Create app"**
2. Enter app name (e.g., "Ecomm-react")
3. The app is created with default scopes

#### Option B: Use Existing App
1. Find your app in the list (e.g., "Ecomm-react")
2. Click on it to access settings

---

### Step 5: Configure App Credentials

1. In the Dev Dashboard, go to **Settings** for your app
2. Note the credentials:

```
Client ID:        4acdea0861d8b3ae0357d9172aafe461
Client Secret:    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
```

**Important:** The Client Secret starts with `shpss_` (Shopify Secret)

---

### Step 6: Set Distribution Method

**This is critical - apps cannot be installed without a distribution method.**

1. In Dev Dashboard, find **Distribution** section
2. Click **"Select distribution method"**
3. This redirects to Partners Dashboard
4. Choose **"Custom distribution"** for MCP use cases
5. Confirm the selection

---

### Step 7: Generate Install Link for Your Store

1. After selecting Custom distribution, enter your store domain:
   ```
   demo-exec-2026.myshopify.com
   ```

2. Check **"Allow multi-store install for one Plus organization"** if applicable

3. Click **"Generate link"**

4. The install link is generated:
   ```
   https://admin.shopify.com/oauth/install_custom_app?client_id=...&signature=...
   ```

---

### Step 8: Install App on Store

1. Navigate to the generated install link
2. Select your target store (demo-exec-2026)
3. Review the permissions:
   - View personal data (Customers, store owner)
   - View and edit store data (Customers, products, orders, discounts)
4. Click **"Install"**

**Success indicator:** URL changes to `admin.shopify.com/store/{store}/apps/{app-name}`

---

### Step 9: Get Access Token via Client Credentials

With Dev Dashboard apps, tokens are obtained via OAuth client credentials grant:

```bash
curl -X POST "https://demo-exec-2026.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=4acdea0861d8b3ae0357d9172aafe461" \
  -d "client_secret=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"
```

**Response:**
```json
{
  "access_token": "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",
  "scope": "write_customers,write_discounts,write_draft_orders,...",
  "expires_in": 86399
}
```

**Token Format:** `shpca_` = Shopify Client Access (rotating, 24h expiry)

---

### Step 10: Update MCP Configuration

Edit `~/.claude.json` (or `C:\Users\{username}\.claude.json` on Windows):

```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": [
        "C:\\xampp\\htdocs\\claude\\shopify-mcp-custom\\package\\build\\index.js"
      ],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "demo-exec-2026.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "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"
      }
    }
  }
}
```

---

### Step 11: Verify Connection

Test the API connection:

```bash
curl -s -X POST "https://demo-exec-2026.myshopify.com/admin/api/2024-01/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: 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" \
  -d '{"query": "{ shop { name } }"}'
```

**Expected Response:**
```json
{
  "data": {
    "shop": {
      "name": "demo-exec-2026"
    }
  }
}
```

---

## Token Refresh Process

Since tokens expire every 24 hours, you'll need to refresh them:

### Manual Refresh
```bash
curl -X POST "https://demo-exec-2026.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=4acdea0861d8b3ae0357d9172aafe461" \
  -d "client_secret=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"
```

### Automated Refresh (Future Enhancement)
Consider implementing a token refresh mechanism in your MCP server that:
1. Catches 401 Unauthorized errors
2. Automatically requests a new token using stored credentials
3. Retries the failed request

---

## Document Credentials Properly

Update `CREDENTIALS-MASTER.md` with all credentials:

```markdown
## Shopify (demo-exec-2026) - PRIMARY MCP STORE

Store Domain:     demo-exec-2026.myshopify.com
Organization:     aiged INC

### Ecomm-react Custom App (Dev Dashboard - Custom Distribution)
App Name:         Ecomm-react
Client ID:        4acdea0861d8b3ae0357d9172aafe461
Client Secret:    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
Distribution:     Custom (exclusive to aiged INC stores)
Scopes:           write_customers,write_discounts,write_draft_orders,...

### Access Token (Rotates every 24h)
Current Token:    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
Token Type:       Client Credentials (shpca_ prefix)
Expires In:       86399 seconds (~24 hours)
Last Refreshed:   January 11, 2026

### Dev Dashboard URLs
App Dashboard:    https://dev.shopify.com/dashboard/197127977/apps/310115172353
Settings:         https://dev.shopify.com/dashboard/197127977/apps/310115172353/settings
Store Admin:      https://admin.shopify.com/store/demo-exec-2026
```

---

## Troubleshooting

### Error: "This app can't be installed yet"
**Cause:** Distribution method not selected
**Fix:** Go to Dev Dashboard > App > Distribution > Select "Custom distribution"

### Error: 401 Unauthorized
**Cause:** Token expired (24h expiry)
**Fix:** Refresh token using client credentials grant

### Error: MCP not connecting after config change
**Cause:** Claude Code caches MCP connections
**Fix:** Restart Claude Code (`/quit` then relaunch)

### Error: "ACCESS_DENIED" for customer data
**Cause:** Protected customer data access not configured
**Fix:** Go to Partners > App > API access requests > Configure protected data

---

## Quick Reference

| Item | Value |
|------|-------|
| Store Domain | demo-exec-2026.myshopify.com |
| Client ID | 4acdea0861d8b3ae0357d9172aafe461 |
| Client Secret | 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 |
| Current Token | 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 |
| Token Expiry | 24 hours |
| Dev Dashboard | https://dev.shopify.com/dashboard/197127977/apps/310115172353 |
| Partners Dashboard | https://partners.shopify.com/4662406/apps/310115172353 |

---

## Related Documentation

- [Shopify Dev Dashboard Docs](https://shopify.dev/docs/apps/tools/developer-dashboard)
- [Client Credentials Grant](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials)
- [Protected Customer Data Guide](../shopify-protected-customer-data-enhanced/README.md)

---

*This guide was created by documenting an actual MCP setup session using Playwright automation.*
