import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css'; // Import file CSS mới tạo

function Auth({ login, register }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-wrapper">
      {isLogin ? (
        <Login 
          onToggle={() => setIsLogin(false)} 
          onLogin={login} 
        />
      ) : (
        <Register 
          onToggle={() => setIsLogin(true)} 
          onRegister={register} 
        />
      )}
    </div>
  );
}

export default Auth;