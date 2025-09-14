'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import CartDropdown from './CartDropdown'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('home')
  const pathname = usePathname()

  useEffect(() => {
    // Set active link based on current pathname
    if (pathname === '/') {
      setActiveLink('home')
    } else if (pathname === '/products') {
      setActiveLink('products')
    } else if (pathname === '/about') {
      setActiveLink('about')
    } else if (pathname === '/contact') {
      setActiveLink('contact')
    }
  }, [pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-leather-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" onClick={closeMenu}>
            <div className="w-48 h-16 relative">
              <Image
                src="/logo.png"
                alt="Atlantic Leather Logo"
                width={192}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-lg font-medium transition-colors duration-200 ${
                activeLink === 'home' 
                  ? 'text-atlantic-primary border-b-2 border-atlantic-primary' 
                  : 'text-leather-700 hover:text-atlantic-primary'
              }`}
              onClick={() => setActiveLink('home')}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`text-lg font-medium transition-colors duration-200 ${
                activeLink === 'products' 
                  ? 'text-atlantic-primary border-b-2 border-atlantic-primary' 
                  : 'text-leather-700 hover:text-atlantic-primary'
              }`}
              onClick={() => setActiveLink('products')}
            >
              Products
            </Link>
            <Link 
              href="/about" 
              className={`text-lg font-medium transition-colors duration-200 ${
                activeLink === 'about' 
                  ? 'text-atlantic-primary border-b-2 border-atlantic-primary' 
                  : 'text-leather-700 hover:text-atlantic-primary'
              }`}
              onClick={() => setActiveLink('about')}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-lg font-medium transition-colors duration-200 ${
                activeLink === 'contact' 
                  ? 'text-atlantic-primary border-b-2 border-atlantic-primary' 
                  : 'text-leather-700 hover:text-atlantic-primary'
              }`}
              onClick={() => setActiveLink('contact')}
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <button className="text-leather-600 hover:text-atlantic-primary transition-colors duration-200">
              <Search className="w-6 h-6" />
            </button>
            {/* Temporarily commented out user and favorites functionality */}
            {/* <button className="text-leather-600 hover:text-atlantic-primary transition-colors duration-200">
              <Heart className="w-6 h-6" />
            </button>
            <button className="text-leather-600 hover:text-atlantic-primary transition-colors duration-200">
              <User className="w-6 h-6" />
            </button> */}
            <CartDropdown />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-leather-700 hover:text-atlantic-primary transition-colors duration-200"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-leather-200 bg-white">
            <nav className="py-4 space-y-4">
              <Link 
                href="/" 
                className={`block text-lg font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeLink === 'home' 
                    ? 'text-atlantic-primary bg-atlantic-primary/10' 
                    : 'text-leather-700 hover:text-atlantic-primary hover:bg-leather-50'
                }`}
                onClick={() => { setActiveLink('home'); closeMenu(); }}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className={`block text-lg font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeLink === 'products' 
                    ? 'text-atlantic-primary bg-atlantic-primary/10' 
                    : 'text-leather-700 hover:text-atlantic-primary hover:bg-leather-50'
                }`}
                onClick={() => { setActiveLink('products'); closeMenu(); }}
              >
                Products
              </Link>
              <Link 
                href="/about" 
                className={`block text-lg font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeLink === 'about' 
                    ? 'text-atlantic-primary bg-atlantic-primary/10' 
                    : 'text-leather-700 hover:text-atlantic-primary hover:bg-leather-50'
                }`}
                onClick={() => { setActiveLink('about'); closeMenu(); }}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block text-lg font-medium px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeLink === 'contact' 
                    ? 'text-atlantic-primary bg-atlantic-primary/10' 
                    : 'text-leather-700 hover:text-atlantic-primary hover:bg-leather-50'
                }`}
                onClick={() => { setActiveLink('contact'); closeMenu(); }}
              >
                Contact
              </Link>
            </nav>
            
            {/* Mobile Icons */}
            <div className="flex items-center justify-around py-4 border-t border-leather-200">
              <button className="text-leather-600 hover:text-atlantic-primary transition-colors duration-200 p-2">
                <Search className="w-5 h-5" />
              </button>
              {/* Temporarily commented out user and favorites functionality */}
              {/* <button className="text-leather-600 hover:text-atlantic-primary transition-colors duration-200 p-2">
                <Heart className="w-5 h-5" />
              </button>
              <button className="text-leather-600 hover:text-atlantic-primary transition-colors duration-200 p-2">
                <User className="w-5 h-5" />
              </button> */}
              <CartDropdown />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
