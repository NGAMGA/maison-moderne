import { memo, type ReactNode } from 'react'
import ProductCard from '@/features/products/ProductCard'
import { useProducts } from '@/features/products/queries'

type ProductListProps = {
  onAddToCart: (productId: string) => void
  maxItems?: number
}

function ProductList({ onAddToCart, maxItems }: ProductListProps) {
  const { data, isLoading, error } = useProducts()
  let content: ReactNode

  if (isLoading) {
    content = <p className="fetch-message" role="status">Chargement des produits…</p>
  } else if (error) {
    content = <p className="fetch-message error-message" role="alert">{error.message}</p>
  } else {
    const all = data ?? []
    const products = maxItems === undefined ? all : all.slice(0, maxItems)
    content = products.length > 0
      ? products.map((product, index) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} index={index} />
        ))
      : <p className="fetch-message">Aucun produit à afficher pour le moment.</p>
  }

  return <div className="product-grid" aria-live="polite">{content}</div>
}

export default memo(ProductList)