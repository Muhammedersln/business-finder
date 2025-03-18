'use client';

import { useState, useMemo } from 'react';
import { 
  flexRender,
  getCoreRowModel, 
  getSortedRowModel, 
  getPaginationRowModel,
  SortingState,
  createColumnHelper,
  RowSelectionState,
} from '@tanstack/react-table';
import { useReactTable } from '@tanstack/react-table';
import { FaExternalLinkAlt, FaPhone, FaGlobe, FaSortUp, FaSortDown, FaSort, FaWhatsapp } from 'react-icons/fa';
import { FilterOptions } from './Filters';
import WhatsAppExport from './WhatsAppExport';

interface Business {
  name: string;
  formatted_phone_number?: string;
  website?: string;
  place_id: string;
}

interface BusinessTableProps {
  businesses: Business[];
  isLoading: boolean;
  activeFilters: FilterOptions;
}

export default function BusinessTable({ businesses, isLoading, activeFilters }: BusinessTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showExportPanel, setShowExportPanel] = useState(false);

  const columnHelper = createColumnHelper<Business>();

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor(row => row.name, {
      id: 'name',
      header: () => 'İşletme Adı',
      cell: info => <div className="font-medium">{info.getValue()}</div>,
    }),
    columnHelper.accessor(row => row.formatted_phone_number, {
      id: 'formatted_phone_number',
      header: () => 'Telefon',
      cell: info => {
        const phone = info.getValue();
        if (!phone || phone === 'Telefon bilgisi yok') {
          return <span className="text-gray-400">Yok</span>;
        }
        return (
          <a href={`tel:${phone}`} className="flex items-center text-blue-600 hover:text-blue-800">
            <FaPhone className="mr-2" />
            {phone}
          </a>
        );
      },
    }),
    columnHelper.accessor(row => row.website, {
      id: 'website',
      header: () => 'Web Sitesi',
      cell: info => {
        const website = info.getValue();
        if (!website || website === 'Web sitesi yok') {
          return <span className="text-gray-400">Yok</span>;
        }
        return (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaGlobe className="mr-1" />
            <span className="mr-1">Web Sitesi</span>
            <FaExternalLinkAlt className="h-3 w-3" />
          </a>
        );
      },
    }),
    columnHelper.display({
      id: 'whatsapp',
      header: () => 'WhatsApp',
      cell: ({ row }) => {
        const phone = row.getValue('formatted_phone_number') as string | undefined;
        if (!phone || phone === 'Telefon bilgisi yok') {
          return <span className="text-gray-400">-</span>;
        }
        
        // Format number for WhatsApp
        const cleanedNumber = phone.replace(/\D/g, '');
        let formattedNumber = cleanedNumber;
        
        if (cleanedNumber.startsWith('90')) {
          formattedNumber = cleanedNumber;
        } else if (cleanedNumber.startsWith('0')) {
          formattedNumber = `90${cleanedNumber.substring(1)}`;
        } else {
          formattedNumber = `90${cleanedNumber}`;
        }
        
        const whatsappUrl = `https://wa.me/${formattedNumber}`;
        
        return (
          <a 
            href={whatsappUrl}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center justify-center text-green-500 hover:text-green-600 transition-colors"
          >
            <FaWhatsapp className="h-5 w-5" />
          </a>
        );
      },
    }),
  ], []);

  // Apply filters
  const filteredData = useMemo(() => {
    return businesses.filter(business => {
      if (activeFilters.hasWebsite && (!business.website || business.website === 'Web sitesi yok')) {
        return false;
      }
      if (activeFilters.hasPhone && (!business.formatted_phone_number || business.formatted_phone_number === 'Telefon bilgisi yok')) {
        return false;
      }
      return true;
    });
  }, [businesses, activeFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Update selectedRows whenever rowSelection changes
  useMemo(() => {
    const newSelectedRows = new Set<string>();
    Object.keys(rowSelection).forEach(indexStr => {
      const index = parseInt(indexStr);
      if (rowSelection[index] && filteredData[index]) {
        const place_id = filteredData[index].place_id;
        newSelectedRows.add(place_id);
      }
    });
    setSelectedRows(newSelectedRows);
  }, [rowSelection, filteredData]);

  // Get selected phone numbers
  const selectedPhoneNumbers = useMemo(() => {
    return filteredData
      .filter(business => selectedRows.has(business.place_id))
      .map(business => business.formatted_phone_number)
      .filter(phone => phone && phone !== 'Telefon bilgisi yok') as string[];
  }, [filteredData, selectedRows]);

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">İşletmeler aranıyor...</p>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="card p-8">
        <div className="text-center text-gray-500">
          <p>Henüz bir arama yapılmadı. İşletme bulmak için yukarıdaki arama kutusunu kullanın.</p>
        </div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="card p-8">
        <div className="text-center text-gray-500">
          <p>Seçilen filtrelere uygun işletme bulunamadı. Lütfen farklı filtreler deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {{
                          asc: <FaSortUp className="text-blue-500" />,
                          desc: <FaSortDown className="text-blue-500" />,
                          false: <FaSort className="text-gray-300" />,
                        }[header.column.getIsSorted() as string ?? 'false']}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    row.toggleSelected(!row.getIsSelected());
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="px-6 py-4"
                      onClick={(e) => {
                        // Checkbox sütunu için olay yayılmasını engelleyelim
                        if (cell.column.id === 'select') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WhatsApp Export Button and Selected Count */}
        <div className="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedPhoneNumbers.length} numara seçildi
            </span>
          </div>
          
          <button
            onClick={() => setShowExportPanel(!showExportPanel)}
            disabled={selectedPhoneNumbers.length === 0}
            className="flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-medium rounded transition-colors"
          >
            <FaWhatsapp className="mr-2" />
            WhatsApp İşlemleri
          </button>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Sayfa{' '}
              <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> / {' '}
              <span className="font-medium">{table.getPageCount()}</span>
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Önceki
            </button>
            <button
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Export Panel */}
      {showExportPanel && selectedPhoneNumbers.length > 0 && (
        <WhatsAppExport phoneNumbers={selectedPhoneNumbers} />
      )}
    </div>
  );
} 