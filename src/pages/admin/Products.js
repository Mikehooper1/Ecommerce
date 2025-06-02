import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PencilIcon, TrashIcon } from '@heroicons/react/solid';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
      
      // Extract unique categories and count products in each
      const uniqueCategories = [...new Set(productsList.map(product => product.category))];
      setCategories(['All', ...uniqueCategories]);
      
      // Calculate product counts for each category
      const counts = productsList.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});
      setCategoryCounts(counts);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products.filter(product => product.id !== productId));
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all products in your store including their name, price, and stock status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
            <Link
              to="/admin/products/bulk-upload"
              className="inline-flex items-center justify-center rounded-md border border-primary-600 bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              Bulk Upload
            </Link>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Product
            </Link>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${selectedCategory === category
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <span>{category}</span>
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedCategory === category
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {category === 'All' ? products.length : categoryCounts[category] || 0}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Products Grid */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              console.log('Product images:', product.images, 'Image URL:', product.imageUrl); // Debug log
              const imageSrc =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : product.imageUrl
                    ? product.imageUrl.trim()
                    : '/placeholder.png';
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      className="w-full h-48 object-cover"
                      src={imageSrc}
                      alt={product.name}
                      onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                      >
                        <PencilIcon className="h-5 w-5 text-primary-600" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex flex-col">
                        {product.salePrice ? (
                          <>
                            <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                            <span className="text-lg font-semibold text-red-600">₹{product.salePrice}</span>
                          </>
                        ) : (
                          <span className="text-lg font-semibold text-gray-900">₹{product.price}</span>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* No Products Message */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 