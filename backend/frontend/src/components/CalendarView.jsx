// src/components/CalendarView.jsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Importa también los CSS oficiales de FullCalendar:

// Importa tu CSS personalizado
import './Styles/CalendarView.css';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('dayGridMonth');
  const [statusFilter, setStatusFilter] = useState('all');
  const calendarRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/tasks', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(data => {
        const evs = data
          .filter(t => t.dueDate)
          .map(t => ({
            id: t.id,
            title: `${t.title} — ${t.User?.username || '—'}`,
            date: t.dueDate.split('T')[0],
            extendedProps: { status: t.status }
          }));
        setEvents(evs);
      })
      .catch(err => console.error("Error cargando tareas para calendario:", err));
  }, []);

  const handleEventDrop = (info) => {
    const { id } = info.event;
    const newDate = info.event.start.toISOString();
    const token = localStorage.getItem('token');

    fetch(`/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ dueDate: newDate })
    })
    .then(res => {
      if (!res.ok) throw new Error('Error actualizando fecha');
      return res.json();
    })
    .catch(err => {
      console.error(err);
      info.revert(); // si falla, vuelve atrás
    });
  };

  const filteredEvents = events.filter(e =>
    statusFilter === 'all' || e.extendedProps.status === statusFilter
  );

  return (
    <div className="calendar-container">
      <div className="calendar-controls">
        {/* controles de vista y filtro */}
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
        initialView={view}
        editable={true}        // ← habilita drag & drop interno
        selectable={true}      // ← (opcional) permite seleccionar rango
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        events={filteredEvents}
        eventDrop={handleEventDrop}
        height="auto"
      />
    </div>
  );
}

export default CalendarView;
