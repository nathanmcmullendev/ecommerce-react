import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import Checkout from './Checkout'
import { CartProvider, useCartDispatch } from '../context/CartContext'
import { createMockCartItem } from '../test/mocks'
import { useEffect, type ReactNode } from 'react'

// Mock the Shopify API
vi.mock('../data/shopify-api', () => ({
  createShopifyCheckout: vi.fn()
}))

import { createShopifyCheckout } from '../data/shopify-api'
const mockCreateShopifyCheckout = vi.mocked(createShopifyCheckout)

// Mock window.location
const mockLocationAssign = vi.fn()
Object.defineProperty(window, 'location', {
  value: { href: '', assign: mockLocationAssign },
  writable: true
})

// Mock Cloudinary
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Helper to add items to cart
function CartLoader({ items, children }: { items: ReturnType<typeof createMockCartItem>[]; children?: ReactNode }) {
  const dispatch = useCartDispatch()

  useEffect(() => {
    items.forEach(item => {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          frameId: item.frameId,
          title: item.title,
          artist: item.artist,
          image: item.image,
          price: item.price
        }
      })
    })
  }, [dispatch, items])

  return <>{children}</>
}

// Test wrapper
function TestWrapper({
  children,
  initialRoute = '/checkout',
  cartItems = []
}: {
  children: ReactNode
  initialRoute?: string
  cartItems?: ReturnType<typeof createMockCartItem>[]
}) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        {cartItems.length > 0 ? (
          <CartLoader items={cartItems}>
            <Routes>
              <Route path="/checkout" element={children} />
              <Route path="/" element={<div>Home</div>} />
            </Routes>
          </CartLoader>
        ) : (
          <Routes>
            <Route path="/checkout" element={children} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        )}
      </CartProvider>
    </MemoryRouter>
  )
}

describe('Checkout Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.location.href = ''
  })

  describe('Empty Cart', () => {
    it('should show empty cart message', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      })
    })

    it('should show continue shopping link', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Continue shopping' })).toBeInTheDocument()
      })
    })

    it('should link to home page', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Continue shopping' })
        expect(link.getAttribute('href')).toBe('/')
      })
    })
  })

  describe('With Cart Items', () => {
    const testItems = [createMockCartItem({
      productId: 'test-1',
      title: 'Test Artwork',
      artist: 'Test Artist',
      sizeId: '8x10',
      frameId: 'black',
      price: 45
    })]

    it('should show redirecting message', async () => {
      mockCreateShopifyCheckout.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Redirecting to checkout...')).toBeInTheDocument()
      })
    })

    it('should show secure checkout message', async () => {
      mockCreateShopifyCheckout.mockImplementation(() => new Promise(() => {}))

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/secure checkout page/i)).toBeInTheDocument()
      })
    })

    it('should show loading spinner', async () => {
      mockCreateShopifyCheckout.mockImplementation(() => new Promise(() => {}))

      const { container } = render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        const spinner = container.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
      })
    })

    it('should call createShopifyCheckout with cart items', async () => {
      mockCreateShopifyCheckout.mockResolvedValue('https://shop.myshopify.com/checkout')

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockCreateShopifyCheckout).toHaveBeenCalledWith([
          {
            variantId: testItems[0].variantId,
            quantity: 1
          }
        ])
      })
    })

    it('should redirect to Shopify checkout URL', async () => {
      const checkoutUrl = 'https://shop.myshopify.com/checkout/abc123'
      mockCreateShopifyCheckout.mockResolvedValue(checkoutUrl)

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(window.location.href).toBe(checkoutUrl)
      })
    })
  })

  describe('Error State', () => {
    const testItems = [createMockCartItem()]

    it('should show error message on checkout failure', async () => {
      mockCreateShopifyCheckout.mockRejectedValue(new Error('Checkout failed'))

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Unable to start checkout. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show error heading', async () => {
      mockCreateShopifyCheckout.mockRejectedValue(new Error('Checkout failed'))

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Checkout Error' })).toBeInTheDocument()
      })
    })

    it('should show Try Again button on error', async () => {
      mockCreateShopifyCheckout.mockRejectedValue(new Error('Checkout failed'))

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      })
    })

    it('should retry checkout on Try Again click', async () => {
      // Always reject to stay in error state
      mockCreateShopifyCheckout.mockRejectedValue(new Error('Checkout failed'))

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      })

      // Get the call count before clicking
      const callCountBefore = mockCreateShopifyCheckout.mock.calls.length

      // Click retry
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))

      // Should attempt checkout again (at least one more call)
      await waitFor(() => {
        expect(mockCreateShopifyCheckout.mock.calls.length).toBeGreaterThan(callCountBefore)
      })
    })
  })
})
