'use client'

import { ArrowRight, Star, Shield, Award, Heart, ShoppingCart, Sparkles, Zap, Target } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white py-8">
      {/* Simplified Background Elements */}
      <div className="absolute inset-0">
        {/* Clean gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/20 to-gray-100/10"></div>
        
        {/* Minimal decorative elements */}
        <div className="absolute top-20 left-20 w-24 h-24 border border-atlantic-primary/5 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-accent-gold/5 rounded-full"></div>
      </div>
      
      {/* Simplified Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-atlantic-primary rounded-full floating-element opacity-40"></div>
      <div className="absolute top-32 right-32 w-3 h-3 bg-accent-gold rounded-full floating-element opacity-60" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 left-32 w-5 h-5 bg-gray-500 rounded-full floating-element opacity-30" style={{animationDelay: '4s'}}></div>
      
      <div className="container-custom py-8 px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content - Enhanced */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Simplified Rating Section */}
              <div className="flex items-center space-x-2 bg-leather-50 px-3 py-1 rounded-full">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent-gold text-accent-gold" />
                  ))}
                </div>
                <span className="text-leather-600 text-xs font-medium">Trusted since 2006</span>
              </div>
              
              {/* Simplified Main Heading */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                  <span className="text-leather-900">Premium</span>{' '}
                  <span className="text-atlantic-primary">Leather</span>{' '}
                  <span className="text-leather-900">Craftsmanship</span>
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-accent-gold rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">18+</span>
                  </div>
                  <span className="text-base text-leather-700 font-medium">Years of Excellence</span>
                </div>
              </div>
              
              {/* Simplified Description */}
              <p className="text-base text-leather-700 max-w-lg">
                Crafting high-quality leather footwear and products for over 18 years. 
                Traditional craftsmanship meets modern technology.
              </p>
            </div>

            {/* Simplified CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products" className="bg-atlantic-primary text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-atlantic-primary/90 transition-colors">
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/about" className="bg-leather-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-leather-700 transition-colors">
                Learn Our Story
              </Link>
            </div>

            {/* Simplified Features */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-atlantic-primary rounded-full"></div>
                <span className="text-leather-700 text-sm font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent-gold rounded-full"></div>
                <span className="text-leather-700 text-sm font-medium">Handcrafted</span>
              </div>
            </div>
            
            {/* Simplified Cultural Touch */}
            <div className="bg-leather-50 p-3 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-atlantic-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ኤ</span>
                </div>
                <span className="text-sm font-medium text-leather-800">Ethiopian Heritage</span>
                <div className="w-4 h-4 bg-accent-gold rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ኤ</span>
                </div>
              </div>
              <p className="text-leather-700 text-center text-xs">
                Ethiopian cultural heritage meets world-class craftsmanship.
              </p>
            </div>
          </div>

          {/* Right Content - Simplified Product Showcase */}
          <div className="relative">
            {/* Main Product Display */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-leather-200">
              <div className="bg-leather-50 rounded-lg p-4 text-center">
                <div className="w-24 h-24 bg-atlantic-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">A</span>
                </div>
                <h3 className="text-lg font-semibold text-leather-800 mb-1">Atlantic Leather</h3>
                <p className="text-leather-600 text-sm mb-3">18+ Years of Excellence</p>
                
                {/* Leather Texture Indicator */}
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-leather-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-leather-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-leather-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simplified Bottom Features Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-atlantic-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-leather-900 mb-1">Premium Quality</h3>
            <p className="text-leather-600 text-xs">Highest standards</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-leather-900 mb-1">18+ Years</h3>
            <p className="text-leather-600 text-xs">Expertise</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-leather-900 mb-1">Trusted</h3>
            <p className="text-leather-600 text-xs">Since 2006</p>
          </div>
        </div>
      </div>
    </section>
  )
}
