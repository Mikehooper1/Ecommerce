import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FilterIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'podkits', name: 'PODKITS' },
  { id: 'disposable', name: 'DISPOSABLE' },
  { id: 'nic-salts', name: 'NIC & SALTS' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'most-selling', name: 'MOST SELLING' }
];

const sortOptions = [
  { name: 'Most Popular', value: 'popular' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
  { name: 'Newest', value: 'newest' },
];

export default function Products() {
  const location = useLocation();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [brands, setBrands] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const price = searchParams.get('price');

    if (category) setSelectedCategory(category);
    if (brand) setSelectedBrand(brand);
    if (price) {
      const [min, max] = price.split('-').map(Number);
      setPriceRange([min, max]);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      let q = collection(db, 'products');
      
      if (selectedCategory === 'most-selling') {
        q = query(q, where('category', '==', 'MOST SELLING'));
      } else if (selectedCategory !== 'all') {
        const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
        if (categoryName) {
          q = query(q, where('category', '==', categoryName));
        }
      }

      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Extract unique brands
      const uniqueBrands = [...new Set(productsList.map(product => product.brand))].filter(Boolean);
      setBrands(uniqueBrands);

      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter products based on brand and price range
    let filtered = products.filter((product) => {
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesBrand && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, sortBy, priceRange, selectedBrand]);

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variant
    }));
  };

  const handleAddToCart = (product) => {
    const selectedVariant = selectedVariants[product.id];
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      alert('Please select a flavor first');
      return;
    }
    
    const productToAdd = selectedVariant 
      ? { ...product, price: selectedVariant.price, stock: selectedVariant.stock, selectedVariant: selectedVariant.name }
      : product;
    
    addToCart(productToAdd);
  };

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
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-200 pb-4 sm:pb-6 pt-4 sm:pt-8">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900">Products</h1>
          <div className="flex items-center w-full sm:w-auto gap-2 mt-2 sm:mt-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 sm:ml-2 lg:hidden"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="sr-only">Filters</span>
              <FilterIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters */}
          <div className={`lg:block ${isFilterOpen ? 'block' : 'hidden'}`}>
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                <div className="mt-4 space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        id={category.id}
                        name="category"
                        type="radio"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                      <label htmlFor={category.id} className="ml-3 text-sm text-gray-600">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Brands</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="all-brands"
                      name="brand"
                      type="radio"
                      checked={selectedBrand === 'all'}
                      onChange={() => setSelectedBrand('all')}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <label htmlFor="all-brands" className="ml-3 text-sm text-gray-600">
                      All Brands
                    </label>
                  </div>
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <input
                        id={brand}
                        name="brand"
                        type="radio"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(brand)}
                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                      <label htmlFor={brand} className="ml-3 text-sm text-gray-600">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rs.{priceRange[0]}</span>
                    <span className="text-sm text-gray-600">Rs.{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="flex-1 min-w-0 max-w-full">
                      <h3 className="text-sm text-gray-700">
                        <Link to={`/product/${product.id}`}>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 truncate block w-full">{product.description}</p>
                      <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                      Rs.{selectedVariants[product.id]?.price || product.price}
                    </p>
                  </div>
                  
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-2">
                      <select
                        value={selectedVariants[product.id]?.name || ''}
                        onChange={(e) => {
                          const selectedVariant = product.variants.find(v => v.name === e.target.value);
                          handleVariantChange(product.id, selectedVariant);
                        }}
                        className="w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600"
                      >
                        <option value="">Select Flavor</option>
                        {product.variants.map((variant, index) => (
                          <option key={index} value={variant.name}>
                            {variant.name} - Rs.{variant.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || (product.variants?.length > 0 && !selectedVariants[product.id])}
                    className={`mt-4 w-full rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                      product.stock === 0 || (product.variants?.length > 0 && !selectedVariants[product.id])
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary-600 hover:bg-primary-500'
                    }`}
                  >
                    {product.stock === 0 
                      ? 'Sold Out' 
                      : product.variants?.length > 0 && !selectedVariants[product.id]
                        ? 'Select Flavor'
                        : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 