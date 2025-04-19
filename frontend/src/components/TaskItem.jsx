// src/components/TaskItem.jsx
import React, { useState } from 'react';
import './Styles/TaskItem.css';

function TaskItem({ task, onTaskChange }) {
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedStatus, setEditedStatus] = useState(task.status);
  const token = localStorage.getItem('token');

  // 1. Eliminar tarea
  const handleDelete = () => {
    fetch(`/tasks/${task.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(() => onTaskChange())
      .catch(err => console.error("Error al eliminar:", err));
  };

  // 2. Guardar edición
  const handleEditSubmit = e => {
    e.preventDefault();
    fetch(`/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        title: editedTitle,
        description: editedDescription,
        status: editedStatus
      })
    })
      .then(res => res.json())
      .then(() => {
        setEditing(false);
        onTaskChange();
      })
      .catch(err => console.error("Error al actualizar:", err));
  };

  // 3. Alternar estado pending↔completed
  const handleToggleStatus = () => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    fetch(`/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => onTaskChange())
      .catch(err => console.error("Error al cambiar estado:", err));
  };

  return (
    <div className="task-item">
      {editing ? (
        <form onSubmit={handleEditSubmit} className="task-form-edit">
          <input
            type="text"
            value={editedTitle}
            onChange={e => setEditedTitle(e.target.value)}
            placeholder="Título"
            required
          /><br/>
          <input
            type="text"
            value={editedDescription}
            onChange={e => setEditedDescription(e.target.value)}
            placeholder="Descripción"
          /><br/>
          <select
            value={editedStatus}
            onChange={e => setEditedStatus(e.target.value)}
          >
            <option value="pending">Pendiente</option>
            <option value="completed">Completada</option>
          </select><br/>
          <button type="submit" className="edit-button">Guardar</button>
          <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
        </form>
      ) : (
        <div>
          <h3 className={task.status === 'completed' ? 'completed' : ''}>
            {task.title}
          </h3>
          <p>{task.description}</p>
          <p className="task-status"><strong>Estado:</strong> {task.status}</p>
          {task.User && (
            <p className="user-info">
              <strong>Creado por:</strong> {task.User.username} ({task.User.email})
            </p>
          )}

          {/* Botón para alternar estado */}
          <button onClick={handleToggleStatus} className="toggle-button">
            {task.status === 'pending' ? 'Marcar completada' : 'Marcar pendiente'}
          </button>
          <button onClick={() => setEditing(true)} className="edit-button">Editar</button>
          <button onClick={handleDelete} className="delete-button">Eliminar</button>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
