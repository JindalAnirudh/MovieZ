import React from 'react'
import { Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Hero Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Your privacy is important to us. This policy explains how MovieZ collects, uses, and protects your personal information.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16 bg-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Privacy at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700 text-center">
              <Eye className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Transparency</h3>
              <p className="text-gray-300 text-sm">We're clear about what data we collect and why</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700 text-center">
              <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Security</h3>
              <p className="text-gray-300 text-sm">Your data is protected with industry-standard encryption</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-6 border border-gray-700 text-center">
              <UserCheck className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Control</h3>
              <p className="text-gray-300 text-sm">You have full control over your personal information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Information We Collect</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-primary">Personal Information</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Name, email address, and phone number when you create an account</li>
                  <li>• Payment information for ticket purchases (processed securely through our payment partners)</li>
                  <li>• Profile preferences and settings</li>
                  <li>• Communication preferences</li>
                </ul>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-primary">Usage Information</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Movies you view, book, or show interest in</li>
                  <li>• Search queries and browsing behavior</li>
                  <li>• Device information and IP address</li>
                  <li>• Location data (with your permission) to show nearby theaters</li>
                </ul>
              </div>

              <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-primary">Cookies and Tracking</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Essential cookies for website functionality</li>
                  <li>• Analytics cookies to improve our service</li>
                  <li>• Preference cookies to remember your settings</li>
                  <li>• Marketing cookies (with your consent)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">How We Use Your Information</h2>
            </div>
            <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
              <ul className="text-gray-300 space-y-3">
                <li>• <strong className="text-white">Service Delivery:</strong> Process bookings, send confirmations, and provide customer support</li>
                <li>• <strong className="text-white">Personalization:</strong> Recommend movies and theaters based on your preferences</li>
                <li>• <strong className="text-white">Communication:</strong> Send important updates, promotional offers, and service notifications</li>
                <li>• <strong className="text-white">Analytics:</strong> Understand usage patterns to improve our platform</li>
                <li>• <strong className="text-white">Security:</strong> Detect and prevent fraud, abuse, and security threats</li>
                <li>• <strong className="text-white">Legal Compliance:</strong> Meet legal obligations and enforce our terms of service</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Information Sharing</h2>
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-primary">We Share Information With:</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• <strong className="text-white">Theater Partners:</strong> To process your bookings and reservations</li>
                  <li>• <strong className="text-white">Payment Processors:</strong> To handle secure payment transactions</li>
                  <li>• <strong className="text-white">Service Providers:</strong> Third-party services that help us operate our platform</li>
                  <li>• <strong className="text-white">Legal Authorities:</strong> When required by law or to protect our rights</li>
                </ul>
              </div>
              
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-red-400">We Never:</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Sell your personal information to third parties</li>
                  <li>• Share your data for marketing without your consent</li>
                  <li>• Use your information for purposes other than stated in this policy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Data Security</h2>
            <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong className="text-white">Encryption:</strong> All data transmission is encrypted using SSL/TLS</li>
                <li>• <strong className="text-white">Secure Storage:</strong> Personal data is stored in secure, access-controlled servers</li>
                <li>• <strong className="text-white">Regular Audits:</strong> We conduct regular security assessments and updates</li>
                <li>• <strong className="text-white">Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                <li>• <strong className="text-white">Incident Response:</strong> Procedures in place to respond to any security breaches</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Your Privacy Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-primary">Access & Control</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• View and update your personal information</li>
                  <li>• Download a copy of your data</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Opt-out of marketing communications</li>
                </ul>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-primary">Privacy Settings</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Manage cookie preferences</li>
                  <li>• Control location sharing</li>
                  <li>• Adjust notification settings</li>
                  <li>• Set data retention preferences</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Data Retention</h2>
            <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                We retain your personal information only as long as necessary for the purposes outlined in this policy:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong className="text-white">Account Data:</strong> Retained while your account is active</li>
                <li>• <strong className="text-white">Transaction Records:</strong> Kept for 7 years for legal and tax purposes</li>
                <li>• <strong className="text-white">Marketing Data:</strong> Deleted when you unsubscribe or after 2 years of inactivity</li>
                <li>• <strong className="text-white">Analytics Data:</strong> Anonymized and aggregated data may be retained longer</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Children's Privacy</h2>
            <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                MovieZ is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If we become aware that we have collected personal information 
                from a child under 13, we will take steps to delete such information promptly.
              </p>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Updates to This Policy</h2>
            <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time to reflect changes in our practices or 
                applicable laws. We will notify you of any material changes by posting the updated policy on 
                our website and updating the "Last Updated" date. We encourage you to review this policy 
                periodically to stay informed about how we protect your privacy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p>• <strong className="text-white">Email:</strong> privacy@moviez.com</p>
                <p>• <strong className="text-white">Phone:</strong> +1-234-567-890</p>
                <p>• <strong className="text-white">Address:</strong> MovieZ Privacy Team, 123 Entertainment St, Digital City, DC 12345</p>
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => {
                    window.location.href = '/contact'
                    window.scrollTo(0, 0)
                  }}
                  className="bg-primary hover:bg-primary-dull text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Contact Privacy Team
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
