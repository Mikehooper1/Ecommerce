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
  { id: 'most-selling', name: 'MOST SELLING' },
];

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    imageUrl: '',
    featured: false,
    variants: [],
    flavors: [],
  });
  const [imageFile, setImageFile] = useState(null);
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
        setFormData({
          ...data,
          flavors: data.flavors || [],
          variants: data.variants || [],
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
    if (!newVariant.name || !newVariant.price || !newVariant.stock) {
      setError('Please fill in all variant fields');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          ...newVariant,
          price: Number(newVariant.price),
          stock: Number(newVariant.stock),
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
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;

    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const handleAddFlavor = () => {
    if (!newFlavor.trim()) {
      setError('Please enter a flavor name');
      return;
    }

    if (formData.flavors.includes(newFlavor.trim())) {
      setError('This flavor already exists');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      flavors: [...prev.flavors, newFlavor.trim()],
    }));

    setNewFlavor('');
  };

  const handleRemoveFlavor = (flavorToRemove) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.filter((flavor) => flavor !== flavorToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const selectedCategory = categories.find(cat => cat.id === formData.category);
      if (!selectedCategory) {
        throw new Error('Invalid category selected');
      }

      const productData = {
        ...formData,
        imageUrl,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: selectedCategory.name,
        brand: formData.brand.trim(),
        flavors: formData.flavors || [],
        variants: formData.variants || [],
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Base Price (₹)
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
                      required
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Enter product brand"
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
                            <p className="font-medium">{flavor}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFlavor(flavor)}
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
                            <p className="text-sm text-gray-500">Price: ₹{variant.price}</p>
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
                            placeholder="Variant Name"
                            value={newVariant.name}
                            onChange={handleVariantChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={newVariant.price}
                            onChange={handleVariantChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            name="stock"
                            placeholder="Stock"
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
                    <label className="block text-sm font-medium text-gray-700">Product Image</label>
                    <div className="mt-1 flex items-center">
                      {formData.imageUrl && (
                        <img
                          src={formData.imageUrl}
                          alt="Product"
                          className="h-32 w-32 object-cover rounded-lg"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="ml-5 input-field"
                      />
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