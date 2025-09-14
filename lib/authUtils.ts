// Authentication utilities for admin panel
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

// Token refresh utility
export async function refreshTokenIfNeeded(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      return null
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        return data.data.accessToken
      }
    }
    
    return null
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

// Enhanced fetch with token refresh
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let accessToken = localStorage.getItem('accessToken')
  
  // Add authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  }

  let response = await fetch(url, { ...options, headers })

  // If token expired, try to refresh
  if (response.status === 403) {
    const newToken = await refreshTokenIfNeeded()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      response = await fetch(url, { ...options, headers })
    } else {
      // Refresh failed, redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/admin/login'
      throw new Error('Authentication failed')
    }
  }

  return response
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('accessToken')
  return !!token
}

// Get current user
export function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Logout utility
export function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/admin/login'
}
