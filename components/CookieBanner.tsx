'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has already responded
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Small delay to not interrupt page load
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
  }

  const reject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 md:p-6">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0">🍪</span>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">
            We value your privacy
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
            Read our <a href="/en/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</a> and <a href="/en/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> to learn more.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
        >
          Accept All
        </button>
        <button
          onClick={reject}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
