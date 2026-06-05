import React, { useState } from 'react';

function CustomerRequestForm({ onSubmit, onClose, title }) {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="close-x" onClick={onClose}>&times;</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tiêu đề yêu cầu *</label>
                        <input 
                            type="text" 
                            name="title" 
                            placeholder="Tóm tắt yêu cầu của bạn..."
                            value={formData.title} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mô tả chi tiết</label>
                        <textarea 
                            name="description" 
                            placeholder="Mô tả cụ thể vấn đề hoặc yêu cầu của bạn..."
                            value={formData.description} 
                            onChange={handleChange}
                            rows="5"
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn primary">🎫 Gửi Yêu Cầu</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CustomerRequestForm;
