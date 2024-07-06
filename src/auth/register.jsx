import React, { useState } from 'react';
import styles from './register.module.css'; // Import the CSS module
import logo from '../pages/home/logo.png'; // Import the logo

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password}),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Registration successful');
      // Redirect to login or another page if needed
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.overlay}></div>
      <div className={styles.registerContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Логин:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Регистрация</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Register;
