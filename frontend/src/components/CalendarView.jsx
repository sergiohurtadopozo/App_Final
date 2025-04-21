// src/components/CalendarView.jsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import './Styles/CalendarView.css';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('dayGridMonth');           // estado usado
  const [statusFilter, setStatusFilter] = useState('all');    // estado usado
  const calendarRef = useRef(null);

  // Carga inicial de eventos
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/tasks', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(r => r.json())
      .then(data => {
        const evs = data
          .filter(t => t.dueDate)
          .map(t => ({
            id: t.id,
            title: `${t.title} — ${t.User?.username || ''}`,
            date: t.dueDate.split('T')[0],
            extendedProps: { status: t.status }
          }));
        setEvents(evs);
      })
      .catch(console.error);
  }, []);

  // Maneja el drag & drop
  const handleEventDrop = info => {
    const newDate = info.event.start.toISOString();
    const token = localStorage.getItem('token');
    fetch(`/tasks/${info.event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ dueDate: newDate })
    })
      .then(r => {
        if (!r.ok) throw new Error('Error actualizando fecha');
        return r.json();
      })
      .catch(err => {
        console.error(err);
        info.revert();
      });
  };

  // Filtra eventos según statusFilter
  const filteredEvents = events.filter(e =>
    statusFilter === 'all' || e.extendedProps.status === statusFilter
  );

  return (
    <div className="calendar-container">
      <div className="calendar-controls">
        <label>
          Vista:
          <select
            value={view}
            onChange={e => {
              const v = e.target.value;
              setView(v);  
              calendarRef.current.getApi().changeView(v);
            }}
          >
            <option value="dayGridMonth">Mes</option>
            <option value="timeGridWeek">Semana</option>
            <option value="timeGridDay">Día</option>
          </select>
        </label>

        <label>
          Estado:
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
        </label>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        editable={true}
        selectable={true}
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
