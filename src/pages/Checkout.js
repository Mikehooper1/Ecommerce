import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Starting order creation process...');
      console.log('Cart items:', cart);
      console.log('Form data:', formData);
      
      // Create order in Firestore
      const orderData = {
        user: {
          id: currentUser?.uid || 'guest',
          name: formData.fullName || 'Guest',
          email: formData.email || '',
          phone: formData.phone || '',
          isGuest: !currentUser,
        },
        items: cart.map(item => ({
          id: item.id || '',
          name: item.name || 'Unknown Product',
          price: Number(item.price) || 0,
          salePrice: Number(item.salePrice) || null,
          quantity: Number(item.quantity) || 1,
          imageUrl: item.imageUrl || item.image || '',
          flavor: item.flavor || null,
          variant: item.selectedVariant || null,
        })),
        total: Number(cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0)) || 0,
        status: 'Pending',
        shippingAddress: {
          street: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          pincode: formData.zipCode || '',
        },
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      console.log('Order data to be saved:', orderData);
      
      const ordersRef = collection(db, 'orders');
      console.log('Orders collection reference:', ordersRef);
      
      const docRef = await addDoc(ordersRef, orderData);
      console.log('Order created successfully with ID:', docRef.id);
      
      // Clear the cart after successful order
      clearCart();
      
      // Redirect to success page
      navigate('/order-success');
    } catch (error) {
      console.error('Detailed error creating order:', {
        error,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setError(`Failed to process order: ${error.message}`);
    }
    setIsProcessing(false);
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some products to your cart to continue shopping.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-6 inline-block rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white hover:bg-primary-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>
                {error && (
                  <div className="mt-2 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="mt-8 lg:col-span-5 lg:mt-0">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

              <div className="mt-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={item.imageUrl || item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-md object-cover object-center"
                      />
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">Qty {item.quantity}</p>
                        {item.selectedVariant && (
                          <p className="text-sm text-gray-500">Variant: {item.selectedVariant}</p>
                        )}
                        {item.flavor && (
                          <p className="text-sm text-gray-500">Flavor: {item.flavor}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.salePrice ? (
                        <>
                          <p className="text-sm line-through text-gray-500">₹{item.price * item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">₹{item.salePrice * item.quantity}</p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">₹{item.price * item.quantity}</p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <div className="text-base font-medium text-gray-900">Subtotal</div>
                  <div className="text-base font-medium text-gray-900">
                    ₹{cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0)}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 