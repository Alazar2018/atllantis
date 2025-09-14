# Frontend Security Guide - Atlantic Leather

## 🔒 Frontend Security Overview

This document outlines the comprehensive security measures implemented in the Atlantic Leather frontend application.

## ✅ **Security Features Implemented**

### 1. **Security Headers & CSP**
- ✅ **Content Security Policy (CSP)** - Prevents XSS attacks
- ✅ **X-Frame-Options** - Prevents clickjacking
- ✅ **X-Content-Type-Options** - Prevents MIME sniffing
- ✅ **Strict-Transport-Security** - Enforces HTTPS
- ✅ **Referrer-Policy** - Controls referrer information
- ✅ **Permissions-Policy** - Restricts browser features

### 2. **Input Validation & Sanitization**
- ✅ **Client-side validation** with `useValidation` hook
- ✅ **Server-side validation** in API routes
- ✅ **XSS protection** with HTML sanitization
- ✅ **SQL injection prevention** through parameterized queries
- ✅ **Input length limits** and type validation

### 3. **CSRF Protection**
- ✅ **CSRF tokens** for state-changing operations
- ✅ **SameSite cookies** for additional protection
- ✅ **Origin validation** in middleware
- ✅ **Double-submit cookie pattern**

### 4. **Rate Limiting**
- ✅ **Client-side rate limiting** for API calls
- ✅ **Server-side rate limiting** in middleware
- ✅ **Login attempt limiting** (5 attempts per 15 minutes)
- ✅ **IP-based tracking** for abuse prevention

### 5. **Secure API Communication**
- ✅ **HTTPS enforcement** in production
- ✅ **API key validation** and rotation
- ✅ **Request/response sanitization**
- ✅ **Error message sanitization**
- ✅ **Timeout protection** (10 seconds)

### 6. **Authentication Security**
- ✅ **Secure token storage** with encryption
- ✅ **Automatic token refresh** mechanism
- ✅ **Token expiration handling**
- ✅ **Secure logout** with token invalidation

## 🛡️ **Security Components**

### 1. **Secure API Client (`lib/secureApi.ts`)**
```typescript
import { secureApiClient } from '@/lib/secureApi'

// Automatically validates and sanitizes all requests
const products = await secureApiClient.getProducts()
```

### 2. **Input Validation Hook (`lib/useValidation.ts`)**
```typescript
import { useValidation, commonRules } from '@/lib/useValidation'

const { validate, errors } = useValidation({
  email: commonRules.email,
  password: commonRules.password
})
```

### 3. **CSRF Protection Middleware (`middleware.ts`)**
- Automatically adds CSRF tokens to requests
- Validates CSRF tokens for state-changing operations
- Implements rate limiting per IP
- Adds security headers to all responses

### 4. **Secure Token Storage (`lib/auth.ts`)**
```typescript
import { SecureTokenStorage } from '@/lib/auth'

// Encrypted token storage
SecureTokenStorage.setTokens(accessToken, refreshToken, user)
const tokens = SecureTokenStorage.getTokens()
```

## 🔧 **Configuration**

### Environment Variables
```bash
# Required for security
NEXT_PUBLIC_PRIVATE_API_KEY=your_secure_api_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://yourdomain.com

# Production settings
NODE_ENV=production
```

### Next.js Security Configuration
```javascript
// next.config.js
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ]
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
}
```

## 🚨 **Security Best Practices**

### 1. **Input Handling**
```typescript
// ✅ Good - Validate and sanitize
const sanitizedInput = InputValidator.sanitizeString(userInput)
const isValid = InputValidator.validateEmail(email)

// ❌ Bad - Direct usage
const html = userInput // XSS vulnerability
```

### 2. **API Calls**
```typescript
// ✅ Good - Use secure client
const response = await secureApiClient.getProducts()

// ❌ Bad - Direct fetch without validation
const response = await fetch('/api/products')
```

### 3. **Error Handling**
```typescript
// ✅ Good - Don't expose sensitive info
catch (error) {
  return { error: 'Internal server error' }
}

// ❌ Bad - Expose internal details
catch (error) {
  return { error: error.stack }
}
```

### 4. **Token Management**
```typescript
// ✅ Good - Use secure storage
SecureTokenStorage.setTokens(token, refreshToken, user)

// ❌ Bad - Plain localStorage
localStorage.setItem('token', token)
```

## 🔍 **Security Testing**

### 1. **Run Security Audit**
```bash
npm run security-audit
```

### 2. **Check for Vulnerabilities**
```bash
npm audit
npm audit fix
```

### 3. **Test CSRF Protection**
- Try submitting forms without CSRF tokens
- Verify tokens are validated on server

### 4. **Test Rate Limiting**
- Make multiple rapid requests
- Verify rate limiting kicks in

### 5. **Test Input Validation**
- Submit malicious scripts in forms
- Verify XSS protection works

## 🚫 **Security Violations to Avoid**

### Never Do:
- ❌ Use `dangerouslySetInnerHTML` without sanitization
- ❌ Store sensitive data in localStorage without encryption
- ❌ Expose API keys in client-side code
- ❌ Skip input validation
- ❌ Use `eval()` or similar dangerous functions
- ❌ Trust user input without validation
- ❌ Expose internal error details

### Always Do:
- ✅ Validate all user input
- ✅ Sanitize HTML content
- ✅ Use HTTPS in production
- ✅ Implement proper error handling
- ✅ Use secure token storage
- ✅ Enable security headers
- ✅ Regular security audits

## 📋 **Security Checklist**

Before deployment:

- [ ] All environment variables are secure
- [ ] CSP headers are properly configured
- [ ] Input validation is implemented
- [ ] CSRF protection is active
- [ ] Rate limiting is configured
- [ ] HTTPS is enabled
- [ ] Source maps are disabled
- [ ] Error messages don't leak information
- [ ] API keys are properly secured
- [ ] Security audit passes

## 🆘 **Security Incident Response**

If a security issue is discovered:

1. **Immediate Response**
   - Disable affected features
   - Rotate API keys and secrets
   - Check logs for suspicious activity

2. **Investigation**
   - Run security audit
   - Check for data breaches
   - Identify attack vectors

3. **Recovery**
   - Patch vulnerabilities
   - Update security measures
   - Notify users if necessary

## 📞 **Security Contact**

For security-related questions or to report vulnerabilities:
- Email: security@atlanticleather.com
- Response time: 24 hours

---

**Last Updated:** $(date)
**Version:** 1.0
**Status:** ✅ Frontend security implemented
