import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';

export default function Reviews() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'customer', 'admin'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(product => product.ratings && product.ratings.length > 0);
      
      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleEditReview = (productId, reviewIndex) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setEditingReview({
        productId,
        reviewIndex,
        ...product.ratings[reviewIndex]
      });
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      const product = products.find(p => p.id === editingReview.productId);
      if (!product) return;

      const updatedRatings = [...product.ratings];
      updatedRatings[editingReview.reviewIndex] = {
        rating: editingReview.rating,
        content: editingReview.content,
        date: editingReview.date,
        customerName: editingReview.customerName,
        customerId: editingReview.customerId,
        isCustomerReview: editingReview.isCustomerReview
      };

      await updateDoc(doc(db, 'products', editingReview.productId), {
        ratings: updatedRatings
      });

      // Update local state
      setProducts(products.map(p => 
        p.id === editingReview.productId 
          ? { ...p, ratings: updatedRatings }
          : p
      ));

      setEditingReview(null);
      setSelectedProduct(null);
    } catch (err) {
      setError('Failed to update review');
    }
  };

  const handleDeleteReview = async (productId, reviewIndex) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const updatedRatings = product.ratings.filter((_, index) => index !== reviewIndex);

      await updateDoc(doc(db, 'products', productId), {
        ratings: updatedRatings
      });

      // Update local state
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, ratings: updatedRatings }
          : p
      ));
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.ratings.some(review => 
      filter === 'customer' ? review.isCustomerReview : !review.isCustomerReview
    );
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Product Reviews</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage all product reviews from customers and admin.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm"
            >
              <option value="all">All Reviews</option>
              <option value="customer">Customer Reviews</option>
              <option value="admin">Admin Reviews</option>
            </select>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{product.category}</p>
              </div>
              <div className="divide-y divide-gray-200">
                {product.ratings
                  .filter(review => 
                    filter === 'all' || 
                    (filter === 'customer' && review.isCustomerReview) ||
                    (filter === 'admin' && !review.isCustomerReview)
                  )
                  .map((review, index) => (
                    <div key={index} className="p-4">
                      {editingReview && 
                       editingReview.productId === product.id && 
                       editingReview.reviewIndex === index ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <select
                              value={editingReview.rating}
                              onChange={(e) => setEditingReview(prev => ({
                                ...prev,
                                rating: Number(e.target.value)
                              }))}
                              className="rounded-md border-gray-300 text-sm"
                            >
                              {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num} Stars</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={editingReview.customerName}
                              onChange={(e) => setEditingReview(prev => ({
                                ...prev,
                                customerName: e.target.value
                              }))}
                              className="input-field text-sm"
                              placeholder="Customer Name"
                            />
                            <input
                              type="date"
                              value={editingReview.date.split('T')[0]}
                              onChange={(e) => setEditingReview(prev => ({
                                ...prev,
                                date: new Date(e.target.value).toISOString()
                              }))}
                              className="input-field text-sm"
                            />
                          </div>
                          <textarea
                            value={editingReview.content}
                            onChange={(e) => setEditingReview(prev => ({
                              ...prev,
                              content: e.target.value
                            }))}
                            className="input-field text-sm w-full"
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingReview(null)}
                              className="btn-secondary text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUpdateReview}
                              className="btn-primary text-sm"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[0, 1, 2, 3, 4].map((star) => (
                                  <StarIcon
                                    key={star}
                                    className={`h-5 w-5 ${
                                      star < review.rating ? 'text-yellow-400' : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {review.customerName}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                review.isCustomerReview 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {review.isCustomerReview ? 'Customer Review' : 'Admin Review'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{review.content}</p>
                            {review.isCustomerReview && review.customerId && (
                              <p className="mt-1 text-xs text-gray-500">
                                Customer ID: {review.customerId}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditReview(product.id, index)}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(product.id, index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No reviews found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 