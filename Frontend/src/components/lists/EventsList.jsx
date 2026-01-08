import '../../styles/shared.css';

export function EventsList({ events, title }) {
  if (events.length === 0) {
    return <p className="empty-state">No {title.toLowerCase()} events</p>;
  }

  return (
    <div>
      {events.map(event => (
        <div key={event._id} className="card">
          <div className="card-title">📅 {event.name}</div>
          <div className="card-meta">
            {new Date(event.startDate).toLocaleDateString()} -{' '}
            {new Date(event.endDate).toLocaleDateString()}
          </div>
          <div className="card-preview">{event.description}</div>
        </div>
      ))}
    </div>
  );
}
