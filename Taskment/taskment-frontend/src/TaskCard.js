import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Edit2, Trash2, Clock, Star, Folder } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';

function TaskCard({ task, onDelete, onEdit, canManage }) {
  const { 
    id, title, description, projectName, statusName, 
    priorityName, assigneeName, createdAt, storyPoints, sprintName, issueTypeName
  } = task;

  const getPriorityVariant = (name) => {
    if (!name) return 'default';
    const n = name.toLowerCase();
    if (n.includes('cao')) return 'danger';
    if (n.includes('trung')) return 'warning';
    return 'success';
  };

  const getStatusVariant = (name) => {
    if (!name) return 'default';
    const n = name.toLowerCase();
    if (n.includes('hoàn thành')) return 'success';
    if (n.includes('đang làm')) return 'primary';
    return 'warning';
  };

  return (
    <Card className={`group relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 ${task.overdue ? 'border-red-300 shadow-red-100' : ''}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${task.overdue ? 'bg-red-600' : getPriorityVariant(priorityName) === 'danger' ? 'bg-red-500' : getPriorityVariant(priorityName) === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} />
      
      <Link to={`/task/${id}`} className="absolute inset-0 z-0" aria-label={`View task ${title}`} />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {issueTypeName && <Badge variant="default" className="text-[10px] uppercase tracking-wider">{issueTypeName}</Badge>}
              <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                {title || "Untitled Task"}
              </CardTitle>
            </div>
            <CardDescription className="line-clamp-2 min-h-[40px]">
              {description || "No description provided."}
            </CardDescription>
          </div>
          
          {canManage && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-blue-600 z-10 relative" 
                onClick={(e) => { e.preventDefault(); onEdit(task); }}
              >
                <Edit2 size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-red-600 z-10 relative" 
                onClick={(e) => { e.preventDefault(); onDelete(id); }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4 relative z-10">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={getStatusVariant(statusName)}>{statusName}</Badge>
          <Badge variant={getPriorityVariant(priorityName)}>{priorityName}</Badge>
          {projectName && (
            <Badge variant="default" className="bg-gray-100/80">
              <Folder size={12} className="mr-1" />
              {projectName}
            </Badge>
          )}
          {sprintName && (
            <Badge variant="default" className="bg-indigo-50 text-indigo-700">
              🏃 {sprintName}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50/50 border-t border-gray-100 py-3 px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium border border-blue-200">
            {assigneeName ? assigneeName.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
            {assigneeName || "Unassigned"}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {storyPoints != null && (
            <div className="flex items-center gap-1 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              {storyPoints}
            </div>
          )}
          {task.dueDate ? (
            <div className={`flex items-center gap-1 ${task.overdue ? 'text-red-600 font-bold' : task.remainingHours < 24 ? 'text-yellow-600 font-bold' : ''}`}>
              <Clock size={12} />
              {format(parseISO(task.dueDate), 'dd/MM/yyyy HH:mm')}
              {task.overdue && <span className="ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] uppercase">Quá hạn</span>}
            </div>
          ) : createdAt && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {format(parseISO(createdAt), 'dd/MM/yyyy', { locale: vi })}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default TaskCard;
