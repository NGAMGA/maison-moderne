import type { Product } from '@/types/ecommerce'
import { Link } from 'react-router-dom'

type ProductCardProps = {
  product: Product
  onAddToCart: (productId: string) => void
  index?: number
}

const IMAGE_WIDTHS = [400, 600, 900]

function resizedUrl(src: string, width: number): string | null {
  try {
    const url = new URL(src)
    if (url.hostname !== 'images.unsplash.com') return null
    url.searchParams.set('w', String(width))
    return url.toString()
  } catch {
    return null
  }
}

function buildSrcSet(src: string): string | undefined {
  const entries = IMAGE_WIDTHS.map((width) => {
    const url = resizedUrl(src, width)
    return url ? `${url} ${width}w` : null
  })
  return entries.every(Boolean) ? entries.join(', ') : undefined
}

function ProductCard({ product, onAddToCart, index = 0 }: ProductCardProps) {
  const isAboveFold = index < 2

  return (
    <article className="product-card">
      <Link className="product-image-link" to={`/products/${product.id}`} aria-label={`Voir ${product.name}`}>
        <div className="product-image-wrap">
          {product.image && (
            <img
              className="product-image"
              src={product.image}
              srcSet={buildSrcSet(product.image)}
              sizes="(max-width: 390px) 100vw, (max-width: 720px) 50vw, 460px"
              alt={product.name}
              width={600}
              height={455}
              loading={isAboveFold ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
              decoding="async"
            />
          )}
          {product.badge && <span className="product-badge">{product.badge}</span>}
          {product.category && <span className="product-category">{product.category}</span>}
        </div>
      </Link>
      <div className="product-details">
        <div className="product-title-row">
          <h3><Link className="product-title-link" to={`/products/${product.id}`}>{product.name}</Link></h3>
          <span className="product-price">{product.price} €</span>
        </div>
        {product.description && <p>{product.description}</p>}
        <div className="product-actions">
          <span className={product.inStock ? 'stock-status' : 'stock-status is-out'}>
            <span aria-hidden="true" />
            {product.inStock ? 'En stock' : 'Épuisé'}
          </span>
          <button
            className="add-button"
            type="button"
            disabled={!product.inStock}
            onClick={() => onAddToCart(product.id)}
          >
            Ajouter au panier
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard