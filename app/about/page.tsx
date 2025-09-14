'use client'

import { useState } from 'react'
import { Award, Users, Globe, Heart, Shield, Target, Star, ArrowRight, MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story')

  const stats = [
    { icon: Users, value: '18+', label: 'Years Experience', color: 'from-atlantic-primary to-purple-600' },
    { icon: Globe, value: '50+', label: 'Countries Served', color: 'from-accent-gold to-orange-500' },
    { icon: Heart, value: '10K+', label: 'Happy Customers', color: 'from-atlantic-secondary to-blue-500' },
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
      color: 'from-atlantic-secondary to-blue-500'
    }
  ]

  const milestones = [
    { year: '2006', title: 'Company Founded', description: 'Atlantic Leather established in Tatek Industrial Zone' },
    { year: '2010', title: 'First Export', description: 'Began international distribution of leather products' },
    { year: '2015', title: 'Product Expansion', description: 'Launched comprehensive leather goods collection' },
    { year: '2020', title: 'Global Recognition', description: 'Achieved international quality certifications' },
    { year: '2024', title: 'Innovation Hub', description: 'Established modern manufacturing facilities' },
  ]

  const team = [
    { name: 'Craftsmanship Team', role: 'Artisans & Craftsmen', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center' },
    { name: 'Quality Control', role: 'Standards & Testing', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center' },
    { name: 'Design Studio', role: 'Creative & Innovation', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center' },
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-leather-50 via-amber-50 to-purple-50 py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-atlantic-primary/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-accent-gold/5 to-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-atlantic-secondary/3 to-blue-500/3 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center">
            {/* Ethiopian Cultural Badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-leather-50 to-amber-50 text-leather-700 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-leather-200/50">
              <div className="w-2 h-2 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full pulse-glow"></div>
              <span>Ethiopian Heritage</span>
              <div className="w-2 h-2 bg-gradient-to-r from-accent-gold to-orange-500 rounded-full pulse-glow" style={{animationDelay: '1s'}}></div>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold text-leather-900 mb-6">
              Our <span className="text-atlantic-primary">Story</span> of Excellence
            </h1>
            
            <p className="text-xl text-leather-700 max-w-4xl mx-auto mb-8 leading-relaxed">
              Atlantic Leather has been crafting premium leather goods for over 18 years, blending Ethiopian heritage 
              with modern craftsmanship to deliver products that stand the test of time.
            </p>
            
            {/* Cultural Stats */}
            <div className="flex items-center justify-center space-x-8 text-sm text-leather-600">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-accent-gold" />
                <span>18+ Years Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-atlantic-primary" />
                <span>Ethiopian Made</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-atlantic-secondary" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        {/* Company Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-leather-900">
                From Passion to{' '}
                <span className="text-atlantic-primary">Excellence</span>
              </h2>
              
              <p className="text-lg text-leather-700 leading-relaxed">
                Our journey began with a simple passion to create footwear that merges style, comfort, and durability. 
                Over the years, we have evolved, blending traditional craftsmanship with modern technology to deliver 
                premium leather goods that stand the test of time.
              </p>
              
              <p className="text-lg text-leather-700 leading-relaxed">
                What started with shoes has grown into a diverse range of products, expanding our expertise in the 
                leather industry while maintaining our commitment to quality and innovation.
              </p>
            </div>

            {/* Enhanced Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-leather-50 to-blue-50 rounded-xl border border-leather-200/50">
                <div className="w-4 h-4 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full pulse-glow"></div>
                <span className="text-leather-700 font-medium">Premium Materials</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-leather-50 to-orange-50 rounded-xl border border-leather-200/50">
                <div className="w-4 h-4 bg-gradient-to-r from-accent-gold to-orange-500 rounded-full pulse-glow" style={{animationDelay: '1s'}}></div>
                <span className="text-leather-700 font-medium">Handcrafted</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-leather-50 to-purple-50 rounded-xl border border-leather-200/50">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pulse-glow" style={{animationDelay: '2s'}}></div>
                <span className="text-leather-700 font-medium">18+ Years Experience</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-leather-50 to-green-50 rounded-xl border border-leather-200/50">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full pulse-glow" style={{animationDelay: '3s'}}></div>
                <span className="text-leather-700 font-medium">Global Reach</span>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Image */}
          <div className="relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-atlantic-primary/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-leather-200/50 transform rotate-2 hover:rotate-0 transition-all duration-700">
                <div className="bg-gradient-to-br from-leather-50 to-blue-50 rounded-2xl p-8 text-center border border-leather-200/50">
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full blur-xl opacity-60"></div>
                    <div className="relative w-48 h-48 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full flex items-center justify-center pulse-glow overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=192&h=192&fit=crop&crop=center"
                        alt="Atlantic Leather Craftsmanship"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <h4 className="text-2xl font-semibold text-leather-800 mb-3">Atlantic Leather</h4>
                  <p className="text-leather-600 text-lg mb-4">Tatek Industrial Zone</p>
                  <p className="text-leather-600 text-sm">Headquarters since 2006</p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 slide-in-right" style={{animationDelay: '0.5s'}}>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-leather-200/50 transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-accent-gold to-orange-500 rounded-full flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-sm font-semibold text-leather-800">Quality Award</h5>
                <p className="text-xs text-leather-600">2023 Winner</p>
              </div>
            </div>
            
            <div className="absolute -bottom-8 -left-8 slide-in-left" style={{animationDelay: '1s'}}>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-leather-200/50 transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-atlantic-secondary to-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-sm font-semibold text-leather-800">Global Reach</h5>
                <p className="text-xs text-leather-600">50+ Countries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div key={index} className="text-center slide-in-up group" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="relative mx-auto mb-4">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-all duration-300`}></div>
                <div className={`relative w-20 h-20 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-leather-900 mb-2">{stat.value}</div>
              <div className="text-leather-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="bg-gradient-to-br from-leather-50 to-blue-50 rounded-3xl p-8 border border-leather-200/50 slide-in-left">
            <div className="w-16 h-16 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-leather-900 mb-4">Our Mission</h3>
            <p className="text-leather-700 leading-relaxed">
              To craft high-quality leather shoes and products that seamlessly blend timeless craftsmanship with modern design, 
              ensuring customer satisfaction through durability, comfort, and style.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-leather-50 to-orange-50 rounded-3xl p-8 border border-leather-200/50 slide-in-right">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-gold to-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-leather-900 mb-4">Our Vision</h3>
            <p className="text-leather-700 leading-relaxed">
              To be a globally recognized leader in leather goods, setting the standard for ethical and sustainable 
              manufacturing practices, while continuously innovating to meet the evolving needs of our customers.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center mb-24">
          <h3 className="text-3xl font-bold text-leather-900 mb-12">
            Our Core <span className="text-atlantic-primary">Values</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="slide-in-up group" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="relative mx-auto mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${value.color} rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-all duration-300`}></div>
                  <div className={`relative w-20 h-20 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center`}>
                    <value.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-leather-900 mb-3">{value.title}</h4>
                <p className="text-leather-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="mb-24">
          <h3 className="text-3xl font-bold text-leather-900 mb-12 text-center">
            Our <span className="text-atlantic-primary">Journey</span> Through Time
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-atlantic-primary to-purple-600"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 px-8">
                    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-leather-200/50 transform hover:scale-105 transition-all duration-300 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="text-2xl font-bold text-atlantic-primary mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-semibold text-leather-900 mb-2">{milestone.title}</h4>
                      <p className="text-leather-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="w-1/2 px-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <h3 className="text-3xl font-bold text-leather-900 mb-12 text-center">
            Our <span className="text-atlantic-primary">Expert</span> Team
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="slide-in-up group" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="bg-white rounded-2xl shadow-lg border border-leather-200/50 overflow-hidden transform hover:scale-105 transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-leather-50 to-amber-50">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="text-xl font-semibold text-leather-900 mb-2">{member.name}</h4>
                    <p className="text-leather-600">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Contact Section */}
        <div className="bg-gradient-to-br from-leather-50 to-blue-50 rounded-3xl p-8 border border-leather-200/50">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-leather-900 mb-6">
                Visit Our <span className="text-atlantic-primary">Headquarters</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-atlantic-primary to-purple-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-leather-900">Address</div>
                    <div className="text-leather-600">Tatek Industrial Zone, Ethiopia</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent-gold to-orange-500 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-leather-900">Phone</div>
                    <div className="text-leather-600">+251 911 123 456</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-atlantic-secondary to-blue-500 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-leather-900">Email</div>
                    <div className="text-leather-600">info@atlanticleather.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-leather-900">Business Hours</div>
                    <div className="text-leather-600">Mon-Fri: 8:00 AM - 6:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 border border-leather-200/50">
                <h4 className="text-xl font-semibold text-leather-900 mb-4">Why Choose Atlantic Leather?</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-leather-700">18+ years of experience</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-leather-700">Premium quality materials</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-leather-700">Handcrafted excellence</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-leather-700">Global customer base</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-leather-700">Ethiopian heritage</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-atlantic-primary to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <span>Get in Touch</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
