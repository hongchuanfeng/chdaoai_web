'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Profile() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Profile</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">U</span>
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold">User</h2>
            <p className="text-gray-600">user@example.com</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="user@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                defaultValue="User"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-xl font-semibold mb-4">Subscription</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium">Free Plan</p>
            <p className="text-sm text-gray-600">100 credits remaining</p>
            <button className="mt-2 text-primary-600 hover:text-primary-700 font-medium">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

