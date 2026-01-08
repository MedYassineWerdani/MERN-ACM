import { useState, useEffect } from 'react';
import { getEvents } from '../api';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getEvents();
    if (data.error) {
      setError(data.error);
    } else {
      setEvents(data.data || []);
    }
    setLoading(false);
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'current';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'current': return '#10b981';
      case 'past': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const groupedEvents = {
    upcoming: events.filter(e => getEventStatus(e) === 'upcoming'),
    current: events.filter(e => getEventStatus(e) === 'current'),
    past: events.filter(e => getEventStatus(e) === 'past')
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading events...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#991b1b' }}>Error: {error}</div>;
  }

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>📅 Events</h2>

      {/* Current Events */}
      {groupedEvents.current.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#10b981', fontSize: '16px', marginBottom: '15px' }}>
            🔴 Currently Happening
          </h3>
          <div>
            {groupedEvents.current.map(event => (
              <EventCard key={event._id} event={event} status="current" />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {groupedEvents.upcoming.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#3b82f6', fontSize: '16px', marginBottom: '15px' }}>
            ⬆️ Upcoming
          </h3>
          <div>
            {groupedEvents.upcoming.map(event => (
              <EventCard key={event._id} event={event} status="upcoming" />
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {groupedEvents.past.length > 0 && (
        <div>
          <h3 style={{ color: '#6b7280', fontSize: '16px', marginBottom: '15px' }}>
            ⏸️ Past Events
          </h3>
          <div>
            {groupedEvents.past.map(event => (
              <EventCard key={event._id} event={event} status="past" />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
          No events found
        </p>
      )}
    </div>
  );
}

function EventCard({ event, status }) {
  const statusColor = {
    upcoming: '#3b82f6',
    current: '#10b981',
    past: '#6b7280'
  }[status];

  return (
    <div style={{
      border: `2px solid ${statusColor}`,
      padding: '15px',
      marginBottom: '15px',
      borderRadius: '6px',
      backgroundColor: status === 'past' ? '#f3f4f6' : 'white'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '10px'
      }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>
          {event.name}
        </h3>
        <span style={{
          backgroundColor: statusColor,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>
        📍 {event.location}
      </p>

      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>
        Type: <strong>{event.type === 'in-house' ? '🏢 In-House' : '🌐 Online'}</strong>
      </p>

      <p style={{ color: '#374151', margin: '10px 0', fontSize: '14px' }}>
        {event.description}
      </p>

      <div style={{
        display: 'flex',
        gap: '20px',
        fontSize: '13px',
        color: '#6b7280',
        marginTop: '10px'
      }}>
        <span>
          📅 Start: {new Date(event.startDate).toLocaleDateString()}
        </span>
        <span>
          📅 End: {new Date(event.endDate).toLocaleDateString()}
        </span>
        <span>
          👥 {event.registeredUsers?.length || 0} registered
        </span>
      </div>

      {event.fees > 0 && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#fef3c7',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          💰 Fees: ${event.fees}
        </div>
      )}
    </div>
  );
}

export default Events;
