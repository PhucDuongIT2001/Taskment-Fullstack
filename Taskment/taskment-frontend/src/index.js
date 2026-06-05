import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // THÊM MỚI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* THÊM MỚI: Bọc ứng dụng trong GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId="577050807180-mvkcj66kp5o3e59mrvo5e1mb8v2rv2ub.apps.googleusercontent.com"> 
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
