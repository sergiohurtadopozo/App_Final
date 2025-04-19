// src/components/Home.jsx
import React, { useState } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import './Styles/Home.css'; // Importa el archivo de estilos para Home

function Home() {
  // Estado para refrescar la lista de tareas después de añadir una.
  const [refresh, setRefresh] = useState(false);

  const handleTaskAdded = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="home-container">
      <TaskForm onTaskAdded={handleTaskAdded} />
      <TaskList refresh={refresh} />
    </div>
  );
}

export default Home;
