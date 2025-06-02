import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { StarIcon } from '@heroicons/react/solid';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [customerReview, setCustomerReview] = useState({
    rating: 5,
    content: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const cities = [
    "Hyderabad", "Chennai", "Kerala", "Bangalore", "Mumbai", 
    "Delhi", "Kolkata", "Pune", "Ahmedabad", "Surat", 
    "Gurugram", "Noida", "Jaipur", "Chandigarh", "Indore", 
    "Lucknow", "Nagpur", "Visakhapatnam", "Vadodara", "Coimbatore"
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          // Set initial variant if available
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock > 0) {
      const productToAdd = selectedVariant 
        ? { 
            ...product, 
            ...selectedVariant,
            price: selectedVariant.price || product.price,
            stock: selectedVariant.stock !== null ? selectedVariant.stock : product.stock
          }
        : product;
      addToCart(productToAdd);
    }
  };

  const handleBuyNow = () => {
    if (product.stock > 0) {
      const productToAdd = selectedVariant 
        ? { 
            ...product, 
            ...selectedVariant,
            price: selectedVariant.price || product.price,
            stock: selectedVariant.stock !== null ? selectedVariant.stock : product.stock
          }
        : product;
      addToCart(productToAdd);
      navigate('/checkout');
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const getImages = () => {
    if (!product) return [];
    if (Array.isArray(product.images)) return product.images;
    return [product.imageUrl];
  };

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = {
        rating: customerReview.rating,
        content: customerReview.content,
        date: new Date().toISOString(),
        customerName: currentUser.displayName || 'Anonymous',
        customerId: currentUser.uid,
        isCustomerReview: true
      };

      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ratings: arrayUnion(newReview)
      });

      // Update local state
      setProduct(prev => ({
        ...prev,
        ratings: [...(prev.ratings || []), newReview]
      }));

      // Reset form
      setCustomerReview({
        rating: 5,
        content: ''
      });

      setError(null);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose prose-sm max-w-none">
            {product.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        );
      case 'specifications':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Category</h4>
                <p className="mt-1 text-gray-600">{product.category}</p>
              </div>
              {product.brand && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Brand</h4>
                  <p className="mt-1 text-gray-600">{product.brand}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Price</h4>
                <p className="mt-1 text-gray-600">
                  {product.salePrice ? (
                    <>
                      <span className="text-red-600">Rs.{product.salePrice}</span>
                      <span className="ml-2 text-gray-500 line-through">Rs.{product.price}</span>
                    </>
                  ) : (
                    `Rs.${product.price}`
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Stock Status</h4>
                <p className={`mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                </p>
              </div>
              {product.flavors && product.flavors.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <h4 className="font-medium text-gray-900">Available Flavors</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.flavors.map((flavor, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          flavor.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {flavor.name}
                        {!flavor.inStock && ' (Out of Stock)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.variants && product.variants.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <h4 className="font-medium text-gray-900">Available Variants</h4>
                  <div className="mt-2 space-y-2">
                    {product.variants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{variant.name || 'Unnamed Variant'}</span>
                        <div className="flex items-center space-x-4">
                          {variant.price && <span className="text-sm text-gray-600">Rs.{variant.price}</span>}
                          {variant.stock !== null && (
                            <span className={`text-xs ${
                              variant.stock > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{key}</h4>
                  <p className="mt-1 text-gray-600">{value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-6">
            {/* Customer Review Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="mt-1 flex items-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setCustomerReview(prev => ({ ...prev, rating }))}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`h-8 w-8 ${
                            rating <= customerReview.rating ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="review-content" className="block text-sm font-medium text-gray-700">
                    Your Review
                  </label>
                  <textarea
                    id="review-content"
                    rows={4}
                    required
                    value={customerReview.content}
                    onChange={(e) => setCustomerReview(prev => ({ ...prev, content: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Share your experience with this product..."
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={submittingReview || !customerReview.content.trim()}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      submittingReview || !customerReview.content.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    }`}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>

            {/* Reviews List */}
            {product.ratings && product.ratings.length > 0 ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={`h-6 w-6 ${
                          rating < Math.round(calculateAverageRating(product.ratings))
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {calculateAverageRating(product.ratings)} out of 5
                    </p>
                    <p className="text-sm text-gray-500">
                      Based on {product.ratings.length} {product.ratings.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  {product.ratings.map((rating, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-5 w-5 ${
                                  star < rating.rating ? 'text-yellow-400' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{rating.customerName}</span>
                          {rating.isCustomerReview && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Customer Review
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{rating.content}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        );
      case 'shipping':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Shipping Information</h4>
              <p className="mt-2 text-gray-600">
                {product.shippingInfo || 'Standard shipping available nationwide. Delivery within 3-5 business days.'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Return Policy</h4>
              <p className="mt-2 text-gray-600">
                {product.returnPolicy || '30-day return policy. Contact customer service for returns and exchanges.'}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const generateMetaTags = () => {
    if (!product) return null;

    const metaTags = [
      {
        name: 'description',
        content: `Buy ${product.name} online. Best vape products available in India.`
      },
      {
        name: 'keywords',
        content: `${product.name}, vape, e-cigarette, vaping, ${cities.join(', ')}`
      },
      {
        property: 'og:title',
        content: `${product.name} - Vape Shop India`
      },
      {
        property: 'og:description',
        content: `Buy ${product.name} online. Best vape products available in India.`
      },
      {
        property: 'og:type',
        content: 'product'
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: `${product.name} - Vape Shop India`
      },
      {
        name: 'twitter:description',
        content: `Buy ${product.name} online. Best vape products available in India.`
      }
    ];

    // Add image meta tags if available
    if (product.images?.[0]) {
      metaTags.push(
        {
          property: 'og:image',
          content: product.images[0]
        },
        {
          name: 'twitter:image',
          content: product.images[0]
        }
      );
    }

    // Add city-specific meta tags
    cities.forEach(city => {
      metaTags.push(
        {
          name: `${city.toLowerCase()}-vape-shop`,
          content: `${product.name} available in ${city}`
        },
        {
          name: `${city.toLowerCase()}-vape-store`,
          content: `Buy ${product.name} in ${city}`
        },
        {
          name: `${city.toLowerCase()}-vape-products`,
          content: `${product.name} - Best vape shop in ${city}`
        }
      );
    });

    return metaTags;
  };

  return (
    <div className="bg-white">
      <Helmet>
        <title>{product?.name ? `${product.name} - Vape Shop India` : 'Vape Shop India'}</title>
        {generateMetaTags()?.map((tag, index) => (
          <meta key={index} {...tag} />
        ))}
      </Helmet>
      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Product images */}
          <div className="flex flex-col">
            {/* Main image */}
            <div 
              className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={getImages()[selectedImage]}
                alt={product?.name}
                className={`h-full w-full object-contain transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={isZoomed ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                } : {}}
              />
              {isZoomed && (
                <div className="absolute inset-0 bg-white/50 pointer-events-none" />
              )}
            </div>

            {/* Thumbnail images */}
            {getImages().length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {getImages().map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? 'border-primary-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product?.name} - Image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image zoom hint */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Hover over image to zoom
            </div>
          </div>

          {/* Product details */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
            
            {/* Brand */}
            {product.brand && (
              <p className="mt-2 text-sm text-gray-500">Brand: {product.brand}</p>
            )}

            {/* Price */}
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <div className="flex items-center space-x-4">
                {product.salePrice ? (
                  <>
                    <p className="text-3xl tracking-tight text-gray-900">Rs.{product.salePrice}</p>
                    <p className="text-xl tracking-tight text-gray-500 line-through">Rs.{product.price}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <p className="text-3xl tracking-tight text-gray-900">Rs.{product.price}</p>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mt-4">
              <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
              </p>
            </div>

            {/* Flavor Selection */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Available Flavors</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {product.flavors.map((flavor, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant({ ...selectedVariant, flavor: flavor.name })}
                      disabled={!flavor.inStock}
                      className={`rounded-md border p-4 text-sm font-medium ${
                        selectedVariant?.flavor === flavor.name
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : flavor.inStock
                          ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {flavor.name}
                      {!flavor.inStock && <span className="ml-2 text-xs text-red-500">(Out of Stock)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Available Variants</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`rounded-md border p-4 text-sm font-medium ${
                        selectedVariant === variant
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : variant.stock > 0
                          ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium">{variant.name || 'Unnamed Variant'}</div>
                      {variant.price && <div className="mt-1 text-gray-500">Rs.{variant.price}</div>}
                      {variant.stock !== null && variant.stock === 0 && (
                        <span className="text-xs text-red-500">(Out of Stock)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex justify-between">
              <button 
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={`w-full rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {product.stock === 0 ? 'Sold Out' : 'Buy Now'}
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>

            {/* Tabbed content */}
            <div className="mt-10">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto whitespace-nowrap -mx-4 px-4" aria-label="Tabs">
                  {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                        ${activeTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }
                      `}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="mt-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 