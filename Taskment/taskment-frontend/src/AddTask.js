import React from 'react';
import TaskForm from './components/TaskForm';
import TaskService from './services/TaskService';
import { toast } from 'react-toastify';

/**
 * AddTask - Component Logic cho việc tạo một Task mới.
 */
function AddTask({ onTaskAdded, onCancel }) {
    
    const handleSubmit = async (formData) => {
        try {
            const response = await TaskService.createTask(formData);
            if (response && response.data) {
                toast.success('🎉 Đã tạo công việc mới thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                onTaskAdded(response.data); // Cập nhật danh sách ở App.js
            }
        } catch (error) {
            console.error("Lỗi khi thêm task:", error);
            toast.error('❌ Có lỗi xảy ra khi tạo công việc: ' + (error.response?.data || error.message));
        }
    };

    return (
        <TaskForm 
            title="🚀 Thêm công việc mới" 
            onSubmit={handleSubmit} 
            onClose={onCancel} 
        />
    );
}

export default AddTask;
