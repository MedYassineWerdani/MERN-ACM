import { useState, useEffect } from 'react';
import { getMembersWithAttendance, getManagersWithAttendance, getEventInterestSummary, logoutUser } from '../api';
import '../styles/shared.css';

function OfficeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'members') {
        const data = await getMembersWithAttendance();
        if (data.error) {
          setError(data.error);
        } else {
          setMembers(data.data || []);
        }
      } else if (activeTab === 'managers') {
        const data = await getManagersWithAttendance();
        if (data.error) {
          setError(data.error);
        } else {
          setManagers(data.data || []);
        }
      } else if (activeTab === 'events') {
        const data = await getEventInterestSummary();
        if (data.error) {
          setError(data.error);
        } else {
          setEvents(data.data || []);
        }
      }
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    borderRadius: isActive ? '8px 8px 0 0' : '8px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#3b82f6' : '#e5e7eb',
    color: isActive ? 'white' : '#374151',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    marginRight: '8px',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>📊 Office Dashboard</h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#d1d5db' }}>Welcome, {user.fullName}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            👤 Profile
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <>
          <div
            onClick={() => setShowProfile(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 1000,
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: '0' }}>Profile Information</h3>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Handle:</strong> {user.handle}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <span style={{ backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>{user.role.toUpperCase()}</span></p>
            <button
              onClick={() => setShowProfile(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Tab Navigation */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button style={tabStyle(activeTab === 'members')} onClick={() => setActiveTab('members')}>
            👥 Members ({members.length})
          </button>
          <button style={tabStyle(activeTab === 'managers')} onClick={() => setActiveTab('managers')}>
            👔 Managers ({managers.length})
          </button>
          <button style={tabStyle(activeTab === 'events')} onClick={() => setActiveTab('events')}>
            📅 Event Interest ({events.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading data...
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            Error: {error}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && !loading && (
          <div>
            {members.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
                No members found
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Full Name</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Handle</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Email</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Events Attended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => (
                      <tr
                        key={member._id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white'
                        }}
                      >
                        <td style={{ padding: '12px', color: '#1f2937' }}>
                          {member.fullName}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>
                          @{member.handle}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                          {member.email}
                        </td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center',
                          color: '#1f2937',
                          fontWeight: '600'
                        }}>
                          <span style={{
                            backgroundColor: member.attendanceCount > 0 ? '#dbeafe' : '#e5e7eb',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '14px'
                          }}>
                            {member.attendanceCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Managers Tab */}
        {activeTab === 'managers' && !loading && (
          <div>
            {managers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
                No managers found
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Full Name</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Handle</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Email</th>
                      <th style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#374151'
                      }}>Events Attended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager, idx) => (
                      <tr
                        key={manager._id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white'
                        }}
                      >
                        <td style={{ padding: '12px', color: '#1f2937' }}>
                          {manager.fullName}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>
                          @{manager.handle}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>
                          {manager.email}
                        </td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center',
                          color: '#1f2937',
                          fontWeight: '600'
                        }}>
                          <span style={{
                            backgroundColor: manager.attendanceCount > 0 ? '#dbeafe' : '#e5e7eb',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '14px'
                          }}>
                            {manager.attendanceCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Events Interest Tab */}
        {activeTab === 'events' && !loading && (
          <div>
            {events.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
                No events found
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {events.map(event => (
                  <div
                    key={event._id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '18px' }}>
                          {event.name}
                        </h3>
                        <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '13px' }}>
                          📍 {event.location}
                        </p>
                        <p style={{ margin: '0', color: '#6b7280', fontSize: '13px' }}>
                          📅 {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{
                        backgroundColor: '#f3f4f6',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#3b82f6' }}>
                          {event.interestCounts.total}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>total interests</div>
                      </div>
                    </div>

                    {/* Interest Breakdown */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '12px',
                      marginBottom: '15px'
                    }}>
                      <div style={{
                        backgroundColor: '#dbeafe',
                        padding: '12px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        border: '1px solid #93c5fd'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: '#0369a1' }}>
                          {event.interestCounts.interested}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1' }}>👍 Interested</div>
                      </div>

                      <div style={{
                        backgroundColor: '#fef3c7',
                        padding: '12px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        border: '1px solid #fcd34d'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: '#b45309' }}>
                          {event.interestCounts.going}
                        </div>
                        <div style={{ fontSize: '12px', color: '#b45309' }}>✓ Going</div>
                      </div>

                      <div style={{
                        backgroundColor: '#fee2e2',
                        padding: '12px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        border: '1px solid #fca5a5'
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: '#991b1b' }}>
                          {event.interestCounts.notInterested}
                        </div>
                        <div style={{ fontSize: '12px', color: '#991b1b' }}>👎 Not Interested</div>
                      </div>
                    </div>

                    {/* User Lists */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                      {/* Going Users */}
                      {event.going.length > 0 && (
                        <div style={{
                          backgroundColor: '#fef9c3',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #fde047'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#854d0e', fontSize: '13px', fontWeight: '600' }}>
                            ✓ Going ({event.going.length})
                          </h4>
                          <div style={{ fontSize: '12px', color: '#7c2d12', lineHeight: '1.6' }}>
                            {event.going.map(user => (
                              <div key={user.userId?._id || user.userId}>
                                <strong>{user.userId?.fullName || 'Unknown'}</strong> (@{user.userId?.handle || 'unknown'})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interested Users */}
                      {event.interested.length > 0 && (
                        <div style={{
                          backgroundColor: '#cffafe',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #a5f3fc'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#0e5a6b', fontSize: '13px', fontWeight: '600' }}>
                            👍 Interested ({event.interested.length})
                          </h4>
                          <div style={{ fontSize: '12px', color: '#164e63', lineHeight: '1.6' }}>
                            {event.interested.map(user => (
                              <div key={user.userId?._id || user.userId}>
                                <strong>{user.userId?.fullName || 'Unknown'}</strong> (@{user.userId?.handle || 'unknown'})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Not Interested Users */}
                      {event.notInterested.length > 0 && (
                        <div style={{
                          backgroundColor: '#fecaca',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #fca5a5'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#7f1d1d', fontSize: '13px', fontWeight: '600' }}>
                            👎 Not Interested ({event.notInterested.length})
                          </h4>
                          <div style={{ fontSize: '12px', color: '#7f1d1d', lineHeight: '1.6' }}>
                            {event.notInterested.map(user => (
                              <div key={user.userId?._id || user.userId}>
                                <strong>{user.userId?.fullName || 'Unknown'}</strong> (@{user.userId?.handle || 'unknown'})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficeDashboard;
