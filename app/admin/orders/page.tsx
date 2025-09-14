import { Suspense } from 'react'
import OrdersClient from './OrdersClient'
import { getOrders } from '@/lib/adminApi'

export default async function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <OrdersClient />
    </Suspense>
  )
}
