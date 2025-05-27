import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Slider() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'banners'));
        const bannersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBanners(bannersData);
      } catch (err) {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) return <div className="h-48 sm:h-64 flex items-center justify-center">Loading...</div>;
  if (banners.length === 0) return <div className="h-48 sm:h-64 flex items-center justify-center">No banners found.</div>;

  return (
    <div className="relative w-full h-[16rem] sm:h-[24rem] md:h-[32rem] lg:h-[40rem] overflow-hidden rounded-lg shadow-lg bg-gray-200 z-0">
      {banners.map((banner, idx) => (
        <img
          key={banner.id}
          src={banner.imageUrl}
          alt={banner.title || `Banner ${idx + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        />
      ))}
      <button
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 sm:p-2 shadow hover:bg-white"
        onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
        aria-label="Previous"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 sm:p-2 shadow hover:bg-white"
        onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
        aria-label="Next"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
        {banners.map((_, idx) => (
          <span
            key={idx}
            className={`block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${idx === current ? 'bg-primary-600' : 'bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
} 