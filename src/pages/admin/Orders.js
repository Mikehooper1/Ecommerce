import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Firestore instance:', db);
      console.log('Attempting to fetch orders from collection: orders');
      
      // Get orders collection
      const ordersRef = collection(db, 'orders');
      console.log('Orders collection reference:', ordersRef);
      
      const q = query(ordersRef, orderBy('date', 'desc'));
      console.log('Query created:', q);
      
      // Get the documents
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot received:', querySnapshot);
      console.log('Is query snapshot empty?', querySnapshot.empty);
      console.log('Number of documents:', querySnapshot.docs.length);
      
      if (querySnapshot.empty) {
        console.log('No orders found in the database');
        setOrders([]);
        setLoading(false);
        return;
      }

      // Process the orders
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing document:', doc.id, data);
        return {
          id: doc.id,
          date: data.date || new Date().toISOString(),
          status: data.status || 'Pending',
          total: data.total || 0,
          user: data.user || { name: 'N/A', email: 'N/A', phone: 'N/A' },
          shippingAddress: data.shippingAddress || { street: 'N/A', city: 'N/A', state: 'N/A', pincode: 'N/A' },
          items: data.items || []
        };
      });

      console.log('Fetched orders:', ordersData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const orderDate = new Date(order.date).toLocaleDateString();
    
    const invoiceContent = `
      <html>
        <head>
          <title>Invoice #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice</h1>
            <p>Order #${order.id}</p>
            <p>Date: ${orderDate}</p>
          </div>
          
          <div class="details">
            <h3>Customer Details</h3>
            <p>Name: ${order.user.name}</p>
            <p>Email: ${order.user.email}</p>
            <p>Phone: ${order.user.phone}</p>
          </div>
          
          <div class="details">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            <p>Pincode: ${order.shippingAddress.pincode}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td>₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Amount: ₹${order.total.toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      console.log('Filtering order:', order);
      const matchesSearch =
        order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toString().includes(searchQuery);
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      console.log('Matches search:', matchesSearch, 'Matches status:', matchesStatus);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.total - a.total;
        case 'amount-asc':
          return a.total - b.total;
        default:
          return 0;
      }
    });

  console.log('All orders:', orders);
  console.log('Filtered and sorted orders:', filteredAndSortedOrders);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
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
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Orders</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center space-x-4">
                <div className="w-full max-w-lg lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Search orders
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                      placeholder="Search orders"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  value={selectedStatus}
                  onChange={handleStatusFilter}
                  className="rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={handleSort}
                  className="rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  <option value="date-desc">Newest</option>
                  <option value="date-asc">Oldest</option>
                  <option value="amount-desc">Amount: High to Low</option>
                  <option value="amount-asc">Amount: Low to High</option>
                </select>
              </div>
            </div>

            {/* Orders table */}
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Order ID
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Customer
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Total
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Status
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredAndSortedOrders.map((order) => (
                          <React.Fragment key={order.id}>
                            <tr
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleOrderDetails(order.id)}
                            >
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                #{order.id}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {order.user.name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString()}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                ₹{order.total.toLocaleString()}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                {expandedOrder === order.id ? (
                                  <ChevronUpIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                ) : (
                                  <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                )}
                              </td>
                            </tr>
                            {expandedOrder === order.id && (
                              <tr>
                                <td colSpan={6} className="bg-gray-50 px-4 py-4 sm:px-6">
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">Customer Details</h4>
                                      <dl className="mt-2 space-y-1 text-sm text-gray-500">
                                        <div>
                                          <dt className="inline font-medium">Email:</dt>{' '}
                                          <dd className="inline">{order.user.email}</dd>
                                        </div>
                                        <div>
                                          <dt className="inline font-medium">Phone:</dt>{' '}
                                          <dd className="inline">{order.user.phone}</dd>
                                        </div>
                                      </dl>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">Shipping Address</h4>
                                      <dl className="mt-2 space-y-1 text-sm text-gray-500">
                                        <div>{order.shippingAddress.street}</div>
                                        <div>
                                          {order.shippingAddress.city}, {order.shippingAddress.state}
                                        </div>
                                        <div>{order.shippingAddress.pincode}</div>
                                      </dl>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <h4 className="text-sm font-medium text-gray-900">Order Items</h4>
                                      <ul className="mt-2 divide-y divide-gray-200">
                                        {order.items.map((item, index) => (
                                          <li key={index} className="py-2">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                  {item.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                  Quantity: {item.quantity}
                                                </p>
                                                {item.flavor && (
                                                  <p className="text-sm text-gray-500">
                                                    Flavor: {item.flavor}
                                                  </p>
                                                )}
                                                {item.variant && (
                                                  <p className="text-sm text-gray-500">
                                                    Variant: {item.variant}
                                                  </p>
                                                )}
                                              </div>
                                              <div className="text-right">
                                                {item.salePrice ? (
                                                  <>
                                                    <p className="text-sm line-through text-gray-500">
                                                      ₹{item.price.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                      ₹{item.salePrice.toLocaleString()}
                                                    </p>
                                                  </>
                                                ) : (
                                                  <p className="text-sm font-medium text-gray-900">
                                                    ₹{item.price.toLocaleString()}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <div className="flex justify-end space-x-3">
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(order.id, order.status)}
                                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                          Update Status
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handlePrintInvoice(order)}
                                          className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                        >
                                          Print Invoice
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 