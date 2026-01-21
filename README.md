# Headless Shopify Starter Kit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.1-ca4245)](https://reactrouter.com/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-98%2F95%2F96%2F100-brightgreen)](https://pagespeed.web.dev/)
[![Tests](https://img.shields.io/badge/Tests-326%20passing-success)](/)

A **production-ready headless Shopify storefront** built with React, TypeScript, and React Router 7 SSR. No Liquid templates. No theme constraints. Complete frontend freedom with Shopify's powerful backend.

**[Live Demo](https://ecommerce-react-shopify.vercel.app)** · **[Deploy Your Own](#quick-start)**

---

## What is Headless Commerce?

**Traditional Shopify:**
```
Your Store → Shopify Theme (Liquid) → Shopify Checkout
             └── Limited to theme customization
```

**Headless Shopify (this starter kit):**
```
Your React App (Vercel) → Shopify Storefront API → Shopify Checkout
└── Complete UI/UX freedom              └── Shop Pay, Apple Pay, Google Pay
```

You build your own frontend. Shopify handles products, inventory, and checkout. Best of both worlds.

---

## Why This Starter Kit?

| Challenge | Our Solution |
|-----------|--------------|
| Shopify themes are limiting | Custom React components with full control |
| Slow page loads | 98 Lighthouse performance score |
| Hydration errors with SSR | Solved with `useSyncExternalStore` pattern |
| Complex cart state | SSR-safe localStorage persistence |
| Image optimization | Cloudinary CDN (70% smaller files) |
| SEO for SPAs | Server-side rendering + meta tags |

---

## Features

### E-commerce
- **Shopify Storefront API** — Products, collections, variants, inventory
- **Shopify Hosted Checkout** — Shop Pay, Apple Pay, Google Pay, all payment methods
- **Cart with SSR Persistence** — localStorage without hydration errors
- **Product Variants** — Size and frame options with dynamic pricing
- **Collection Filtering** — Filter by artist/category

### Performance
- **Lighthouse 98/95/96/100** — Performance, Accessibility, Best Practices, SEO
- **Cloudinary CDN** — Automatic WebP/AVIF, responsive images
- **Code Splitting** — 88KB gzipped initial bundle
- **SSR with Streaming** — Fast time to first byte

### Developer Experience
- **TypeScript Strict Mode** — Zero `any` types
- **326 Passing Tests** — Unit, component, integration
- **Zero ESLint Warnings** — Clean, maintainable code
- **Comprehensive Docs** — Architecture guides, API reference

### Marketing Ready
- **Google Analytics 4** — E-commerce event tracking
- **Newsletter Integration** — Mailchimp/Klaviyo ready
- **SEO Optimized** — Dynamic meta tags, sitemap, robots.txt
- **Open Graph** — Rich social sharing previews

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-react-shopify.git
cd ecommerce-react-shopify
npm install
```

### 2. Configure Shopify

Create a Shopify store and get your Storefront API credentials:

1. Go to **Shopify Admin → Settings → Apps and sales channels**
2. Click **Develop apps → Create an app**
3. Configure **Storefront API scopes**: `unauthenticated_read_products`, `unauthenticated_read_collections`, `unauthenticated_write_checkouts`
4. Install the app and copy the **Storefront API access token**

### 3. Set Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Required - Shopify
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_api_token

# Required - Images
VITE_CLOUDINARY_CLOUD=your_cloud_name

# Optional - Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Deploy to Vercel

```bash
npx vercel
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR REACT APP (Vercel)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   Home   │  │ Product  │  │   Cart   │  │     Checkout     │ │
│  │  Gallery │  │  Detail  │  │  Drawer  │  │ → Shopify Hosted │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│       └─────────────┴─────────────┴──────────────────┘           │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │   SHOPIFY STOREFRONT API        │
              │         (GraphQL)               │
              └────────────────┬────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
┌──────▼──────┐        ┌──────▼──────┐        ┌───────▼───────┐
│  Products   │        │ Collections │        │   Checkout    │
│  Variants   │        │  (Artists)  │        │  Shop Pay     │
│  Inventory  │        │             │        │  Apple Pay    │
└─────────────┘        └─────────────┘        │  Google Pay   │
                                              └───────────────┘
```

### Data Flow

1. **Products** load from Shopify Storefront API via GraphQL
2. **Images** proxy through Cloudinary for optimization
3. **Cart** persists to localStorage (SSR-safe)
4. **Checkout** redirects to Shopify's hosted checkout
5. **Orders** process through Shopify (payments, fulfillment, emails)

---

## Project Structure

```
├── app/
│   ├── root.tsx              # App shell, providers
│   └── routes/
│       ├── home.tsx          # Product gallery with SSR
│       ├── product.$handle.tsx
│       └── collections.$handle.tsx
├── src/
│   ├── components/
│   │   ├── cart/
│   │   │   └── Cart.tsx      # Slide-out drawer
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   └── FramePreview.tsx
│   │   └── layout/
│   │       └── Header.tsx
│   ├── context/
│   │   └── CartContext.tsx   # SSR-safe cart state
│   ├── data/
│   │   └── shopify-api.ts    # Storefront API client
│   ├── lib/
│   │   └── createPersistedStore.ts  # Hydration-safe localStorage
│   └── utils/
│       └── images.ts         # Cloudinary URL transforms
└── docs/
    ├── architecture/
    └── guides/
```

---

## Shopify Integration

### Storefront API Queries

```typescript
// Fetch all products with variants
const products = await fetchShopifyProducts()

// Fetch single product
const product = await fetchShopifyProduct('the-gulf-stream')

// Fetch collections
const collections = await fetchCollections()
```

### Cart & Checkout

```typescript
// Create Shopify checkout and redirect
const checkoutUrl = await createShopifyCheckout([
  { variantId: 'gid://shopify/ProductVariant/123', quantity: 1 }
])
window.location.href = checkoutUrl
```

The checkout uses Shopify's hosted checkout, which includes:
- **Shop Pay** — One-click checkout for returning customers
- **Apple Pay / Google Pay** — Mobile wallet support
- **All payment methods** — Credit cards, PayPal, etc.
- **Automatic taxes & shipping** — Calculated by Shopify
- **Order confirmation emails** — Sent by Shopify

### Variant Structure

Products have variants for size and frame options:

| Size | Unframed | Black Frame | White Frame | Natural Wood |
|------|----------|-------------|-------------|--------------|
| 8×10 | $45 | $75 | $75 | $85 |
| 11×14 | $55 | $95 | $95 | $105 |
| 16×20 | $65 | $125 | $125 | $135 |
| 24×30 | $85 | $165 | $165 | $175 |

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `VITE_SHOPIFY_STORE` | Your store domain (e.g., `my-store.myshopify.com`) |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Storefront API access token |
| `VITE_CLOUDINARY_CLOUD` | Cloudinary cloud name for image optimization |

### Optional

| Variable | Description |
|----------|-------------|
| `VITE_GA_TRACKING_ID` | Google Analytics 4 measurement ID |
| `MAILCHIMP_API_KEY` | Mailchimp API key for newsletter |
| `MAILCHIMP_LIST_ID` | Mailchimp audience/list ID |
| `KLAVIYO_API_KEY` | Alternative: Klaviyo API key |
| `KLAVIYO_LIST_ID` | Alternative: Klaviyo list ID |

---

## Customization

### Branding

1. **Logo**: Update `src/components/layout/Header.tsx`
2. **Colors**: Edit `tailwind.config.ts`
3. **Fonts**: Update `app/app.css`
4. **Meta tags**: Edit `src/components/seo/MetaTags.tsx`

### Free Shipping Threshold

```typescript
// src/components/layout/ShippingBanner.tsx
export const FREE_SHIPPING_THRESHOLD = 75 // Change to your amount
```

### Adding Pages

Create new routes in `app/routes/`:

```typescript
// app/routes/about.tsx
export default function About() {
  return <div>About us...</div>
}
```

### Newsletter Integration

The form submits to `/api/newsletter`. Configure your provider in `app/routes/api.newsletter.ts`:

```typescript
// Mailchimp example
const response = await fetch(
  `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ email_address: email, status: 'subscribed' })
  }
)
```

---

## Testing

```bash
# Run tests in watch mode
npm test

# Run once (CI)
npm run test:run

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Test Results

```
✓ src/components/cart/Cart.test.tsx (24 tests)
✓ src/components/product/ProductCard.test.tsx (18 tests)
✓ src/pages/Checkout.test.tsx (12 tests)
✓ src/context/CartContext.test.tsx (14 tests)
... and more

Test Files  19 passed (19)
     Tests  326 passed (326)
```

---

## Deployment

### Vercel (Recommended)

```bash
# Deploy preview
npx vercel

# Deploy production
npx vercel --prod
```

Add environment variables in **Vercel Dashboard → Settings → Environment Variables**.

### Deployment Checklist

- [ ] Shopify store has products and collections
- [ ] Storefront API token configured with correct scopes
- [ ] Cloudinary account created
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] Google Analytics connected (optional)

---

## Performance

### Lighthouse Scores

| Category | Score |
|----------|-------|
| Performance | 98 |
| Accessibility | 95 |
| Best Practices | 96 |
| SEO | 100 |

### Image Optimization

Images proxy through Cloudinary with automatic:
- **Format conversion** — WebP/AVIF based on browser
- **Responsive sizing** — 100px thumbnails to 1600px full size
- **Quality optimization** — Smart compression
- **Edge caching** — Global CDN delivery

```typescript
// 70% smaller than original
getResizedImage(url, 400) // → Cloudinary URL with transforms
```

---

## SSR-Safe Cart Persistence

This starter kit solves the common React hydration error:

```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**The Problem:** Server renders empty cart → Client reads localStorage with items → Mismatch.

**The Solution:** Using `useSyncExternalStore` with separate server/client snapshots:

```typescript
// src/lib/createPersistedStore.ts
export function createPersistedStore<T>(key: string, initialState: T) {
  return {
    getSnapshot: () => {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialState
    },
    getServerSnapshot: () => initialState // Always empty on server
  }
}
```

Result: Zero hydration errors. Cart hydrates correctly after initial render.

See [SSR Persistence Guide](docs/guides/SSR-PERSISTENCE-GUIDE.md) for the full tutorial.

---

## Shopify Store Requirements

### Development Store Limitation

Shopify development stores have **password protection** that cannot be disabled without a paid plan.

**For a working demo/production site:**
- Upgrade to **Shopify Basic** ($29/month) to remove password protection
- Or use a **Shopify Partner** development store for testing

### Required Storefront API Scopes

When creating your Storefront API token, enable these scopes:

- `unauthenticated_read_products`
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_collections`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + React Router 7 (SSR) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 4 |
| **State** | useSyncExternalStore + localStorage |
| **API** | Shopify Storefront API (GraphQL) |
| **Images** | Cloudinary CDN |
| **Hosting** | Vercel |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT — Use for learning, as a starting point, or in production. Attribution appreciated but not required.

---

## Acknowledgments

- **[Shopify](https://shopify.dev/)** — Storefront API and checkout
- **[Smithsonian Open Access](https://www.si.edu/openaccess)** — Public domain artwork
- **[Cloudinary](https://cloudinary.com/)** — Image optimization
- **[Vercel](https://vercel.com/)** — Hosting and deployment

---

**Built with care for the developer community.**

*Questions? [Open an issue](https://github.com/nathanmcmullendev/ecommerce-react-shopify/issues) or reach out.*
