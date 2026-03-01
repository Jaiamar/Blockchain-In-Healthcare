import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Roles: null (unauthenticated), 'patient', 'doctor', 'admin'
  const [user, setUser] = useState(null);

  const login = (role, id = null) => {
    // Simulated login
    setUser({
      role,
      id: id || `USR-${Math.floor(Math.random() * 10000)}`,
      name: role === 'patient' ? 'John Doe' : role === 'doctor' ? 'Dr. Sarah Smith' : 'Admin User'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
