import { useState, useEffect } from 'react';
import { updateEventInterest, getCurrentUser } from '../../api';
import '../../styles/shared.css';

export function EventModal({ event, onClose, onInterestUpdate }) {
  const [userInterest, setUserInterest] = useState(null);
  const [interestCounts, setInterestCounts] = useState({
    interested: 0,
    not_interested: 0,
    going: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize from event data
  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (event.userInterests && Array.isArray(event.userInterests) && currentUser) {
      // Find current user's interest from the list by comparing user IDs
      const currentUserInterest = event.userInterests.find(ui => 
        (typeof ui.userId === 'string' ? ui.userId : ui.userId?._id) === currentUser._id
      );
      if (currentUserInterest) {
        setUserInterest(currentUserInterest.status);
      } else {
        setUserInterest(null);
      }
    }
    
    // Calculate interest counts
    if (event.userInterests && Array.isArray(event.userInterests)) {
      const counts = {
        interested: event.userInterests.filter(ui => ui.status === 'interested').length,
        not_interested: event.userInterests.filter(ui => ui.status === 'not_interested').length,
        going: event.userInterests.filter(ui => ui.status === 'going').length
      };
      setInterestCounts(counts);
    }
  }, [event]);

  const handleInterestClick = async (status) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Toggle: if same status is clicked, remove interest
    const newStatus = userInterest === status ? null : status;
    
    const result = await updateEventInterest(event._id, newStatus);
    
    if (result.error) {
      console.error('Error updating interest:', result.error);
    } else {
      setUserInterest(result.userStatus);
      setInterestCounts(result.interestCounts);
      // Optionally refresh all events
      if (onInterestUpdate) {
        onInterestUpdate();
      }
    }
    
    setIsUpdating(false);
  };

  const getButtonStyle = (btnStatus) => {
    const isActive = userInterest === btnStatus;
    return {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '13px',
      fontWeight: '500',
      cursor: isUpdating ? 'not-allowed' : 'pointer',
      opacity: isUpdating ? 0.6 : 1,
      backgroundColor: isActive ? (
        btnStatus === 'interested' ? '#10b981' :
        btnStatus === 'not_interested' ? '#ef4444' :
        '#f59e0b'
      ) : '#e5e7eb',
      color: isActive ? 'white' : '#374151',
      transition: 'all 0.2s'
    };
  };

  if (!event) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1000
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ✕
        </button>

        {/* Event Details */}
        <h2 style={{ marginTop: '0', color: '#1f2937' }}>{event.name}</h2>
        
        <div style={{ marginBottom: '20px', color: '#6b7280' }}>
          <p style={{ margin: '8px 0' }}>
            <strong>📍 Location:</strong> {event.location}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>🌐 Type:</strong> {event.type === 'in-house' ? '🏢 In-House' : event.type === 'online' ? '🌐 Online' : '📌 Extra'}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>📅 Start:</strong> {new Date(event.startDate).toLocaleString()}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>📅 End:</strong> {new Date(event.endDate).toLocaleString()}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>👥 Registered:</strong> {event.registeredUsers?.length || 0} members
          </p>
          {event.fees > 0 && (
            <p style={{ margin: '8px 0', color: '#92400e', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '4px' }}>
              <strong>💰 Fees:</strong> ${event.fees}
            </p>
          )}
        </div>

        {/* Description */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          color: '#374151',
          lineHeight: '1.6'
        }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: '#1f2937' }}>Description:</strong>
          {event.description || 'No description provided'}
        </div>

        {/* Interest Section */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>
              Show your interest:
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => handleInterestClick('interested')}
              style={getButtonStyle('interested')}
              disabled={isUpdating}
              title="Click to toggle interested status"
            >
              👍 Interested ({interestCounts.interested})
            </button>
            <button
              onClick={() => handleInterestClick('going')}
              style={getButtonStyle('going')}
              disabled={isUpdating}
              title="Click to toggle going status"
            >
              ✓ Going ({interestCounts.going})
            </button>
            <button
              onClick={() => handleInterestClick('not_interested')}
              style={getButtonStyle('not_interested')}
              disabled={isUpdating}
              title="Click to toggle not interested status"
            >
              👎 Not Interested ({interestCounts.not_interested})
            </button>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            💡 Tip: Click a button again to remove your interest
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Close
        </button>
      </div>
    </div>
  );
}
