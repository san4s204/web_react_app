import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../protect_service/authContext';
import styles from './login.module.css'; // Импортируем CSS-модуль
import logo from '../pages/home/logo.png'; // Импортируем логотип

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('roles', JSON.stringify(data.roles));
      localStorage.setItem('id', data.id)

      login(data.access_token, data.refresh_token, data.username, data.roles);
      
      setMessage('Login successful');
      navigate('/map');
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.overlay}></div>
      <div className={styles.loginContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h2>Войти</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Логин:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label>Пароль:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Войти</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Login;