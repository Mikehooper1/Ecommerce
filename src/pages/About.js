import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">About NoruOasis </h1>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                Welcome to NoruOasis , your premier destination for high-quality vaping products and accessories. 
                We are committed to providing our customers with the best vaping experience through our carefully 
                curated selection of products.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Our mission is to provide vapers with premium quality products while ensuring safety, 
                reliability, and customer satisfaction. We believe in responsible vaping and are dedicated 
                to helping our customers make informed choices.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What We Offer</h2>
              <ul className="list-disc pl-5 text-gray-600 mb-4">
                <li>Premium Vape Devices and Mods</li>
                <li>High-Quality E-Liquids</li>
                <li>Vape Accessories and Parts</li>
                <li>Expert Customer Support</li>
                <li>Fast and Reliable Shipping</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Choose Us</h2>
              <ul className="list-disc pl-5 text-gray-600 mb-4">
                <li>Authentic Products</li>
                <li>Competitive Prices</li>
                <li>Secure Shopping</li>
                <li>24/7 Customer Support</li>
                <li>Fast Delivery</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment</h2>
              <p className="text-gray-600 mb-4">
                At NoruOasis , we are committed to providing our customers with the best shopping experience. 
                We carefully select our products to ensure they meet the highest standards of quality and safety. 
                Our team of experts is always ready to assist you with any questions or concerns you may have.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
