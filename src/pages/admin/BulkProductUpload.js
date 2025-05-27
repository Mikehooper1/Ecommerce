import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import * as XLSX from 'xlsx';

const categories = [
  { id: 'podkits', name: 'PODKITS' },
  { id: 'disposable', name: 'DISPOSABLE' },
  { id: 'nic-salts', name: 'NIC & SALTS' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'most-selling', name: 'MOST SELLING' },
];

// Sample data for the template
const sampleData = [
  {
    name: 'Sample Pod Kit',
    description: 'A high-quality pod kit with adjustable airflow',
    price: 1999,
    stock: 50,
    category: 'podkits',
    brand: 'VapeX',
    flavors: 'Mango, Strawberry, Blueberry',
    variants: JSON.stringify([
      { name: 'Black', price: 1999, stock: 25 },
      { name: 'Silver', price: 1999, stock: 25 }
    ]),
    featured: 'true',
    imageUrl: 'https://example.com/image1.jpg'
  },
  {
    name: 'Disposable Vape',
    description: 'Convenient disposable vape with 5000 puffs',
    price: 999,
    stock: 100,
    category: 'disposable',
    brand: 'VapeX',
    flavors: 'Mint, Watermelon, Ice Cream',
    variants: '',
    featured: 'false',
    imageUrl: 'https://example.com/image2.jpg'
  }
];

export default function BulkProductUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate data structure
        const requiredFields = ['name', 'description', 'price', 'stock', 'category', 'brand'];
        const isValid = data.every(row => 
          requiredFields.every(field => row[field] !== undefined && row[field] !== '')
        );

        if (!isValid) {
          setError('Invalid data structure. Please ensure all required fields are present.');
          setPreview([]);
          return;
        }

        setPreview(data.slice(0, 5)); // Show first 5 rows as preview
        setError(null);
      } catch (err) {
        setError('Error reading file. Please ensure it\'s a valid Excel/CSV file.');
        setPreview([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const processAndUploadProducts = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const products = XLSX.utils.sheet_to_json(worksheet);

          const totalProducts = products.length;
          let uploadedCount = 0;

          for (const product of products) {
            const selectedCategory = categories.find(cat => cat.id === product.category);
            if (!selectedCategory) {
              throw new Error(`Invalid category for product: ${product.name}`);
            }

            const productData = {
              name: product.name,
              description: product.description,
              price: Number(product.price),
              stock: Number(product.stock),
              category: selectedCategory.name,
              brand: product.brand.trim(),
              flavors: product.flavors ? product.flavors.split(',').map(f => f.trim()) : [],
              variants: product.variants ? JSON.parse(product.variants) : [],
              featured: product.featured === 'true',
              imageUrl: product.imageUrl || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await addDoc(collection(db, 'products'), productData);
            uploadedCount++;
            setUploadProgress((uploadedCount / totalProducts) * 100);
          }

          navigate('/admin/products');
        } catch (err) {
          setError(`Error processing file: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError('Error uploading products');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert sample data to worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "product_upload_template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Bulk Product Upload
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Upload an Excel or CSV file containing product data.
              </p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Required Fields:</h4>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>name</li>
                  <li>description</li>
                  <li>price</li>
                  <li>stock</li>
                  <li>category (must match category IDs)</li>
                  <li>brand</li>
                </ul>
                <h4 className="mt-4 text-sm font-medium text-gray-700">Optional Fields:</h4>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  <li>flavors (comma-separated)</li>
                  <li>variants (JSON string)</li>
                  <li>featured (true/false)</li>
                  <li>imageUrl</li>
                </ul>
                <div className="mt-4">
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500">
                        Excel or CSV file
                      </p>
                    </div>
                  </div>
                </div>

                {preview.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (First 5 rows):</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(preview[0]).map((header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {preview.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td
                                  key={i}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                            Upload Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-primary-600">
                            {Math.round(uploadProgress)}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
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
                  type="button"
                  onClick={processAndUploadProducts}
                  disabled={!file || loading}
                  className="btn-primary"
                >
                  {loading ? 'Uploading...' : 'Upload Products'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 