import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import googleIcon from '../assets/google-icon.svg'; // Import icon Google

const GoogleLoginButton = ({ onGoogleLogin }) => {

    const handleGoogleLogin = useGoogleLogin({
        // Lấy authorization_code
        flow: 'auth-code', 
        
        // Hàm này sẽ được gọi sau khi người dùng đăng nhập thành công trên Google
        onSuccess: async (codeResponse) => {
            console.log("Authorization Code:", codeResponse.code);
            // Gọi hàm onGoogleLogin được truyền từ component cha (Auth.js)
            // để gửi code này lên backend
            if (onGoogleLogin) {
                await onGoogleLogin(codeResponse.code);
            }
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            toast.error("Đăng nhập bằng Google thất bại.");
        },
    });

    return (
        <button 
            type="button" 
            className="google-login-btn" 
            onClick={() => handleGoogleLogin()}
        >
            <img src={googleIcon} alt="Google icon" />
            <span>Đăng nhập với Google</span>
        </button>
    );
};

export default GoogleLoginButton;
