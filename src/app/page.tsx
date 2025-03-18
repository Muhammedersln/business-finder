'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import BusinessTable from './components/BusinessTable';
import Filters, { FilterOptions } from './components/Filters';
import { searchBusinesses, getBusinessDetails } from './services/places';
import { FaMapMarkedAlt, FaBuilding, FaInfo, FaMapMarkerAlt } from 'react-icons/fa';

interface Business {
  name: string;
  formatted_phone_number?: string;
  website?: string;
  place_id: string;
}

interface SearchResult {
  name: string;
  place_id: string;
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    hasWebsite: false,
    hasPhone: false,
  });

  const handleSearch = async (query: string, location: string) => {
    if (!query.trim() || !location.trim()) {
      return;
    }

    setIsLoading(true);
    setBusinesses([]);
    setSearchPerformed(true);

    try {
      const searchResults = await searchBusinesses(query, location);
      
      if (!searchResults || searchResults.length === 0) {
        setBusinesses([]);
        setIsLoading(false);
        return;
      }

      // Process results in batches to avoid overwhelming the API
      const batchSize = 10;
      const allBusinesses: Business[] = [];
      
      for (let i = 0; i < searchResults.length; i += batchSize) {
        const batch = searchResults.slice(i, i + batchSize);
        const batchPromises = batch.map(async (result: SearchResult) => {
          if (!result?.place_id) {
            console.error('Invalid result:', result);
            return null;
          }

          try {
            const details = await getBusinessDetails(result.place_id);
            return {
              name: details.name || result.name || 'İsimsiz İşletme',
              formatted_phone_number: details.formatted_phone_number || 'Telefon bilgisi yok',
              website: details.website || 'Web sitesi yok',
              place_id: result.place_id,
            };
          } catch (error) {
            console.error('Error fetching details for place_id:', result.place_id, error);
            return {
              name: result.name || 'İsimsiz İşletme',
              formatted_phone_number: 'Telefon bilgisi yok',
              website: 'Web sitesi yok',
              place_id: result.place_id,
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validBatchResults = batchResults.filter((result): result is Business => result !== null);
        allBusinesses.push(...validBatchResults);
        
        // Update the state progressively as batches complete
        setBusinesses([...allBusinesses]);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
      alert('İşletmeler aranırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 sm:py-12">
      <div className="container">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center">
            <FaBuilding className="mr-3 text-blue-500" />
            İşletme Bulucu
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Google Maps üzerinden işletmeleri kolayca bulun. Aramak istediğiniz işletme tipini ve konumu girin, 
            işletmelerin iletişim bilgilerini ve web sitelerini görüntüleyin.
          </p>
        </header>

        <div className="max-w-5xl mx-auto space-y-6">
          <SearchBar onSearch={handleSearch} />
          
          {searchPerformed && (
            <>
              <Filters onFilterChange={handleFilterChange} />
              
              <BusinessTable 
                businesses={businesses} 
                isLoading={isLoading} 
                activeFilters={activeFilters}
              />
            </>
          )}
          
          {!searchPerformed && (
            <div className="card p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 w-24 h-24 rounded-full flex items-center justify-center">
                  <FaMapMarkedAlt className="text-5xl text-blue-500" />
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">İşletmeleri Aramaya Başlayın</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                    İşletme adı, türü veya kategori (restoran, avukat, kuaför vb.) 
                    ve konum bilgisini girerek arama yapın.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-lg w-full max-w-md">
                  <div className="flex items-start">
                    <FaInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">Örnek aramalar:</p>
                      <div className="space-y-2 pl-2">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <FaMapMarkerAlt className="text-gray-400 mr-2" />
                          <span>&ldquo;restoran İzmir&rdquo;</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <FaMapMarkerAlt className="text-gray-400 mr-2" />
                          <span>&ldquo;kafe Kadıköy&rdquo;</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <FaMapMarkerAlt className="text-gray-400 mr-2" />
                          <span>&ldquo;diş hekimi Ankara&rdquo;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
