import React from 'react';
import { FolderX, Plus } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export function EmptyState({ 
  icon: Icon = FolderX, 
  title = "No data found", 
  description = "Get started by creating a new one.", 
  actionLabel, 
  onAction,
  className 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
