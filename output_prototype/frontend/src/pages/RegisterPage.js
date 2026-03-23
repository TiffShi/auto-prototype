import React from 'react';
import Register from '../components/Register';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const { login } = useAuth();

  const handleRegister = (email, password) => {
    // Mock register function
    login(email, password);
  };

  return (
    <div>
      <Register onRegister={handleRegister} />
    </div>
  );
};

export default RegisterPage;