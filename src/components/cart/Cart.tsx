import { useState } from 'react'
import { Link } from 'react-router'
import { useCart, useCartDispatch } from '../../context/CartContext'
import { getResizedImage } from '../../utils/images'
import type { ProductRouterState } from '../../types'
import { ShippingProgress } from '../layout/ShippingBanner'
import { YouMayAlsoLike } from './YouMayAlsoLike'
import { createShopifyCheckout } from '../../data/shopify-api'

/**
 * Cart Component
 *
 * Slide-out cart drawer showing cart items and checkout link.
 *
 * Features:
 * - Slides in from right with backdrop overlay
 * - Shows cart items with thumbnails and frame color borders
 * - Quantity controls (increase/decrease/remove)
 * - Subtotal calculation
 * - Links to product pages with selected options preserved
 * - Empty state with helpful message
 *
 * @example
 * ```tsx
 * // In app/root.tsx (must be within CartProvider)
 * <Cart />
 * ```
 */

/** Frame border colors for visual display */
const frameColors: Record<string, string> = {
  'Unframed': '#f5f5f5',
  'Black Frame': '#1a1a1a',
  'White Frame': '#ffffff',
  'Natural Wood': '#c4a574',
}

export default function Cart() {
  const { items, isOpen, total } = useCart()
  const dispatch = useCartDispatch()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Handle checkout - create Shopify cart and redirect
  const handleCheckout = async () => {
    if (items.length === 0) return

    // Validate all items have valid Shopify variant IDs (gid://shopify/ProductVariant/...)
    const invalidItems = items.filter(item => !item.variantId.startsWith('gid://shopify/ProductVariant/'))
    if (invalidItems.length > 0) {
      setCheckoutError('Some items have invalid variants. Please remove and re-add them.')
      return
    }

    setCheckoutLoading(true)
    setCheckoutError(null)

    // Set a timeout to reset loading state if redirect doesn't happen
    const timeoutId = setTimeout(() => {
      setCheckoutLoading(false)
      setCheckoutError('Checkout is taking too long. Please try again.')
    }, 10000) // 10 second timeout

    try {
      // Create Shopify cart with our cart items
      const checkoutUrl = await createShopifyCheckout(
        items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      )

      // Clear timeout since we got a response
      clearTimeout(timeoutId)

      // Redirect to Shopify's hosted checkout
      window.location.href = checkoutUrl
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Checkout error:', error)
      setCheckoutError('Unable to start checkout. Please try again.')
      setCheckoutLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop - fades in/out */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      />
      
      {/* Cart Panel - slides in/out from right */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col bg-white transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Cart ({items.length})
          </h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center bg-gray-100">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="font-medium mb-1 text-gray-800">
                Your cart is empty
              </p>
              <p className="text-sm text-gray-500">
                Add prints to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const frameColor = frameColors[item.frameId] || '#1a1a1a'

                // Build product state with selected options for the Product page
                const productState: ProductRouterState = {
                  product: {
                    id: item.productId,
                    title: item.title,
                    artist: item.artist,
                    image: item.image,
                    year: '',
                    origin: '',
                    medium: '',
                    description: '',
                    tags: []
                  },
                  selectedSizeId: item.sizeId,
                  selectedFrameId: item.frameId
                }

                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl bg-white"
                  >
                    <div className="flex gap-3">
                      {/* Clickable image with frame color border - no radius, frame effect */}
                      <Link
                        to={`/product/${encodeURIComponent(item.productId)}`}
                        state={productState}
                        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                        className="w-20 h-20 overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity"
                        style={{
                          border: `3px solid ${frameColor}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 0 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <img
                          src={getResizedImage(item.image, 100)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* Clickable title link to product */}
                        <Link
                          to={`/product/${encodeURIComponent(item.productId)}`}
                          state={productState}
                          onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                          className="block hover:underline"
                        >
                          <h3 className="font-medium text-sm leading-tight line-clamp-2 text-gray-800">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-xs mt-0.5 text-gray-500">
                          {item.artist}
                        </p>
                        {/* Display selected size and frame */}
                        <p className="text-xs mt-1 text-ink-500">
                          {item.sizeId} • {item.frameId}
                        </p>
                      </div>

                      {/* Price */}
                      <span className="font-semibold text-sm whitespace-nowrap text-gray-800">
                        ${(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border rounded-lg border-gray-200">
                        <button
                          onClick={() => dispatch({
                            type: 'UPDATE_QUANTITY',
                            payload: { key: item.key, quantity: item.quantity - 1 }
                          })}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50 rounded-l-lg text-gray-600"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm text-gray-800" aria-label={`Quantity: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch({
                            type: 'UPDATE_QUANTITY',
                            payload: { key: item.key, quantity: item.quantity + 1 }
                          })}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50 rounded-r-lg text-gray-600"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.key })}
                        className="text-xs underline transition-colors text-gray-500 hover:text-gray-700"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* You may also like - temporarily disabled due to variant ID issues */}
              {/* TODO: Fix variant lookup to use real Shopify variant GIDs */}
              {/* <YouMayAlsoLike cartItems={items} /> */}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200">
            {/* Free shipping confirmation */}
            <ShippingProgress />

            {/* Total */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm uppercase tracking-wide text-ink-500">Total</span>
              <span className="text-2xl font-semibold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Quality badge */}
            <p className="text-xs text-center text-gray-500 mb-4 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Digitally restored by hand • Printed & framed to order
            </p>

            {/* Checkout error */}
            {checkoutError && (
              <p className="text-red-600 text-sm text-center mb-3">{checkoutError}</p>
            )}

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className={`block w-full py-3.5 text-center text-white font-medium uppercase tracking-wide text-sm bg-ink-800 hover:bg-ink-900 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              Checkout
            </button>

            {/* Trust badges */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Free shipping
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                30-day returns
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure checkout
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
