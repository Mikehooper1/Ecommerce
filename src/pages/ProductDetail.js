import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

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
        ? { ...product, ...selectedVariant }
        : product;
      addToCart(productToAdd);
    }
  };

  const handleBuyNow = () => {
    if (product.stock > 0) {
      const productToAdd = selectedVariant 
        ? { ...product, ...selectedVariant }
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Flavor</h4>
                <p className="mt-1 text-gray-600">{product.flavor || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Stock Status</h4>
                <p className={`mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                </p>
              </div>
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">{key}</h4>
                  <p className="mt-1 text-gray-600">{value}</p>
                </div>
              ))}
            </div>
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

  return (
    <div className="bg-white">
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
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">Rs.{product.price}</p>
            </div>

            {/* Flavor Selection */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mt-4">
                <label htmlFor="flavor" className="block text-sm font-medium text-gray-700">
                  Select Flavor
                </label>
                <select
                  id="flavor"
                  name="flavor"
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  onChange={(e) => setSelectedVariant({ ...selectedVariant, flavor: e.target.value })}
                >
                  <option value="">Choose a flavor</option>
                  {product.flavors.map((flavor, index) => (
                    <option key={index} value={flavor}>
                      {flavor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Product variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Available Variants</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-md border p-4 text-sm font-medium ${
                        selectedVariant === variant
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {variant.name}
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
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {['description', 'specifications', 'shipping'].map((tab) => (
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