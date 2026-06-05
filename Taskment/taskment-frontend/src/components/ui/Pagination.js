import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange,
  totalItems 
}) {
  const pageSizeOptions = [5, 10, 20, 50];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
      <div className="flex items-center text-sm text-gray-500">
        <span className="mr-4">
          Total {totalItems} items
        </span>
        <div className="flex items-center space-x-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md text-sm py-1 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500 mr-2">
          Page {currentPage + 1} of {totalPages || 1}
        </span>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className="w-8 h-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
