'use client'

import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer id="contact" className="bg-white border-t border-leather-200">
      <div className="container-custom section-padding">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-atlantic-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-leather-900">Atlantic Leather</span>
            </div>
            
            <p className="text-leather-700 leading-relaxed max-w-md">
              Since 2006, Atlantic Leather has been crafting premium leather footwear and products with 
              unmatched quality and craftsmanship. We blend traditional techniques with modern innovation 
              to deliver excellence in every piece.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-leather-100 rounded-full flex items-center justify-center hover:bg-atlantic-primary hover:text-white transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-leather-100 rounded-full flex items-center justify-center hover:bg-atlantic-primary hover:text-white transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-leather-100 rounded-full flex items-center justify-center hover:bg-atlantic-primary hover:text-white transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-leather-900">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-leather-700 hover:text-atlantic-primary transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-leather-700 hover:text-atlantic-primary transition-colors">Products</Link></li>
              <li><Link href="#about" className="text-leather-700 hover:text-atlantic-primary transition-colors">About Us</Link></li>
              <li><a href="#" className="text-leather-700 hover:text-atlantic-primary transition-colors">Our Story</a></li>
              <li><a href="#" className="text-leather-700 hover:text-atlantic-primary transition-colors">Artisans</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-leather-900">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-atlantic-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-leather-700">info@atlanticleather.com</p>
                  <p className="text-leather-500 text-sm">We'll respond within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-atlantic-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-leather-700">+251 911 123 456</p>
                  <p className="text-leather-500 text-sm">Mon-Fri, 9AM-6PM EAT</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-atlantic-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-leather-700">Tatek Industrial Zone</p>
                  <p className="text-leather-500 text-sm">Visit our workshop</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-leather-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-leather-500">
              <span className="text-atlantic-primary font-bold">A</span>
              <span>© 2024 Atlantic Leather. All rights reserved.</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-leather-500">
              <a href="#" className="hover:text-atlantic-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-atlantic-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-atlantic-primary transition-colors">Shipping Info</a>
            </div>
          </div>
        </div>        
      </div>
    </footer>
  )
}
