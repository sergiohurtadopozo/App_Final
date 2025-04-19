// src/components/TaskForm.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Styles/TaskForm.css';

function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Añade el estado para dueDate
  const [dueDate, setDueDate] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          title,
          description,
          status: 'pending',
          dueDate: dueDate ? dueDate.toISOString() : null  // Envía ISO si existe
        })
      });
      const data = await response.json();
      if(response.ok) {
        setTitle('');
        setDescription('');
        setDueDate(null);        // Limpia el selector
        onTaskAdded && onTaskAdded();
      } else {
        console.error("Error al crear la tarea:", data.error);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  };

  return (
    <div className="task-form-container">
      <h2>Añadir Nueva Tarea</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          placeholder="Título de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripción de la tarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {/* Selector de fecha */}
        <label>Fecha de Vencimiento:</label>
        <DatePicker
          selected={dueDate}
          onChange={date => setDueDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Selecciona una fecha"
        />
        <button type="submit">Crear Tarea</button>
      </form>
    </div>
  );
}

export default TaskForm;
