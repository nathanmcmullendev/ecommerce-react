import { useState, useMemo } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { useCartDispatch } from '../../context/CartContext'
import { getResizedImage } from '../../utils/images'
import type { Product, CartItem } from '../../types'

/**
 * Frame options matching the product page
 */
const frameOptions = [
  { id: 'Unframed', label: 'No Frame', color: '#f5f5f5', symbol: '×' },
  { id: 'Black Frame', label: 'Black', color: '#1a1a1a' },
  { id: 'White Frame', label: 'White', color: '#ffffff' },
  { id: 'Natural Wood', label: 'Natural', color: '#c4a574' },
]

/**
 * Size options with prices (matching product page) - inches only
 */
const sizeOptions = [
  { id: '8x10', label: '8×10"', price: 45 },
  { id: '11x14', label: '11×14"', price: 65 },
  { id: '16x20', label: '16×20"', price: 95 },
  { id: '24x30', label: '24×30"', price: 145 },
]

/**
 * Frame price additions
 */
const framePrices: Record<string, number> = {
  'Unframed': 0,
  'Black Frame': 35,
  'White Frame': 35,
  'Natural Wood': 45,
}

interface YouMayAlsoLikeProps {
  /** Current cart items to exclude from suggestions */
  cartItems: CartItem[]
}

/**
 * YouMayAlsoLike Component
 *
 * Shows product recommendations in the cart with full purchase options.
 * Mirrors hikariandink.com's cart upsell pattern.
 *
 * Features:
 * - Carousel navigation (< 1/8 >)
 * - Frame color selector circles
 * - Size dropdown with prices
 * - Add to cart button
 */
export function YouMayAlsoLike({ cartItems }: YouMayAlsoLikeProps) {
  const products = useProducts()
  const dispatch = useCartDispatch()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedFrame, setSelectedFrame] = useState('Black Frame')
  const [selectedSize, setSelectedSize] = useState('8x10')

  // Get products from same artist(s) as cart items, excluding items already in cart
  const cartProductIds = useMemo(
    () => new Set(cartItems.map(item => item.productId)),
    [cartItems]
  )

  const cartArtists = useMemo(
    () => new Set(cartItems.map(item => item.artist)),
    [cartItems]
  )

  const suggestions = useMemo(
    () => products.filter((p: Product) =>
      !cartProductIds.has(p.id) && cartArtists.has(p.artist)
    ),
    [products, cartProductIds, cartArtists]
  )

  // Don't render if no suggestions
  if (suggestions.length === 0) return null

  const currentProduct = suggestions[currentIndex]
  const totalProducts = suggestions.length

  const handlePrev = () => {
    setCurrentIndex((i) => (i === 0 ? totalProducts - 1 : i - 1))
    // Reset selections for new product
    setSelectedFrame('Black Frame')
    setSelectedSize('8x10')
  }

  const handleNext = () => {
    setCurrentIndex((i) => (i === totalProducts - 1 ? 0 : i + 1))
    // Reset selections for new product
    setSelectedFrame('Black Frame')
    setSelectedSize('8x10')
  }

  const selectedSizeOption = sizeOptions.find(s => s.id === selectedSize) || sizeOptions[0]
  const frameColor = frameOptions.find(f => f.id === selectedFrame)?.color || '#1a1a1a'
  const framePrice = framePrices[selectedFrame] || 0
  const totalPrice = selectedSizeOption.price + framePrice

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: currentProduct.id,
        variantId: `${currentProduct.id}-${selectedSize}-${selectedFrame}`,
        sizeId: selectedSize,
        frameId: selectedFrame,
        title: currentProduct.title,
        artist: currentProduct.artist,
        image: currentProduct.image,
        price: totalPrice
      }
    })
    // Move to next product after adding
    if (totalProducts > 1) {
      handleNext()
    }
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
      {/* Header with title and navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          You may also like
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous suggestion"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-500 min-w-[40px] text-center">
            {currentIndex + 1}/{totalProducts}
          </span>
          <button
            onClick={handleNext}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next suggestion"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product Card */}
      <div className="flex gap-4">
        {/* Product Image with frame */}
        <div
          className="w-24 h-24 flex-shrink-0 overflow-hidden"
          style={{
            border: `3px solid ${frameColor}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <img
            src={getResizedImage(currentProduct.image, 120)}
            alt={currentProduct.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-medium text-sm text-gray-900 line-clamp-1 mb-2">
            {currentProduct.title}
          </h4>

          {/* Frame Selector */}
          <div className="mb-3">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1.5">
              Frame:
            </span>
            <div className="flex items-center gap-1.5">
              {frameOptions.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedFrame === frame.id
                      ? 'ring-2 ring-gray-800 ring-offset-1'
                      : 'border border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: frame.color }}
                  title={frame.label}
                  aria-label={`Select ${frame.label}`}
                >
                  {frame.symbol && (
                    <span className="text-xs text-gray-400">{frame.symbol}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Dropdown + Price + Add Button */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="flex-1 text-xs py-1.5 px-2 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {sizeOptions.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-gray-900 min-w-[50px]">
              ${totalPrice}
            </span>
            <button
              onClick={handleAddToCart}
              className="px-4 py-1.5 text-sm font-medium text-white bg-ink-800 hover:bg-ink-900 rounded transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
