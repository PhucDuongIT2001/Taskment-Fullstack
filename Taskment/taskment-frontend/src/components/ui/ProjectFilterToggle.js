import React from 'react';
import { cn } from '../../lib/utils';
import { Briefcase, Globe } from 'lucide-react';

export function ProjectFilterToggle({ currentFilter, onFilterChange, userRoles = [] }) {
  const isCustomer = userRoles.includes('ROLE_CUSTOMER') && !userRoles.includes('ROLE_ADMIN');

  if (isCustomer) {
    return (
      <div className="inline-flex bg-gray-100/80 p-1 rounded-lg border border-gray-200">
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-white text-blue-700 shadow-sm"
        >
          <Briefcase className="mr-2 h-4 w-4" />
          Dự án của tôi
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex bg-gray-100/80 p-1 rounded-lg border border-gray-200">
      <button
        onClick={() => onFilterChange('my')}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          currentFilter === 'my'
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
        )}
      >
        <Briefcase className={cn("mr-2 h-4 w-4", currentFilter === 'my' ? "text-blue-600" : "text-gray-400")} />
        Dự án của tôi
      </button>
      <button
        onClick={() => onFilterChange('all')}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          currentFilter === 'all'
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
        )}
      >
        <Globe className={cn("mr-2 h-4 w-4", currentFilter === 'all' ? "text-blue-600" : "text-gray-400")} />
        Tất cả dự án
      </button>
    </div>
  );
}
