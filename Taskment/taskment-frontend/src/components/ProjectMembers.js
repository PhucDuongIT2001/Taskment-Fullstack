import React, { useState, useEffect } from 'react';
import ProjectMemberService from '../services/ProjectMemberService';
import UserService from '../services/UserService';
import { toast } from 'react-toastify';

const ProjectMembers = ({ projectId }) => {
    const [members, setMembers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [role, setRole] = useState('Developer');

    const fetchMembers = () => {
        ProjectMemberService.getProjectMembers(projectId)
            .then(res => setMembers(res.data))
            .catch(err => toast.error("Không thể tải danh sách thành viên."));
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            ProjectMemberService.getProjectMembers(projectId),
            UserService.getAllUsers()
        ]).then(([membersRes, usersRes]) => {
            setMembers(membersRes.data);
            setAllUsers(usersRes.data);
        }).catch(err => {
            toast.error("Lỗi khi tải dữ liệu thành viên.");
        }).finally(() => {
            setLoading(false);
        });
    }, [projectId]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedUserId) {
            toast.warn("Vui lòng chọn một người dùng.");
            return;
        }
        try {
            await ProjectMemberService.addProjectMember(projectId, selectedUserId, role);
            toast.success("Đã thêm thành viên mới vào dự án!");
            fetchMembers(); // Tải lại danh sách
            setShowAddMember(false);
            setSelectedUserId('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi thêm thành viên.");
        }
    };

    const handleRemoveMember = async (userId) => {
        if (window.confirm("Bạn có chắc muốn xóa thành viên này khỏi dự án?")) {
            try {
                await ProjectMemberService.removeProjectMember(projectId, userId);
                toast.info("Đã xóa thành viên.");
                fetchMembers();
            } catch (err) {
                toast.error("Lỗi khi xóa thành viên.");
            }
        }
    };

    // Lọc ra những user chưa phải là thành viên để hiển thị trong dropdown
    const nonMemberUsers = allUsers.filter(user => !members.some(member => member.userId === user.id));

    return (
        <div className="card" style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Thành viên dự án ({members.length})</h3>
                <button onClick={() => setShowAddMember(!showAddMember)} className="add-task-btn">
                    {showAddMember ? 'Hủy' : '➕ Thêm thành viên'}
                </button>
            </div>

            {showAddMember && (
                <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} style={{ flex: 2 }}>
                        <option value="">-- Chọn người dùng --</option>
                        {nonMemberUsers.map(u => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
                    </select>
                    <input
                        type="text"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        placeholder="Vai trò (VD: Developer)"
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="submit-btn primary">Thêm</button>
                </form>
            )}

            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                {members.map(member => (
                    <li key={member.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                        <div>
                            <strong style={{ color: '#333' }}>{member.fullName || member.username}</strong>
                            <span style={{ marginLeft: '10px', color: '#777', fontSize: '0.9em' }}>({member.role})</span>
                        </div>
                        <button onClick={() => handleRemoveMember(member.userId)} className="delete-icon-btn" title="Xóa thành viên">
                            🗑️
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectMembers;
