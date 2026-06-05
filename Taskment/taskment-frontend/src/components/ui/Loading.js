import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoadingSpinner({ className, size = 24 }) {
  return (
    <div className={cn("flex justify-center items-center p-4", className)}>
      <Loader2 className="animate-spin text-blue-500" size={size} />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading data...</p>
      </div>
    </div>
  );
}
