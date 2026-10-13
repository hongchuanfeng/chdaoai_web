'use client'

import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitting(false)
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Get in Touch</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Have questions, feedback, or need support? We&apos;d love to hear from you.
          Our team is here to help you get the most out of our AI tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Contact Methods */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-gray-600 mb-3">For general inquiries and support</p>
          <a
            href="mailto:support@chdaoai.com"
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            support@chdaoai.com
          </a>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Response Time</h3>
          <p className="text-gray-600 mb-3">We typically respond within</p>
          <p className="text-green-600 font-semibold text-2xl">24 hours</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Service</h3>
          <p className="text-gray-600 mb-3">Available worldwide in</p>
          <p className="text-purple-600 font-semibold text-2xl">10+ Languages</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Send us a Message</h2>
        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
            ✓ Thank you! Your message has been sent successfully. We&apos;ll get back to you within 24 hours.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
              required
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a topic</option>
              <option value="general">General Inquiry</option>
              <option value="support">Technical Support</option>
              <option value="billing">Billing Question</option>
              <option value="partnership">Partnership Opportunity</option>
              <option value="press">Press / Media</option>
              <option value="feedback">Product Feedback</option>
              <option value="bug">Report a Bug</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              required
              rows={6}
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us how we can help..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How do I get started?</h3>
            <p className="text-gray-600 text-sm">
              Simply create a free account to receive 100 credits. No credit card required. You can use these credits to try any of our AI tools.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Are my images secure?</h3>
            <p className="text-gray-600 text-sm">
              Yes. All images are processed securely and automatically deleted after processing. We never use your images to train AI models.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600 text-sm">
              We accept major credit cards, PayPal, and various regional payment methods through our payment processor Creem.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I get a refund?</h3>
            <p className="text-gray-600 text-sm">
              Yes. We offer a 7-day money-back guarantee for all subscription plans. See our refund policy for details.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Do you offer team/business plans?</h3>
            <p className="text-gray-600 text-sm">
              Yes. We offer custom plans for teams and businesses with volume discounts. Contact us for details.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Is there an API available?</h3>
            <p className="text-gray-600 text-sm">
              Yes. Our API allows you to integrate our AI tools into your own applications. Contact us for API access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
