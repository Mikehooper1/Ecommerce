import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PhotographIcon,
  StarIcon,
  ChatAltIcon,
} from '@heroicons/react/solid';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [totals, setTotals] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    banners: 0,
    reviews: 0,
    testimonials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        // Fetch products
        const productsSnap = await getDocs(collection(db, 'products'));
        const productsCount = productsSnap.size;
        console.log('Products count:', productsCount);

        // Calculate total reviews
        let totalReviews = 0;
        productsSnap.forEach(doc => {
          const data = doc.data();
          if (data.ratings && Array.isArray(data.ratings)) {
            totalReviews += data.ratings.length;
          }
        });

        // Fetch orders and calculate revenue
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const ordersCount = ordersSnap.size;
        console.log('Orders count:', ordersCount);
        console.log('Orders data:', ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        let revenue = 0;
        ordersSnap.forEach(doc => {
          const data = doc.data();
          console.log('Order status:', data.status, 'Amount:', data.total || data.amount);
          // Only add to revenue if the order is not canceled
          if (data.status !== 'canceled' && data.status !== 'Cancelled') {
            revenue += Number(data.total || data.amount || 0);
            console.log('Adding to revenue:', data.total || data.amount);
          } else {
            console.log('Skipping canceled order');
          }
        });
        console.log('Final total revenue:', revenue);

        // Fetch customers
        const customersSnap = await getDocs(collection(db, 'customers'));
        const customersCount = customersSnap.size;
        console.log('Customers count:', customersCount);

        // Fetch banners
        const bannersSnap = await getDocs(collection(db, 'banners'));
        const bannersCount = bannersSnap.size;
        console.log('Banners count:', bannersCount);

        // Fetch testimonials
        const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
        const testimonialsCount = testimonialsSnap.size;
        console.log('Testimonials count:', testimonialsCount);

        setTotals({
          products: productsCount,
          orders: ordersCount,
          customers: customersCount,
          revenue,
          banners: bannersCount,
          reviews: totalReviews,
          testimonials: testimonialsCount,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTotals();
  }, []);

  const stats = [
    {
      name: 'Total Products',
      value: loading ? '...' : totals.products,
      icon: ShoppingBagIcon,
      color: 'bg-primary-600',
      link: '/admin/products',
    },
    {
      name: 'Total Orders',
      value: loading ? '...' : totals.orders,
      icon: CurrencyDollarIcon,
      color: 'bg-green-600',
      link: '/admin/orders',
    },
    {
      name: 'Total Customers',
      value: loading ? '...' : totals.customers,
      icon: UserGroupIcon,
      color: 'bg-purple-600',
      link: '/admin/customers',
    },
    {
      name: 'Total Revenue',
      value: loading ? '...' : `₹${totals.revenue.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-yellow-600',
      link: '/admin/revenue',
    },
    {
      name: 'Total Reviews',
      value: loading ? '...' : totals.reviews,
      icon: StarIcon,
      color: 'bg-blue-600',
      link: '/admin/reviews',
    },
    {
      name: 'Total Testimonials',
      value: loading ? '...' : totals.testimonials,
      icon: ChatAltIcon,
      color: 'bg-indigo-600',
      link: '/admin/testimonials',
    },
    {
      name: 'Total Banners',
      value: loading ? '...' : totals.banners,
      icon: PhotographIcon,
      color: 'bg-pink-600',
      link: '/admin/banners',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {currentUser?.displayName || 'Admin'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {stats.map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${item.color}`}>
                      <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {item.value}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link
              to="/admin/products/new"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Add New Product
              </span>
            </Link>
            <Link
              to="/admin/orders/new"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Create New Order
              </span>
            </Link>
            <Link
              to="/admin/customers/new"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Add New Customer
              </span>
            </Link>
            <Link
              to="/admin/reviews"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Manage Reviews
              </span>
            </Link>
            <Link
              to="/admin/banners/new"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PhotographIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Add New Banner
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 