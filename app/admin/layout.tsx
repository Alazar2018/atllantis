'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Skip auth check for login page
        if (pathname === '/admin/login') {
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }

        // Check if user is authenticated using localStorage
        const accessToken = localStorage.getItem('accessToken')
        const user = localStorage.getItem('user')
        
        if (!accessToken || !user) {
          router.push('/admin/login')
          return
        }

        // Verify token is still valid by checking expiration
        try {
          const tokenData = JSON.parse(atob(accessToken.split('.')[1]))
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (tokenData.exp < currentTime) {
            // Token expired, try to refresh
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              // Attempt to refresh token
              const response = await fetch('/api/admin/auth/refresh', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
              })

              if (response.ok) {
                const data = await response.json()
                if (data.success) {
                  // Update tokens
                  localStorage.setItem('accessToken', data.accessToken)
                  localStorage.setItem('refreshToken', data.refreshToken)
                  localStorage.setItem('user', JSON.stringify(data.user))
                  setIsAuthenticated(true)
                  setIsLoading(false)
                  return
                }
              }
            }
            
            // Refresh failed, clear tokens and redirect
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            router.push('/admin/login')
            return
          }
          
          setIsAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          router.push('/admin/login')
          return
        }
      } catch (error) {
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </div>
          <p className="mt-6 text-white text-lg font-medium">Loading Admin Portal...</p>
          <p className="mt-2 text-gray-300 text-sm">Please wait while we verify your access</p>
        </div>
      </div>
    )
  }

  // Don't show layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Don't render layout if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="flex flex-col lg:flex-row">
          <AdminSidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
          <main className="flex-1 p-3 lg:p-6 transition-all duration-300">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-xl border border-white/20 p-4 lg:p-6 min-h-[calc(100vh-120px)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
