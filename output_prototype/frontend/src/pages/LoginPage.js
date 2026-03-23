import React from 'react';
import Login from '../components/Login';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div>
      <Login onLogin={login} />
    </div>
  );
};

export default LoginPage;