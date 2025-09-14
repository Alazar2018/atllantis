import { Suspense } from 'react'
import ProductsClient from './ProductsClient'
import { getProducts } from '@/lib/adminApi'

export default async function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ProductsClient />
    </Suspense>
  )
}
