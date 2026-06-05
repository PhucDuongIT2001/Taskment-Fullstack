import React from 'react';
import TaskForm from './components/TaskForm';
import TaskService from './services/TaskService';
import { toast } from 'react-toastify';

/**
 * EditTask - Component Logic để chỉnh sửa một Task đang tồn tại.
 */
function EditTask({ task, onTaskUpdated, onCancel }) {
    
    // Chuyển đổi dữ liệu từ TaskDTO sang form data
    const initialData = {
        ...task,
        dueDate: task.dueDate ? task.dueDate.substring(0, 16) : ''
    };

    const handleSubmit = async (formData) => {
        try {
            const response = await TaskService.updateTask(task.id, formData);
            if (response && response.data) {
                toast.info('💾 Đã cập nhật công việc thành công!', {
                    theme: "colored"
                });
                onTaskUpdated(response.data);
            }
        } catch (error) {
            console.error("Lỗi cập nhật task:", error);
            toast.error('❌ Cập nhật thất bại: ' + (error.response?.data || error.message));
        }
    };

    return (
        <TaskForm 
            title="📝 Chỉnh sửa công việc" 
            initialData={initialData}
            onSubmit={handleSubmit} 
            onClose={onCancel} 
        />
    );
}

export default EditTask;
