import { Suspense } from 'react'
import ProductDetailClient from './ProductDetailClient'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <ProductDetailClient productId={params.id} />
      </Suspense>
    </div>
  )
}
