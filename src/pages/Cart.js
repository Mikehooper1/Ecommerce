import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some products to your cart to continue shopping.</p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white hover:bg-primary-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7">
            <ul className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {cart.map((item) => (
                <li key={item.id} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                    <div>
                      <div className="flex justify-between">
                        <h4 className="text-sm">
                          <Link to={`/product/${item.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                            {item.name}
                          </Link>
                        </h4>
                        <div className="text-right">
                          {item.salePrice ? (
                            <>
                              <p className="text-sm line-through text-gray-500">₹{item.price}</p>
                              <p className="text-sm font-medium text-gray-900">₹{item.salePrice}</p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">₹{item.price}</p>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      {item.selectedVariant && (
                        <p className="mt-1 text-sm text-gray-500">Variant: {item.selectedVariant}</p>
                      )}
                      {item.flavor && (
                        <p className="mt-1 text-sm text-gray-500">Flavor: {item.flavor}</p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-1 items-end justify-between">
                      <div className="flex items-center">
                        <label htmlFor={`quantity-${item.id}`} className="mr-2 text-sm text-gray-500">
                          Quantity
                        </label>
                        <select
                          id={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="rounded-md border-gray-300 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-base font-medium text-gray-900">Subtotal</div>
                <div className="text-base font-medium text-gray-900">
                  ₹{cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0)}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Shipping and taxes calculated at checkout.
              </p>
            </div>

            <div className="mt-6">
              <Link
                to="/checkout"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 