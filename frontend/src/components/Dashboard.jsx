// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './Styles/Dashboard.css';  // Ajusta la ruta si Dashboard.css está en otra carpeta

function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token) {
      fetch('/profile', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      .then(response => response.json())
      .then(data => setProfile(data))
      .catch(error => console.error('Error al obtener perfil:', error));
    }
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {profile ? (
        <div>
          <p><strong>Nombre de usuario:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          {/* Aquí puedes mostrar más información o agregar funcionalidades */}
        </div>
      ) : (
        <p>Cargando perfil...</p>
      )}
    </div>
  );
}

export default Dashboard;
