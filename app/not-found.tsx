import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | ChDaoAI',
  description: 'The page you are looking for does not exist. Browse our tools, guides, and blog for help.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved. Let us help you find what you need.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          <Link
            href="/en"
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
          >
            <div className="text-2xl mb-1">🏠</div>
            <div className="font-semibold text-gray-900">Home</div>
            <div className="text-xs text-gray-500">Browse all tools</div>
          </Link>
          <Link
            href="/en/tools"
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
          >
            <div className="text-2xl mb-1">🛠️</div>
            <div className="font-semibold text-gray-900">All Tools</div>
            <div className="text-xs text-gray-500">80+ AI tools</div>
          </Link>
          <Link
            href="/en/guides"
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
          >
            <div className="text-2xl mb-1">📖</div>
            <div className="font-semibold text-gray-900">Guides</div>
            <div className="text-xs text-gray-500">Learn how to use</div>
          </Link>
          <Link
            href="/en/blog"
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="font-semibold text-gray-900">Blog</div>
            <div className="text-xs text-gray-500">Latest articles</div>
          </Link>
        </div>

        <Link
          href="/en"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
