// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import './Styles/AdminDashboard.css'; // Importa el archivo de estilos
import CalendarView from './CalendarView';

function AdminDashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // El endpoint GET /tasks en el back-end, si el usuario es admin, debe incluir los datos del usuario en cada tarea
    fetch('/tasks', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error("Error al obtener las tareas:", error));
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h1>Panel de Administración</h1>
      <h2>Listado Global de Tareas</h2>
      {/* Vista de calendario con las fechas de vencimiento */}
      <CalendarView />
      {tasks.length > 0 ? (
        tasks.map(task => (
          <div key={task.id} className="task-card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p><strong>Estado:</strong> {task.status}</p>
            {task.User && (
              <p className="user-info">
                <strong>Creado por:</strong> {task.User.username} ({task.User.email})
              </p>
            )}
          </div>
        ))
      ) : (
        <p>No hay tareas.</p>
      )}
    </div>
  );
}

export default AdminDashboard;
