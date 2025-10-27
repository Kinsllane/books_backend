import React from 'react';
import { Navigate } from 'react-router-dom'; 
import { useAuthStatus } from '../../hooks/useAuthStatus'; 

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => { 
  const { activeUser } = useAuthStatus(); 

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>; 
};

export default AuthWrapper;
