import { useState } from 'react';
import { EventModal } from '../modals/EventModal';
import '../../styles/shared.css';

export function EventsList({ events, title, onInterestUpdate }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (events.length === 0) {
    return <p className="empty-state">No {title.toLowerCase()} events</p>;
  }

  return (
    <div>
      {events.map(event => (
        <div 
          key={event._id} 
          className="card"
          onClick={() => setSelectedEvent(event)}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
        >
          <div className="card-title">📅 {event.name}</div>
          <div className="card-meta">
            {new Date(event.startDate).toLocaleDateString()} -{' '}
            {new Date(event.endDate).toLocaleDateString()}
          </div>
          <div className="card-preview">{event.description}</div>
          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '8px' }}>
            ➜ Click to view details and show interest
          </div>
        </div>
      ))}
      
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onInterestUpdate={onInterestUpdate}
        />
      )}
    </div>
  );
}
