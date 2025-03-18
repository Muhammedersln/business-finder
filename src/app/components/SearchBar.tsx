'use client';

import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || !location.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      await onSearch(query, location);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="card mb-6 p-5 shadow-lg border border-gray-100 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İşletme adı veya kategori"
            className="input pl-12 h-14 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-900"
            required
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            Örn: restoran, kafe, berber
          </div>
        </div>
        
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaMapMarkerAlt className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Şehir veya bölge"
            className="input pl-12 h-14 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-900"
            required
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            Örn: İstanbul, Kadıköy
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSearching || !query.trim() || !location.trim()}
          className="h-14 px-10 rounded-lg font-medium text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
        >
          {isSearching ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Aranıyor...
            </>
          ) : (
            <>
              <FaSearch className="mr-2" />
              Ara
            </>
          )}
        </button>
      </form>
    </div>
  );
} 