import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FilterIcon, ChevronDownIcon, ChevronUpIcon, StarIcon } from '@heroicons/react/solid';
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

const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / ratings.length).toFixed(1);
};

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
        // First, let's log all products to see their structure
        const allProductsSnapshot = await getDocs(collection(db, 'products'));
        const allProducts = allProductsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Log complete product data to understand structure
        console.log('Complete product data:', allProducts);

        // Try to find products that are marked as most selling
        const mostSellingProducts = allProducts.filter(product => {
          console.log('Checking product:', product.name, 'Data:', product);
          return (
            product.isMostSelling === true || 
            product.category === 'MOST SELLING' ||
            product.category === 'Most Selling' ||
            product.category === 'most selling' ||
            product.mostSelling === true ||
            product.most_selling === true
          );
        });

        console.log('Most selling products found:', mostSellingProducts);
        
        setProducts(mostSellingProducts);
        setLoading(false);
        return;
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

      // Debug log
      console.log('Selected category:', selectedCategory);
      console.log('Fetched products:', productsList);

      // Extract unique brands
      const uniqueBrands = [...new Set(productsList.map(product => product.brand))].filter(Boolean);
      setBrands(uniqueBrands);

      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
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
      // First sort by stock status (in stock products first)
      if (a.stock > 0 && b.stock === 0) return -1;
      if (a.stock === 0 && b.stock > 0) return 1;

      // Then apply the selected sorting criteria
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
    addToCart(product);
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
            <div className="grid grid-cols-2 gap-4 items-stretch sm:grid-cols-2 md:grid-cols-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative h-full flex flex-col">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : product.imageUrl
                              ? product.imageUrl
                              : '/placeholder-image.png'
                        }
                        alt={product.name}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div className="flex-1 min-w-0 max-w-full">
                        <h3 className="text-sm text-gray-700">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 truncate block w-full">{product.description}</p>
                        <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                        {product.ratings && product.ratings.length > 0 && (
                          <div className="mt-1 flex items-center">
                            <div className="flex items-center">
                              {[0, 1, 2, 3, 4].map((rating) => (
                                <StarIcon
                                  key={rating}
                                  className={`h-4 w-4 ${
                                    rating < Math.round(calculateAverageRating(product.ratings))
                                      ? 'text-yellow-400'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="ml-2 text-sm text-gray-500">
                              ({product.ratings.length} {product.ratings.length === 1 ? 'review' : 'reviews'})
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {product.salePrice ? (
                          <div>
                            <p className="text-sm font-medium text-gray-500 line-through">
                              Rs.{selectedVariants[product.id]?.price || product.price}
                            </p>
                            <p className="text-sm font-medium text-red-600">
                              Rs.{selectedVariants[product.id]?.salePrice || product.salePrice}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">
                            Rs.{selectedVariants[product.id]?.price || product.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                      className={`mt-4 w-full rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                        product.stock === 0
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary-600 hover:bg-primary-500'
                      }`}
                    >
                      {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 