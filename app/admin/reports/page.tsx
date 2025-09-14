import { Suspense } from 'react'
import ReportsClient from './ReportsClient'
import { getReportData } from '@/lib/adminApi'

export default async function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ReportsClient />
    </Suspense>
  )
}
