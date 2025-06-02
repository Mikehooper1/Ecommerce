import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';

const categories = [
  { id: 'podkits', name: 'PODKITS' },
  { id: 'disposable', name: 'DISPOSABLE' },
  { id: 'nic-salts', name: 'NIC & SALTS' },
  { id: 'accessories', name: 'Accessories' },
];

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    category: '',
    brand: '',
    imageUrl: '',
    images: [],
    featured: false,
    mostSelling: false,
    variants: [],
    flavors: [],
    ratings: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newVariant, setNewVariant] = useState({
    name: '',
    price: '',
    stock: '',
  });
  const [newFlavor, setNewFlavor] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const categoryId = categories.find(cat => cat.name === data.category)?.id || '';
        
        setFormData({
          ...data,
          category: categoryId,
          flavors: data.flavors || [],
          variants: data.variants || [],
          ratings: data.ratings || [],
        });
      }
    } catch (err) {
      setError('Failed to fetch product details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVariant = () => {
    // Allow adding variant even if all fields are empty
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          ...newVariant,
          name: newVariant.name || 'Unnamed Variant',
          price: newVariant.price ? Number(newVariant.price) : null,
          stock: newVariant.stock ? Number(newVariant.stock) : null,
        },
      ],
    }));

    setNewVariant({
      name: '',
      price: '',
      stock: '',
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return formData.images;

    const uploadPromises = imageFiles.map(async (file) => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    });

    const urls = await Promise.all(uploadPromises);
    return [...formData.images, ...urls];
  };

  const handleAddFlavor = () => {
    if (!newFlavor.trim()) {
      setError('Please enter a flavor name');
      return;
    }

    if (formData.flavors.some(f => f.name === newFlavor.trim())) {
      setError('This flavor already exists');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      flavors: [...prev.flavors, {
        name: newFlavor.trim(),
        inStock: true
      }],
    }));

    setNewFlavor('');
  };

  const handleFlavorStockChange = (flavorName, inStock) => {
    setFormData(prev => ({
      ...prev,
      flavors: prev.flavors.map(flavor => 
        flavor.name === flavorName ? { ...flavor, inStock } : flavor
      )
    }));
  };

  const handleRemoveFlavor = (flavorToRemove) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.filter((flavor) => flavor.name !== flavorToRemove),
    }));
  };

  const handleAddRating = () => {
    const newRating = {
      rating: 5,
      content: '',
      date: new Date().toISOString(),
      customerName: 'Admin',
      isCustomerReview: false
    };
    setFormData(prev => ({
      ...prev,
      ratings: [...prev.ratings, newRating]
    }));
  };

  const handleRemoveRating = (index) => {
    setFormData(prev => ({
      ...prev,
      ratings: prev.ratings.filter((_, i) => i !== index)
    }));
  };

  const handleRatingChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: prev.ratings.map((rating, i) => 
        i === index ? { ...rating, [field]: value } : rating
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let images = formData.images;
      if (imageFiles.length > 0) {
        images = await uploadImages();
      }

      const selectedCategory = categories.find(cat => cat.id === formData.category);
      if (!selectedCategory) {
        throw new Error('Invalid category selected');
      }

      const productData = {
        ...formData,
        images,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stock: Number(formData.stock),
        category: selectedCategory.name,
        brand: formData.brand.trim(),
        flavors: formData.flavors || [],
        variants: formData.variants || [],
        ratings: formData.ratings || [],
        updatedAt: new Date().toISOString(),
      };

      console.log('Saving product with data:', productData);

      if (isEditing) {
        await setDoc(doc(db, 'products', id), productData);
      } else {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          ...productData,
          createdAt: new Date().toISOString(),
        });
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {isEditing
                  ? 'Update the product details below.'
                  : 'Fill in the product details below to add a new product.'}
              </p>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Base Price (Rs.)
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                        Sale Price (Rs.)
                      </label>
                      <input
                        type="number"
                        name="salePrice"
                        id="salePrice"
                        min="0"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={handleChange}
                        className="mt-1 input-field"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 input-field"
                    />
                  </div>

                  

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                      Base Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      className="mt-1 input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      id="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 input-field"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      id="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Enter product brand (optional)"
                      className="mt-1 input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Flavors
                    </label>
                    <div className="mt-2 space-y-4">
                      {formData.flavors.map((flavor, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{flavor.name}</p>
                            <div className="mt-2">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  checked={flavor.inStock}
                                  onChange={(e) => handleFlavorStockChange(flavor.name, e.target.checked)}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                />
                                <span className="ml-2 text-sm text-gray-600">In Stock</span>
                              </label>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlavor(flavor.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={newFlavor}
                          onChange={(e) => setNewFlavor(e.target.value)}
                          placeholder="Enter flavor name"
                          className="flex-1 input-field"
                        />
                        <button
                          type="button"
                          onClick={handleAddFlavor}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Add Flavor
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Variants
                    </label>
                    <div className="mt-2 space-y-4">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-gray-500">Price: Rs.{variant.price}</p>
                            <p className="text-sm text-gray-500">Stock: {variant.stock}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            name="name"
                            placeholder="Variant Name (Optional)"
                            value={newVariant.name}
                            onChange={handleVariantChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            name="price"
                            placeholder="Price (Optional)"
                            value={newVariant.price}
                            onChange={handleVariantChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            name="stock"
                            placeholder="Stock (Optional)"
                            value={newVariant.stock}
                            onChange={handleVariantChange}
                            className="input-field"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add Variant
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Images</label>
                    <div className="mt-1">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Product ${index + 1}`}
                              className="h-32 w-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="input-field"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        You can select multiple images. First image will be the main product image.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Feature this product on homepage
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="mostSelling"
                      id="mostSelling"
                      checked={formData.mostSelling}
                      onChange={(e) => setFormData(prev => ({ ...prev, mostSelling: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <label htmlFor="mostSelling" className="ml-2 block text-sm text-gray-900">
                      Mark as Most Selling Product
                    </label>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Ratings & Reviews
                    </label>
                    <div className="mt-2 space-y-4">
                      {formData.ratings.map((rating, index) => (
                        <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <select
                                value={rating.rating}
                                onChange={(e) => handleRatingChange(index, 'rating', Number(e.target.value))}
                                className="rounded-md border-gray-300 text-sm"
                              >
                                {[1, 2, 3, 4, 5].map(num => (
                                  <option key={num} value={num}>{num} Stars</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={rating.customerName}
                                onChange={(e) => handleRatingChange(index, 'customerName', e.target.value)}
                                placeholder="Customer Name"
                                className="input-field text-sm"
                              />
                              <input
                                type="date"
                                value={rating.date.split('T')[0]}
                                onChange={(e) => handleRatingChange(index, 'date', new Date(e.target.value).toISOString())}
                                className="input-field text-sm"
                              />
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                rating.isCustomerReview 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {rating.isCustomerReview ? 'Customer Review' : 'Admin Review'}
                              </span>
                            </div>
                            <textarea
                              value={rating.content}
                              onChange={(e) => handleRatingChange(index, 'content', e.target.value)}
                              placeholder="Rating content"
                              className="mt-2 input-field text-sm w-full"
                              rows={2}
                            />
                            {rating.isCustomerReview && (
                              <div className="mt-2 text-xs text-gray-500">
                                Customer ID: {rating.customerId || 'N/A'}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRating(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddRating}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add Admin Review
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/products')}
                    className="btn-secondary mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 