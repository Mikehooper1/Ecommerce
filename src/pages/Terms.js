import React from 'react';

export default function Terms() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Terms & Conditions</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            <div className="lg:pr-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">1. Acceptance of Terms</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                By accessing and using VapeXIndia's website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">2. Use of Services</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Our services are intended for users who are of legal age to purchase vaping products in their jurisdiction. You are responsible for ensuring compliance with local laws and regulations.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">3. Product Information</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                We strive to provide accurate product information, but we do not guarantee the accuracy of all product descriptions, pricing, or availability. We reserve the right to modify product information at any time.
              </p>
            </div>

            <div className="lg:pl-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">4. Ordering and Payment</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                All orders are subject to acceptance and availability. We reserve the right to refuse service to anyone. Payment must be made in full before order processing.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">5. Shipping and Delivery</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Delivery times are estimates only. We are not responsible for delays beyond our control. Risk of loss and title for items purchased pass to you upon delivery.
              </p>

              <h2 className="mt-10 text-2xl font-bold tracking-tight text-gray-900">6. Returns and Refunds</h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Returns must be initiated within 14 days of delivery. Products must be unused and in original packaging. Refunds will be processed according to our return policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 