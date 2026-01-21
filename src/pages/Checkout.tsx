import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../context/CartContext'
import { createShopifyCheckout } from '../data/shopify-api'

/**
 * Checkout Page
 *
 * This page redirects to Shopify's hosted checkout.
 * Users typically go straight from the cart drawer to Shopify checkout,
 * but this page handles direct navigation to /checkout.
 */
export default function Checkout() {
  const { items } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Don't redirect if cart is empty
    if (items.length === 0) return

    // Avoid double redirect
    if (redirecting) return
    setRedirecting(true)

    async function redirectToShopify() {
      try {
        const checkoutUrl = await createShopifyCheckout(
          items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity
          }))
        )
        window.location.href = checkoutUrl
      } catch (err) {
        console.error('Checkout redirect error:', err)
        setError('Unable to start checkout. Please try again.')
        setRedirecting(false)
      }
    }

    redirectToShopify()
  }, [items, redirecting])

  // Empty cart state
  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-4 text-gray-800">
            Your cart is empty
          </h1>
          <Link
            to="/"
            className="underline transition-colors text-primary hover:text-primary-dark"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-2 text-gray-800">
            Checkout Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setRedirecting(false)
            }}
            className="px-6 py-3 bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  // Loading/redirecting state
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-ink-100">
          <svg className="animate-spin h-8 w-8 text-ink-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-2xl font-display mb-2 text-gray-800">
          Redirecting to checkout...
        </h1>
        <p className="text-gray-600">
          You'll be taken to our secure checkout page.
        </p>
      </div>
    </main>
  )
}
