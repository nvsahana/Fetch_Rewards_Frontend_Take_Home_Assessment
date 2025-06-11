// src/components/Login/Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        'https://frontend-take-home-service.fetch.com/auth/login',
        { name, email },
        { withCredentials: true }
      );
      navigate('/search');
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed. Please check your info and try again.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1 className="login-title">Welcome!</h1>
        <h3 className="login-subtext">Login</h3>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default Login;
