'use client'

import { ArrowRight, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white">
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-20 w-6 h-6 bg-atlantic-primary rounded-full floating-element opacity-40"></div>
      <div className="absolute top-32 right-32 w-4 h-4 bg-accent-gold rounded-full floating-element opacity-60" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 left-32 w-8 h-8 bg-atlantic-secondary rounded-full floating-element opacity-30" style={{animationDelay: '4s'}}></div>
      <div className="absolute top-48 left-1/2 w-3 h-3 bg-atlantic-primary rounded-full floating-element opacity-50" style={{animationDelay: '1s'}}></div>
      
      <div className="container-custom section-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-accent-gold text-accent-gold" />
                  ))}
                </div>
                <span className="text-leather-600 text-lg">Trusted by customers since 2006</span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-bold text-leather-900 leading-tight fade-in-up">
                Premium{' '}
                <span className="text-atlantic-primary leather-border px-4 py-2 rounded-lg">Leather</span>{' '}
                Craftsmanship Since 2006
              </h1>
              
              <p className="text-xl text-leather-700 leading-relaxed slide-in-left">
                Atlantic Leather has been a leader in crafting high-quality leather footwear and products 
                for over 18 years. We blend traditional craftsmanship with modern technology to deliver premium leather goods.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button className="atlantic-button flex items-center justify-center space-x-3 group text-lg py-4 px-8">
                <span>Explore Collection</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
              <button className="leather-button text-lg py-4 px-8">
                Learn Our Story
              </button>
            </div>

            <div className="flex items-center space-x-10 text-lg text-leather-600">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-atlantic-primary rounded-full pulse-glow"></div>
                <span>Premium Leather Quality</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-accent-gold rounded-full pulse-glow" style={{animationDelay: '1s'}}></div>
                <span>Made in Tatek Industrial Zone</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-white rounded-3xl shadow-2xl p-10 transform rotate-3 hover:rotate-0 transition-all duration-700 leather-border">
                <div className="bg-leather-100 rounded-2xl p-8 text-center">
                  <div className="w-32 h-32 bg-atlantic-primary rounded-full mx-auto mb-6 flex items-center justify-center pulse-glow">
                    <span className="text-white text-5xl font-bold">A</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-leather-800 mb-3">Atlantic Leather</h3>
                  <p className="text-leather-600 text-lg">18+ Years of Excellence</p>
                  
                  {/* Leather Texture Indicator */}
                  <div className="mt-6 flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-leather-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-leather-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-leather-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Decorative Elements */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-accent-gold/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-atlantic-primary/20 rounded-full blur-3xl"></div>
            
            {/* Leather Stitching Pattern */}
            <div className="absolute top-1/2 left-0 w-16 h-1 bg-leather-400 rounded-full transform -translate-y-1/2 opacity-60"></div>
            <div className="absolute top-1/2 right-0 w-16 h-1 bg-leather-400 rounded-full transform -translate-y-1/2 opacity-60"></div>
            <div className="absolute top-0 left-1/2 w-1 h-16 bg-leather-400 rounded-full transform -translate-x-1/2 opacity-60"></div>
            <div className="absolute bottom-0 left-1/2 w-1 h-16 bg-leather-400 rounded-full transform -translate-x-1/2 opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
