import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCartIcon, UserIcon, MenuIcon, XIcon, ChevronDownIcon } from '@heroicons/react/solid';

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const brandsRef = useRef(null);
  const priceRef = useRef(null);

  const priceRanges = [
    { name: 'Under Rs.1499', href: '/products?price=0-1499' },
    { name: 'Under Rs.1999', href: '/products?price=0-1999' },
    { name: 'Under Rs.2299', href: '/products?price=0-2299' },
    { name: 'Under Rs.3999', href: '/products?price=0-3999' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (brandsRef.current && !brandsRef.current.contains(event.target)) {
        setIsBrandsOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setIsPriceOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-[#000000] shadow-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl hover:text-gray-300 transition-colors duration-200">
              VapeX India
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Products
              </Link>
              
              {/* Shop by Brands Dropdown */}
              <div className="relative" ref={brandsRef}>
                <button
                  onClick={() => {
                    setIsBrandsOpen(!isBrandsOpen);
                    setIsPriceOpen(false);
                  }}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  Shop by Brands
                  <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isBrandsOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {isBrandsOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#000000] ring-1 ring-black ring-opacity-5 border border-gray-800 z-50">
                    <div className="py-1">
                      <Link
                        to="/products?brand=all"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white"
                        onClick={() => setIsBrandsOpen(false)}
                      >
                        All Brands
                      </Link>
                      {/* Brands will be dynamically populated from admin */}
                    </div>
                  </div>
                )}
              </div>

              {/* Shop by Price Dropdown */}
              <div className="relative" ref={priceRef}>
                <button
                  onClick={() => {
                    setIsPriceOpen(!isPriceOpen);
                    setIsBrandsOpen(false);
                  }}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  Shop by Price
                  <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isPriceOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {isPriceOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#000000] ring-1 ring-black ring-opacity-5 border border-gray-800 z-50">
                    <div className="py-1">
                      {priceRanges.map((range) => (
                        <Link
                          key={range.href}
                          to={range.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white"
                          onClick={() => setIsPriceOpen(false)}
                        >
                          {range.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="text-gray-300 hover:text-white relative transition-colors duration-200">
              <ShoppingCartIcon className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            {currentUser ? (
              <div className="relative group">
                <button className="text-gray-300 hover:text-white transition-colors duration-200">
                  <UserIcon className="h-6 w-6" />
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-[#000000] rounded-md shadow-xl hidden group-hover:block border border-gray-800">
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white transition-colors duration-200"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <UserIcon className="h-6 w-6" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#000000] border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            
            {/* Mobile Shop by Brands */}
            <div className="px-3 py-2">
              <div className="text-gray-300 text-base font-medium mb-2">Shop by Brands</div>
              <div className="pl-4 space-y-1">
                <Link
                  to="/products?brand=all"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Brands
                </Link>
                {/* Brands will be dynamically populated from admin */}
              </div>
            </div>

            {/* Mobile Shop by Price */}
            <div className="px-3 py-2">
              <div className="text-gray-300 text-base font-medium mb-2">Shop by Price</div>
              <div className="pl-4 space-y-1">
                {priceRanges.map((range) => (
                  <Link
                    key={range.href}
                    to={range.href}
                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {range.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/about"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            {currentUser ? (
              <>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 