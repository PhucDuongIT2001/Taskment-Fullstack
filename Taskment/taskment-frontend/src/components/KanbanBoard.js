import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import TaskService from '../services/TaskService';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare, Paperclip, User } from 'lucide-react';
import './KanbanBoard.css';

const KanbanBoard = ({ initialTasks, statuses, fetchData }) => {
    const [tasksById, setTasksById] = useState({});
    const [columns, setColumns] = useState({});

    // Xây dựng dữ liệu khi props thay đổi
    useEffect(() => {
        if (!statuses || statuses.length === 0) return;

        const newTasksById = {};
        initialTasks.forEach(task => {
            newTasksById[task.id.toString()] = task;
        });

        const newColumns = {};
        // Tạo các cột dựa trên statuses
        statuses.forEach(status => {
            newColumns[status.id.toString()] = {
                id: status.id.toString(),
                title: status.name,
                taskIds: []
            };
        });

        // Phân loại task vào cột
        initialTasks.forEach(task => {
            const columnId = task.statusId?.toString();
            if (newColumns[columnId]) {
                newColumns[columnId].taskIds.push(task.id.toString());
            } else if (statuses.length > 0) {
                // Đề phòng task không có status, bỏ vào cột đầu tiên
                newColumns[statuses[0].id.toString()].taskIds.push(task.id.toString());
            }
        });

        setTasksById(newTasksById);
        setColumns(newColumns);
    }, [initialTasks, statuses]);

    const getPriorityColor = (priorityName) => {
        if (!priorityName) return '#9ca3af';
        const n = priorityName.toLowerCase();
        if (n.includes('cao') || n.includes('high')) return '#ef4444';
        if (n.includes('trung') || n.includes('medium')) return '#f59e0b';
        return '#10b981';
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = columns[source.droppableId];
        const finishColumn = columns[destination.droppableId];
        const newStatusId = parseInt(finishColumn.id, 10);

        // 1. Cập nhật state nội bộ ngay lập tức để UI mượt mà
        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStartColumn = { ...startColumn, taskIds: startTaskIds };

        const finishTaskIds = Array.from(finishColumn.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinishColumn = { ...finishColumn, taskIds: finishTaskIds };

        const updatedColumns = {
            ...columns,
            [newStartColumn.id]: newStartColumn,
            [newFinishColumn.id]: newFinishColumn,
        };
        setColumns(updatedColumns);

        // Lấy dữ liệu task cũ
        const draggedTask = tasksById[draggableId];
        
        // 2. Gọi API cập nhật
        try {
            // Tạo payload cập nhật (gửi toàn bộ thông tin cũ + status mới)
            const updatePayload = {
                ...draggedTask,
                statusId: newStatusId
            };
            
            await TaskService.updateTask(draggedTask.id, updatePayload);
            toast.success(`Đã chuyển sang: ${finishColumn.title}`);
            // Gọi lại hàm fetchData từ component cha nếu cần đồng bộ (hoặc bỏ qua để tránh chớp màn hình)
        } catch (error) {
            toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại.");
            // 3. Rollback nếu lỗi
            setColumns(columns);
        }
    };

    if (!statuses || statuses.length === 0) {
        return <div className="p-8 text-center text-gray-500">Đang tải bảng Kanban...</div>;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board-wrapper">
                <div className="kanban-container">
                    {statuses.map((status) => {
                        const column = columns[status.id.toString()];
                        if (!column) return null;
                        
                        return (
                            <div className="kanban-column-wrapper" key={column.id}>
                                <div className="kanban-column-header">
                                    <h3 className="kanban-column-title">
                                        {column.title} 
                                        <span className="kanban-task-count">{column.taskIds.length}</span>
                                    </h3>
                                </div>
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            className={`kanban-column-content custom-scrollbar ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {column.taskIds.map((taskId, index) => {
                                                const task = tasksById[taskId];
                                                if (!task) return null;
                                                return (
                                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''} ${task.overdue ? 'kanban-card-overdue' : ''}`}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <div className="kanban-card-header">
                                                                    {task.issueTypeName && (
                                                                        <span className="kanban-issue-type">{task.issueTypeName}</span>
                                                                    )}
                                                                    <div 
                                                                        className="kanban-priority-indicator" 
                                                                        title={task.priorityName}
                                                                        style={{ backgroundColor: getPriorityColor(task.priorityName) }}
                                                                    />
                                                                </div>
                                                                
                                                                <Link to={`/task/${task.id}`} className="kanban-card-title">
                                                                    {task.title}
                                                                </Link>
                                                                
                                                                <div className="kanban-card-footer">
                                                                    <div className="kanban-card-meta">
                                                                        {task.dueDate && (
                                                                            <span className={`flex items-center gap-1 ${task.overdue ? 'text-red-600 font-bold' : ''}`}>
                                                                                <Clock className="w-3.5 h-3.5" />
                                                                                {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                                                            </span>
                                                                        )}
                                                                        {task.storyPoints > 0 && (
                                                                            <span className="kanban-sp">{task.storyPoints} SP</span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="kanban-card-assignee" title={task.assigneeName || 'Chưa giao'}>
                                                                        {task.assigneeName ? (
                                                                            <div className="kanban-avatar">
                                                                                {task.assigneeName.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="kanban-avatar kanban-avatar-unassigned">
                                                                                <User className="w-3.5 h-3.5" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;
