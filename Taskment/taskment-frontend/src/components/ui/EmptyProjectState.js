import React from 'react';
import { FolderPlus, UserPlus } from 'lucide-react';
import { EmptyState } from './EmptyState';

export function EmptyProjectState({ canCreateProject = false, onAction }) {
  return (
    <div className="p-4 flex-1 flex items-center justify-center">
      <EmptyState
        icon={canCreateProject ? FolderPlus : UserPlus}
        title="Không có dự án nào"
        description="Bạn hiện chưa tham gia hoặc tạo dự án nào."
        actionLabel={canCreateProject ? "Tạo dự án mới" : "Tham gia dự án"}
        onAction={onAction || (() => {})}
        className="min-h-[200px] bg-transparent border-none p-4"
      />
    </div>
  );
}
