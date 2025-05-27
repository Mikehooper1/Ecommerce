import React from 'react';

export default function Privacy() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Privacy Policy</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            <div className="lg:pr-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">1. Information We Collect</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                We collect information that you provide directly to us, including your name, email address, shipping address, and payment information. We also collect information about your device and how you interact with our website.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">2. How We Use Your Information</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                We use your information to process orders, communicate with you about your orders, send marketing communications (with your consent), and improve our services.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">3. Information Sharing</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                We share your information with service providers who assist in operating our website and processing orders. We do not sell your personal information to third parties.
              </p>
            </div>

            <div className="lg:pl-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">4. Data Security</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">5. Your Rights</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                You have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications at any time.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">6. Cookies and Tracking</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                We use cookies and similar tracking technologies to improve your browsing experience and analyze website traffic. You can control cookie settings through your browser preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 