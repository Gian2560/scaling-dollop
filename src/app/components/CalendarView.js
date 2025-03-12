"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Tooltip, Typography, Paper, CircularProgress } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

// Importar el idioma español para FullCalendar
import esLocale from '@fullcalendar/core/locales/es';

// Componente del tooltip para los eventos
const EventTooltip = ({ event }) => {
  return (
    <Box>
      <Typography variant="subtitle1"><strong>{event.title}</strong></Typography>
      <Typography variant="body2">Celular: {event.extendedProps.celular}</Typography>
      <Typography variant="body2">Estado: {event.extendedProps.estado || "No definido"}</Typography>
    </Box>
  );
};

const CalendarView = ({ calendarRef, events, loading }) => {
  const [formattedEvents, setFormattedEvents] = useState([]);

  // Convertir eventos para que solo tengan la fecha sin hora
  useEffect(() => {
    const updatedEvents = events.map(event => {
      if (event.start) {
        const startDate = new Date(event.start); // Fecha de inicio
        startDate.setHours(0, 0, 0, 0); // Asegurarse que sea al inicio del día (00:00)

        // Para un evento de todo el día, no es necesario especificar el final
        const endDate = new Date(startDate); // Usamos el mismo día para el final
        endDate.setDate(startDate.getDate() + 1); // El final es al día siguiente a medianoche

        return {
          ...event,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: true, // Indicar que es un evento de todo el día
        };
      }
      return null; // Si no tiene `start`, ignorar este evento
    }).filter(event => event !== null); // Filtrar eventos nulos

    setFormattedEvents(updatedEvents); // Guardar los eventos formateados
    console.log("Eventos formateados y ajustados:", updatedEvents);
  }, [events]);

  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      {loading ? (
        // Spinner de carga
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth" // Cambiar para ver en vista mensual
            events={formattedEvents}  // Pasa los eventos ya formateados y ajustados
            height="auto"
            locale="es"  // Configurar el idioma a español
            slotMinTime="08:00:00"  // Hora mínima visible (08:00 AM)
            slotMaxTime="24:00:00"  // Hora máxima visible (24:00 es medianoche)
            allDaySlot={true}  // Asegurarse de que se muestren eventos todo el día
            nowIndicator={true}
            selectable={true}
            selectMirror={true}
            eventContent={(eventInfo) => (
              <Tooltip title={<EventTooltip event={eventInfo.event} />} arrow>
                <Box sx={{
                  padding: "6px", 
                  backgroundColor: eventInfo.event.backgroundColor, 
                  color: "#fff",
                  borderRadius: 1,  // Bordes redondeados
                }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    {eventInfo.event.title}
                  </Typography>
                  <Typography variant="caption">
                    {eventInfo.event.extendedProps.celular}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}

            // Personalizar los botones del header
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
            }}

            // Aquí personalizamos los encabezados de los días (Dom, Lun, Mar, etc.)
            dayCellContent={(day) => (
              <Typography variant="body2" sx={{ color: "#000", fontWeight: 'bold' }}>
                {day.date.getDate()}
              </Typography>
            )}

            // Para personalizar las celdas de días
            dayCellClassNames="my-custom-day-cell" // Aplicar una clase personalizada

            // Estilos personalizados para el calendario
            eventsClassNames="my-custom-event-class"
          />
        </Paper>
      )}
    </Box>
  );
};

export default CalendarView;
