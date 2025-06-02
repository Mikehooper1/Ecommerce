import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ChatAltIcon,
  StarIcon,
} from '@heroicons/react/outline';

export default function AdminNav() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
    { name: 'Testimonials', href: '/admin/testimonials', icon: ChatAltIcon },
    { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon },
    { name: 'Orders', href: '/admin/orders', icon: ChartBarIcon },
    { name: 'Messages', href: '/admin/messages', icon: ChatAltIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ];

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 h-6 w-6 ${
                isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
} 