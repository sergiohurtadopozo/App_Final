// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import './components/Styles/App.css'; // Asegúrate de que la ruta sea correcta

function App() {
  const [role, setRole] = useState(null);

  // Función para actualizar el rol leyendo el token de localStorage
  const updateRoleFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (error) {
        console.error("Error decodificando el token:", error);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  };

  // Llama a la función una vez al montar el componente
  useEffect(() => {
    updateRoleFromToken();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <h1 className="app-title">Aplicación de Tareas y Autenticación</h1>
        <nav className="navbar">
          <Link to="/">Inicio</Link> |{' '}
          <Link to="/signup">Registro</Link> |{' '}
          <Link to="/login">Login</Link> |{' '}
          <Link to="/dashboard">Dashboard Usuario</Link>
          {role === 'admin' && (
            <>
              {' '}| <Link to="/admin">Dashboard Admin</Link>
            </>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Pasa updateRoleFromToken al Login para actualizar el rol dinámicamente */}
          <Route path="/login" element={<Login onAuthSuccess={updateRoleFromToken} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
