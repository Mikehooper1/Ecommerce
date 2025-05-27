import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CurrencyDollarIcon } from '@heroicons/react/solid';

export default function Revenue() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    monthly: {},
    recentOrders: []
  });

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        console.log('Fetching orders from Firestore...');
        const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        console.log('Number of orders found:', ordersSnap.size);
        
        let total = 0;
        const monthly = {};
        const recentOrders = [];

        ordersSnap.forEach(doc => {
          const data = doc.data();
          console.log('Order data:', data);
          const amount = Number(data.total || data.amount || 0);
          total += amount;

          // Handle different date formats
          let date;
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              // Firestore Timestamp
              date = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              // JavaScript Date object
              date = data.createdAt;
            } else if (typeof data.createdAt === 'string') {
              // String date
              date = new Date(data.createdAt);
            } else if (typeof data.createdAt === 'number') {
              // Timestamp number
              date = new Date(data.createdAt);
            }
          }
          
          // Fallback to current date if no valid date found
          if (!date || isNaN(date.getTime())) {
            date = new Date();
          }

          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthly[monthYear] = (monthly[monthYear] || 0) + amount;

          // Store recent orders
          if (recentOrders.length < 10) {
            recentOrders.push({
              id: doc.id,
              amount,
              date: date,
              status: data.status || 'completed'
            });
          }
        });

        console.log('Processed revenue data:', {
          total,
          monthly,
          recentOrders
        });

        setRevenueData({
          total,
          monthly,
          recentOrders
        });
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Revenue Overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your store's revenue and financial performance
          </p>
        </div>

        {/* Total Revenue Card */}
        <div className="mt-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-yellow-600">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : formatCurrency(revenueData.total)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(revenueData.monthly)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([monthYear, amount]) => (
                      <div key={monthYear} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="text-gray-600">
                          {new Date(monthYear + '-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                        </span>
                        <span className="font-semibold">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {revenueData.recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <span className="text-gray-600">{formatDate(order.date)}</span>
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </div>
                      <span className="font-semibold">{formatCurrency(order.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 