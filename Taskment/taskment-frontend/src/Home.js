import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import TaskService from './services/TaskService';
import { useNavigate } from 'react-router-dom';
import { LoadingPage } from './components/ui/Loading';
import { EmptyState } from './components/ui/EmptyState';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Pagination } from './components/ui/Pagination';

function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [currentPage, pageSize]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Giả lập frontend pagination nếu backend trả về list hoặc dùng params nếu backend có pagination
      const response = await TaskService.getMyTasks();
      // Temporary frontend pagination to meet UI requirement before backend is fully integrated
      const allTasks = response.data;
      setTotalElements(allTasks.length);
      setTotalPages(Math.ceil(allTasks.length / pageSize));
      
      const startIndex = currentPage * pageSize;
      const paginatedTasks = allTasks.slice(startIndex, startIndex + pageSize);
      
      setTasks(paginatedTasks);
      setError(null);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        setError("Không thể tải danh sách công việc. Vui lòng kiểm tra kết nối.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    const isConfirm = window.confirm("Bạn có chắc muốn xóa công việc này không?");
    if (isConfirm) {
      try {
        setDeleteError(null); 
        await TaskService.deleteTask(taskId);
        fetchTasks(); // Refetch to maintain pagination correctness
      } catch (err) {
        setDeleteError("Có lỗi xảy ra khi xóa công việc!");
      }
    }
  };

  if (loading && tasks.length === 0) return <LoadingPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Tasks</h1>
          <p className="mt-2 text-sm text-gray-500">Manage and track your assigned work.</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {deleteError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      {tasks.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
          
          <div className="mt-8 border-t border-gray-200 bg-white rounded-xl shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalElements}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(0);
              }}
            />
          </div>
        </div>
      ) : (
        <EmptyState 
          icon={CheckCircle}
          title="All caught up!"
          description="You don't have any pending tasks. Take a break or ask for new assignments."
        />
      )}
    </div>
  );
}

export default Home;