'use client';

import { useState } from 'react';
import { FaWhatsapp, FaFileDownload, FaSpinner } from 'react-icons/fa';

interface WhatsAppExportProps {
  phoneNumbers: string[];
}

export default function WhatsAppExport({ phoneNumbers }: WhatsAppExportProps) {
  const [message, setMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingLinks, setIsGeneratingLinks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappLinks, setWhatsappLinks] = useState<string[]>([]);

  // Filter out invalid or empty phone numbers
  const validPhoneNumbers = phoneNumbers.filter(phone => 
    phone && phone !== 'Telefon bilgisi yok'
  );

  const handleExportCSV = async () => {
    if (validPhoneNumbers.length === 0) {
      setError('Dışa aktarılacak geçerli telefon numarası bulunamadı');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumbers: validPhoneNumbers })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'CSV dışa aktarma işlemi başarısız oldu');
      }

      // Get the CSV blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'whatsapp-numbers.csv';
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateLinks = async () => {
    if (validPhoneNumbers.length === 0) {
      setError('Mesaj göndermek için geçerli telefon numarası bulunamadı');
      return;
    }

    if (!message.trim()) {
      setError('Lütfen göndermek istediğiniz mesajı girin');
      return;
    }

    setIsGeneratingLinks(true);
    setError(null);

    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumbers: validPhoneNumbers,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'WhatsApp bağlantıları oluşturulamadı');
      }

      const data = await response.json();
      setWhatsappLinks(data.links);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsGeneratingLinks(false);
    }
  };

  const openWhatsAppLink = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        WhatsApp İşlemleri
      </h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            WhatsApp Mesajı
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {validPhoneNumbers.length} numara seçildi
          </span>
        </div>
        <textarea
          id="message"
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700"
          placeholder="Merhaba, sizinle iletişime geçmek istiyoruz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExportCSV}
          disabled={isExporting || validPhoneNumbers.length === 0}
          className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-800 text-white font-medium rounded-md transition-colors"
        >
          {isExporting ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaFileDownload className="mr-2" />
          )}
          CSV Olarak İndir
        </button>
        
        <button
          onClick={handleGenerateLinks}
          disabled={isGeneratingLinks || validPhoneNumbers.length === 0 || !message.trim()}
          className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 dark:disabled:bg-green-800 text-white font-medium rounded-md transition-colors"
        >
          {isGeneratingLinks ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaWhatsapp className="mr-2" />
          )}
          WhatsApp Mesajları Oluştur
        </button>
      </div>

      {whatsappLinks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-2 text-gray-800 dark:text-white">
            WhatsApp Bağlantıları ({whatsappLinks.length})
          </h3>
          <div className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-md p-2">
            <ul className="space-y-2">
              {whatsappLinks.map((link, index) => (
                <li key={index} className="flex">
                  <button
                    onClick={() => openWhatsAppLink(link)}
                    className="flex items-center w-full text-left text-sm px-3 py-2 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <FaWhatsapp className="text-green-500 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {link.substring(0, 30)}...
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Bağlantılara tıklayarak WhatsApp uygulamasında mesaj gönderebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
} 