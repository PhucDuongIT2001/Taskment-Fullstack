import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom'; // Import Link
import UserService from '../services/UserService';
import UserForm from '../components/UserForm';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await UserService.getAllUsers();
            setUsers(response.data);
        } catch (err) {
            toast.error("Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (userData) => {
        try {
            await UserService.register(userData);
            toast.success("🚀 Đã tạo người dùng mới!");
            setShowAddModal(false);
            fetchUsers();
        } catch (err) {
            toast.error("Lỗi khi tạo người dùng: " + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateUser = async (userData) => {
        try {
            await UserService.updateUser(selectedUser.id, userData);
            toast.success("💾 Đã cập nhật người dùng!");
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            toast.error("Lỗi khi cập nhật người dùng: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
            try {
                await UserService.deleteUser(id);
                toast.success("🗑️ Đã xóa người dùng.");
                fetchUsers();
            } catch (err) {
                toast.error("Lỗi khi xóa người dùng.");
            }
        }
    };

    if (loading) return <div className="loading-screen">⌛ Đang tải dữ liệu người dùng...</div>;

    return (
        <div className="card" style={{ padding: '24px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👤 Quản Lý Người Dùng</h2>
                <button onClick={() => setShowAddModal(true)} className="add-task-btn">➕ Thêm Người Dùng</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f2f5', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Username</th>
                        <th style={{ padding: '12px' }}>Họ và Tên</th>
                        <th style={{ padding: '12px' }}>Email</th>
                        <th style={{ padding: '12px' }}>Quyền</th>
                        <th style={{ padding: '12px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                            <td style={{ padding: '12px' }}>{u.id}</td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{u.username}</td>
                            <td style={{ padding: '12px' }}>{u.fullName}</td>
                            <td style={{ padding: '12px' }}>{u.email}</td>
                            <td style={{ padding: '12px' }}>
                                {u.roles?.map(r => r.name).join(', ')}
                            </td>
                            <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                                <Link to={`/profile/${u.id}`} className="action-btn-view">
                                    👁️ Xem
                                </Link>
                                <button
                                    className="action-btn-edit"
                                    onClick={() => setSelectedUser(u)}
                                >
                                    ✏️ Sửa
                                </button>
                                <button
                                    className="action-btn-delete"
                                    onClick={() => handleDeleteUser(u.id)}
                                >
                                    🗑️ Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showAddModal && (
                <UserForm
                    title="Tạo Người Dùng Mới"
                    onSubmit={handleAddUser}
                    onClose={() => setShowAddModal(false)}
                />
            )}
            {selectedUser && (
                <UserForm
                    title="Cập nhật Người Dùng"
                    initialData={selectedUser}
                    onSubmit={handleUpdateUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default AdminUserManagement;
