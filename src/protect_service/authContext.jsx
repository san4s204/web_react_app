import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const refreshAccessToken = useCallback(async (refreshToken) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setUser(prevState => ({ ...prevState, token: data.access_token }));
      } else {
        throw new Error('Failed to refresh access token');
      }
    } catch (error) {
      console.log('Refresh token has expired');
      logout();
    }
  }, [logout]);

  useEffect(() => {
    
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const username = localStorage.getItem('username');
    let roles = localStorage.getItem('roles');

    if (roles) {
      roles = JSON.parse(roles);
    }

    

    if (token && refreshToken && username && roles) {
      setUser({ token, refreshToken, username, roles });
    }
    setLoading(false);

    const interval = setInterval(() => {
      if (refreshToken) {
        refreshAccessToken(refreshToken);
      }
    }, 60 * 1000); // Обновление токена каждую минуту

    return () => clearInterval(interval);
  }, [refreshAccessToken]);

  const login = (token, refreshToken, username, roles) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('username', username);
    localStorage.setItem('roles', JSON.stringify(roles));
    setUser({ token, refreshToken, username, roles });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
