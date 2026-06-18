import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../components/forms/LoginPage';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (userData) => {
    const result = await login(userData.email, userData.password);
    if (result.success) {
      navigate('/dashboard');
    }
    return result;
  };

  return <LoginPage onLogin={handleLogin} />;
};

export default Home;