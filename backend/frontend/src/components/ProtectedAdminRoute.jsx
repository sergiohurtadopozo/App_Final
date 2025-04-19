// src/components/ProtectedAdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  
  // Decodificamos el token para obtener la información del usuario (incluyendo el rol)
  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch (error) {
    console.error("Error decodificando el token", error);
    return <Navigate to="/login" />;
  }
  
  if (decoded.role !== 'admin') {
    // Si el usuario no es admin, lo redirigimos a la vista de usuario normal
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

export default ProtectedAdminRoute;
