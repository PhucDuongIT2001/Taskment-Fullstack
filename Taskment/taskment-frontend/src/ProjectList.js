import React from 'react';
import { Folder, Folders } from 'lucide-react';
import { cn } from './lib/utils';

function ProjectList({ projects, selectedProjectId, onSelectProject }) {
    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Folders className="h-4 w-4" />
                    Projects
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <button
                    onClick={() => onSelectProject(null)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        selectedProjectId === null 
                            ? "bg-blue-50 text-blue-700" 
                            : "text-gray-700 hover:bg-gray-100"
                    )}
                >
                    <Folders className={cn("h-4 w-4", selectedProjectId === null ? "text-blue-700" : "text-gray-400")} />
                    All Projects
                </button>
                {projects.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onSelectProject(p.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            selectedProjectId === p.id 
                                ? "bg-blue-50 text-blue-700" 
                                : "text-gray-700 hover:bg-gray-100"
                        )}
                    >
                        <Folder className={cn("h-4 w-4", selectedProjectId === p.id ? "text-blue-700" : "text-gray-400")} />
                        <span className="truncate">{p.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ProjectList;
