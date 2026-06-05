import api from './api';

/**
 * Trích xuất message string từ lỗi axios.
 * Backend trả về: { status, error, message, path } hoặc plain string
 */
export const extractErrorMessage = (error, fallback = 'Đã xảy ra lỗi, vui lòng thử lại!') => {
    const data = error?.response?.data;
    if (!data) return error?.message || fallback;

    // 1. Nếu data là string (ví dụ trả về trực tiếp từ ResponseEntity.badRequest().body("Lỗi rồi"))
    if (typeof data === 'string') return data;

    // 2. Nếu có message property và nó là string
    if (data.message && typeof data.message === 'string') return data.message;

    // 3. Nếu là lỗi validation (Spring Boot MethodArgumentNotValidException)
    if (data.validationErrors) {
        return Object.values(data.validationErrors).join(' | ');
    }
    
    // 4. Nếu là lỗi validation dạng mảng (Standard Spring Boot errors)
    if (data.errors && Array.isArray(data.errors)) {
        return data.errors.map(err => err.defaultMessage || err.message).join(' | ');
    }

    // 5. Nếu message là object (phòng trường hợp backend trả về object lồng nhau)
    if (data.message && typeof data.message === 'object') {
        return JSON.stringify(data.message);
    }

    // 6. Thử lấy field 'error' (thường có trong Spring Security 403/401)
    if (data.error && typeof data.error === 'string') return data.error;

    return fallback;
};

const register = async (username, fullName, email, password, confirmPassword, dateOfBirth, firstName, lastName, phoneNumber, address, roleName) => {
    try {
        const response = await api.post("/auth/register", {
            username, fullName, email, password, confirmPassword,
            dateOfBirth, firstName, lastName, phoneNumber, address, roleName
        });
        return { success: true, data: response.data };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Đăng ký thất bại!'));
    }
};

const login = async (username, password) => {
    try {
        const response = await api.post("/auth/login", { username, password });
        if (response.data && response.data.requires2FA) {
            return { success: true, requires2FA: true, username: response.data.username, message: response.data.message };
        }
        if (response.data && response.data.accessToken) {
            localStorage.setItem("token", response.data.accessToken);
            return { success: true, user: response.data.user };
        }
        return { success: false };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Đăng nhập thất bại!'));
    }
};

const verify2FA = async (username, otp) => {
    try {
        const response = await api.post("/auth/verify-2fa", { username, otp });
        if (response.data && response.data.accessToken) {
            localStorage.setItem("token", response.data.accessToken);
            return { success: true, user: response.data.user };
        }
        return { success: false };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Xác thực OTP thất bại!'));
    }
};

const resend2FA = async (username) => {
    try {
        const response = await api.post("/auth/resend-2fa", { username });
        return { success: true, message: response.data.message };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Không thể gửi lại OTP!'));
    }
};

const getCurrentUser = async () => {
    try {
        const response = await api.get("/auth/me");
        return response.data;
    } catch (error) {
        return null;
    }
};

const logout = () => {
    localStorage.removeItem("token");
};

const forgotPassword = (email) => {
    return api.post("/auth/forgot-password", { email });
};

const resetPassword = (token, newPassword) => {
    return api.post(`/auth/reset-password?token=${token}`, { newPassword });
};

const loginWithGoogle = async (code) => {
    try {
        const response = await api.post("/auth/google", { code });
        if (response.data && response.data.accessToken) {
            localStorage.setItem("token", response.data.accessToken);
        }
        return { success: true, user: response.data.user };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Đăng nhập bằng Google thất bại!'));
    }
};

const AuthService = {
    register,
    login,
    verify2FA,
    resend2FA,
    getCurrentUser,
    logout,
    forgotPassword,
    resetPassword,
    loginWithGoogle
};

export default AuthService;
