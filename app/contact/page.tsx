'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        setSubmitError(result.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-leather-50 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23941b1f" fill-opacity="0.1"><circle cx="30" cy="30" r="2"/></g></svg>')`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-leather-100 text-leather-700 px-6 py-3 rounded-full text-sm font-medium mb-6 slide-in-left leather-border">
              <span className="text-atlantic-primary font-bold text-lg">A</span>
              <span>Get in Touch</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-leather-900 mb-6 fade-in-up">
              Contact Us
            </h1>
            <p className="text-lg text-leather-600 max-w-3xl mx-auto leading-relaxed slide-in-right">
              Have questions about our products or need assistance? We're here to help. 
              Reach out to our team and we'll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="space-y-8 slide-in-left">
            <div>
              <h2 className="text-3xl font-bold text-leather-900 mb-4">Send us a Message</h2>
              <p className="text-leather-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
                <p className="text-green-600">Thank you for contacting us. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-leather-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-leather-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-leather-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent transition-all duration-300"
                    placeholder="What is this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-leather-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-leather-200 rounded-lg focus:ring-2 focus:ring-atlantic-primary focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {submitError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full atlantic-button flex items-center justify-center space-x-3 text-lg py-4 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8 slide-in-right">
            <div>
              <h2 className="text-3xl font-bold text-leather-900 mb-4">Get in Touch</h2>
              <p className="text-leather-600">
                We're here to help with any questions about our products, orders, or general inquiries.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="bg-leather-50 rounded-xl p-6 leather-border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-atlantic-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-leather-900">Visit Our Workshop</h3>
                    <p className="text-leather-600">Tatek Industrial Zone, Addis Ababa, Ethiopia</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-leather-50 rounded-xl p-6 leather-border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-leather-900">Call Us</h3>
                    <p className="text-leather-600">+251 911 123 456</p>
                    <p className="text-leather-600 text-sm">Mon-Fri 8AM-6PM EAT</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-leather-50 rounded-xl p-6 leather-border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-atlantic-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-leather-900">Email Us</h3>
                    <p className="text-leather-600">info@atlanticleather.com</p>
                    <p className="text-leather-600 text-sm">Response within 24 hours</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-leather-50 rounded-xl p-6 leather-border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-leather-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-leather-900">Business Hours</h3>
                    <p className="text-leather-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-leather-600">Saturday: 9:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Image */}
            <div className="relative">
              <div className="bg-leather-100 rounded-2xl p-8 leather-border">
                <div className="w-full h-64 bg-leather-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=256&fit=crop&crop=center"
                    alt="Contact Atlantic Leather"
                    width={400}
                    height={256}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent-gold rounded-full floating-element opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-atlantic-primary rounded-full floating-element opacity-40" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-leather-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-leather-50 rounded-xl p-6 leather-border slide-in-up" style={{animationDelay: '0.2s'}}>
              <h3 className="font-semibold text-leather-900 mb-3">How long does shipping take?</h3>
              <p className="text-leather-600">
                Standard shipping takes 5-7 business days within Ethiopia, and 10-15 business days internationally. 
                Express shipping is available for faster delivery.
              </p>
            </div>
            
            <div className="bg-leather-50 rounded-xl p-6 leather-border slide-in-up" style={{animationDelay: '0.4s'}}>
              <h3 className="font-semibold text-leather-900 mb-3">What is your return policy?</h3>
              <p className="text-leather-600">
                We offer a 30-day return window for unworn items in original condition. 
                Return shipping is the responsibility of the customer.
              </p>
            </div>
            
            <div className="bg-leather-50 rounded-xl p-6 leather-border slide-in-up" style={{animationDelay: '0.6s'}}>
              <h3 className="font-semibold text-leather-900 mb-3">Do you ship internationally?</h3>
              <p className="text-leather-600">
                Yes, we ship to over 25 countries worldwide. International shipping takes 10-15 business days 
                and includes customs documentation.
              </p>
            </div>
            
            <div className="bg-leather-50 rounded-xl p-6 leather-border slide-in-up" style={{animationDelay: '0.8s'}}>
              <h3 className="font-semibold text-leather-900 mb-3">How do I care for my leather products?</h3>
              <p className="text-leather-600">
                Clean with a soft, dry cloth and apply leather conditioner monthly. Avoid direct sunlight and 
                store in a cool, dry place. Detailed care instructions are included with each product.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
