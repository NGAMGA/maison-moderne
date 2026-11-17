import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/ecommerce'

type ProductRow = {
  id: string
  slug: string
  name: string
  price: number | string
  description: string | null
  category: string | null
  badge: string | null
  image_url: string | null
  in_stock: boolean
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    inStock: row.in_stock,
    category: row.category ?? undefined,
    description: row.description ?? undefined,
    image: row.image_url ?? undefined,
    badge: row.badge ?? undefined,
  }
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select()
      if (error) throw new Error(error.message)
      return (data as ProductRow[]).map(toProduct)
    },
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', { id }],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select()
        .eq('id', id as string)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data ? toProduct(data as ProductRow) : null
    },
  })
}