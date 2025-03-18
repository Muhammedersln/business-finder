'use client';

import { useState } from 'react';
import { FaFilter, FaChevronDown, FaChevronUp, FaUndo } from 'react-icons/fa';

export interface FilterOptions {
  hasWebsite: boolean;
  hasPhone: boolean;
}

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    hasWebsite: false,
    hasPhone: false,
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (filterName: keyof FilterOptions) => {
    const updatedFilters = {
      ...filters,
      [filterName]: !filters[filterName],
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      hasWebsite: false,
      hasPhone: false,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="card mb-6">
      <div className="px-4 sm:px-5 py-3 sm:py-4 flex flex-wrap justify-between items-center border-b border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <FaFilter className="text-blue-500" />
          <span className="font-medium">Filtreler</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? (
            <FaChevronUp className="ml-1 text-gray-400" />
          ) : (
            <FaChevronDown className="ml-1 text-gray-400" />
          )}
        </button>
        
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center text-sm text-gray-600 hover:text-blue-500 transition-colors"
          >
            <FaUndo className="mr-1" />
            <span>Sıfırla</span>
          </button>
          
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>
      
      {showFilters && (
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
            <input 
              type="checkbox" 
              checked={filters.hasWebsite}
              onChange={() => handleFilterChange('hasWebsite')}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="select-none">Web Sitesi Olanlar</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
            <input 
              type="checkbox" 
              checked={filters.hasPhone}
              onChange={() => handleFilterChange('hasPhone')}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="select-none">Telefon Numarası Olanlar</span>
          </label>
        </div>
      )}
    </div>
  );
} 