'use client'

import { useState } from 'react'
import { Award, Users, Globe, Heart, Shield, Target, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState('story')

  const stats = [
    { icon: Users, value: '18+', label: 'Years Experience', color: 'from-atlantic-primary to-gray-600' },
    { icon: Globe, value: '50+', label: 'Countries Served', color: 'from-accent-gold to-orange-500' },
    { icon: Heart, value: '10K+', label: 'Happy Customers', color: 'from-gray-500 to-gray-600' },
    { icon: Award, value: '100%', label: 'Quality Assured', color: 'from-green-500 to-emerald-600' },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'Every product meets our highest standards of craftsmanship and material selection.',
      color: 'from-atlantic-primary to-purple-600'
    },
    {
      icon: Target,
      title: 'Customer Focus',
      description: 'We prioritize customer satisfaction and build lasting relationships through quality.',
      color: 'from-accent-gold to-orange-500'
    },
    {
      icon: Star,
      title: 'Innovation',
      description: 'Continuously evolving our techniques while preserving traditional craftsmanship.',
      color: 'from-gray-500 to-gray-600'
    }
  ]

  return (
    <section className="bg-white py-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-atlantic-primary/5 to-gray-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-accent-gold/5 to-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-gray-500/3 to-gray-600/3 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom py-4 px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-leather-50 text-leather-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <div className="w-1 h-1 bg-atlantic-primary rounded-full"></div>
            <span>Our Story</span>
            <div className="w-1 h-1 bg-accent-gold rounded-full"></div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-leather-900 mb-3">
            Crafting Excellence Since <span className="text-atlantic-primary">2006</span>
          </h2>
          
          <p className="text-base text-leather-700 max-w-2xl mx-auto">
            Atlantic Leather has been crafting high-quality leather footwear and products for over 18 years. 
            We blend traditional craftsmanship with modern technology.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
          {/* Left Content */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-leather-900">
                From Passion to <span className="text-atlantic-primary">Excellence</span>
              </h3>
              
              <p className="text-sm text-leather-700">
                Our journey began with a passion to create footwear that merges style, comfort, and durability. 
                We blend traditional craftsmanship with modern technology to deliver premium leather goods.
              </p>
            </div>

            {/* Simplified Features */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-1 bg-leather-50 px-2 py-1 rounded text-xs">
                <div className="w-2 h-2 bg-atlantic-primary rounded-full"></div>
                <span className="text-leather-700">Premium Materials</span>
              </div>
              <div className="flex items-center space-x-1 bg-leather-50 px-2 py-1 rounded text-xs">
                <div className="w-2 h-2 bg-accent-gold rounded-full"></div>
                <span className="text-leather-700">Handcrafted</span>
              </div>
              <div className="flex items-center space-x-1 bg-leather-50 px-2 py-1 rounded text-xs">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-leather-700">18+ Years</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 bg-atlantic-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-atlantic-primary/90 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Content - Simplified Image */}
          <div className="relative">
            <div className="bg-white rounded-xl shadow-md p-4 border border-leather-200">
              <div className="bg-leather-50 rounded-lg p-4 text-center">
                <div className="w-20 h-20 bg-atlantic-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">A</span>
                </div>
                <h4 className="text-lg font-semibold text-leather-800 mb-1">Atlantic Leather</h4>
                <p className="text-leather-600 text-sm">Tatek Industrial Zone</p>
                <p className="text-leather-600 text-xs">Since 2006</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-atlantic-primary mb-1">18+</div>
            <div className="text-xs text-leather-600">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-gold mb-1">50+</div>
            <div className="text-xs text-leather-600">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500 mb-1">10K+</div>
            <div className="text-xs text-leather-600">Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">100%</div>
            <div className="text-xs text-leather-600">Quality</div>
          </div>
        </div>
      </div>
    </section>
  )
}
