import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../protect_service/authContext.jsx';
import 'leaflet/dist/leaflet.css';

import './App.css';

import Login from '../auth/login.jsx';
import Register from '../auth/register.jsx';
import Messages from '../pages/message_src/messages.jsx';
import MapComponent from '../pages/map/MapComponent.jsx';
import ProtectedRoute from '../protect_service/ProtectedRoute.jsx'
import Home from '../pages/home/Home.jsx';
import AdminPage from '../pages/admin/admin_component.jsx';

// Навигационная панель

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <ul className="left-nav">
        <li><Link to="/map" className="active">Карта</Link></li>
        <li><Link to="/messages" className="active">Сообщения</Link></li>
        {user && user.roles && user.roles.includes('admin') && (
          <li><Link to="/admin" className="active">Админ</Link></li>
        )}
      </ul>
      <ul className="right-nav">
        {user ? (
          <>
            <li><span className="user-greeting">{user.username}</span></li>
            <li><button className="logout-button" onClick={logout}>Выйти</button></li>
          </>
         ) : ( 
          <>
            <li><Link to="/login" className="active">Логин</Link></li>
            <li><Link to="/register" className="active">Регистрация</Link></li>
          </>
         )} 
      </ul>
    </nav>
  );
};


// Основной компонент приложения
const App = () => {
  return (
    <Router>
    <AuthProvider> 
      <div className="App">
       <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<ProtectedRoute><MapComponent /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      </AuthProvider>
    </Router>
    
  );
};

export default App;



