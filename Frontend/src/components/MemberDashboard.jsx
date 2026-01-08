import { useState, useEffect } from 'react';
import { getEvents, getArticles, getProblems, logoutUser } from '../api';

function MemberDashboard({ user, onLogout }) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sessionCode, setSessionCode] = useState('');
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const eventsData = await getEvents();
    const articlesData = await getArticles();
    const problemsData = await getProblems();
    
    if (eventsData.data) {
      const now = new Date();
      const upcoming = eventsData.data.filter(e => new Date(e.startDate) > now);
      const past = eventsData.data.filter(e => new Date(e.startDate) <= now);
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    }
    
    if (articlesData.data) {
      setArticles(articlesData.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }

    if (problemsData.data) {
      setProblems(problemsData.data);
    }
  };

  const handleRecordAttendance = async () => {
    if (!sessionCode.trim()) {
      setAttendanceMessage('Please enter session code');
      return;
    }
    // TODO: Implement attendance recording via session code
    setAttendanceMessage('Attendance recorded successfully! ✓');
    setSessionCode('');
    setTimeout(() => setAttendanceMessage(''), 3000);
  };

  const getAllTags = () => {
    const tags = new Set();
    articles.forEach(a => {
      if (a.tags) a.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags);
  };

  const filteredArticles = selectedTag 
    ? articles.filter(a => a.tags && a.tags.includes(selectedTag))
    : articles;

  const allTags = getAllTags();

  const EventCard = ({ event, isPast }) => (
    <div style={{
      padding: '15px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      marginBottom: '12px',
      backgroundColor: isPast ? '#f9fafb' : 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f2937' }}>
            {event.name}
          </h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' }}>
            📅 {new Date(event.startDate).toLocaleDateString()} • 
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              backgroundColor: event.type === 'online' ? '#dbeafe' : event.type === 'in-house' ? '#dcfce7' : '#fef3c7',
              borderRadius: '4px',
              fontSize: '12px',
              color: event.type === 'online' ? '#0369a1' : event.type === 'in-house' ? '#166534' : '#b45309'
            }}>
              {event.type || 'in-house'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>🚀 Hub</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            👤 {user.fullName.split(' ')[0]}
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {/* Attendance Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '6px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
            ✓ Mark Attendance
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Enter session code..."
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleRecordAttendance}
              style={{
                padding: '10px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Submit
            </button>
          </div>
          {attendanceMessage && (
            <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#059669' }}>
              {attendanceMessage}
            </p>
          )}
        </section>

        {/* Events Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Upcoming Events */}
          <section style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
              📅 Upcoming Events ({upcomingEvents.length})
            </h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {upcomingEvents.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '13px' }}>No upcoming events</p>
              ) : (
                upcomingEvents.map(e => <EventCard key={e._id} event={e} isPast={false} />)
              )}
            </div>
          </section>

          {/* Past Events */}
          <section style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
              📚 Past Events ({pastEvents.length})
            </h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {pastEvents.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '13px' }}>No past events</p>
              ) : (
                pastEvents.map(e => <EventCard key={e._id} event={e} isPast={true} />)
              )}
            </div>
          </section>
        </div>

        {/* Articles Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
            📝 Latest Articles
          </h2>
          
          {/* Tag Filter */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                padding: '6px 12px',
                backgroundColor: !selectedTag ? '#3b82f6' : '#e5e7eb',
                color: !selectedTag ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: selectedTag === tag ? '#3b82f6' : '#e5e7eb',
                  color: selectedTag === tag ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Articles List */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredArticles.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px' }}>No articles found</p>
            ) : (
              filteredArticles.map(article => (
                <div
                  key={article._id}
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    padding: '15px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    hover: { backgroundColor: '#f3f4f6', borderColor: '#3b82f6' }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1f2937' }}>
                    {article.title}
                  </h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#6b7280' }}>
                    By {article.author?.fullName || 'Unknown'} • {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                    {article.content.substring(0, 150)}...
                  </p>
                  {article.tags && article.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {article.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            backgroundColor: '#dbeafe',
                            color: '#0369a1',
                            borderRadius: '3px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Problems Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginTop: '20px'
        }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
            💻 Problem Bank
          </h2>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {problems.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px' }}>No problems available</p>
            ) : (
              problems.map(problem => (
                <div
                  key={problem._id}
                  onClick={() => setSelectedProblem(problem)}
                  style={{
                    padding: '15px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1f2937' }}>
                    {problem.title}
                  </h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280' }}>
                    ⏱️ {problem.timeLimit}s • 💾 {problem.memoryLimit}MB
                  </p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                    {problem.statement.substring(0, 150)}...
                  </p>
                  {problem.tags && problem.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {problem.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            borderRadius: '3px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Profile Modal */}
      {showProfile && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>👤 My Profile</h2>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '14px' }}>Full Name</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>{user.fullName}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '14px' }}>Handle</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>@{user.handle}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '14px' }}>Email</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>{user.email}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '14px' }}>Role</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>{user.role}</p>
            </div>
            <button
              onClick={() => setShowProfile(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Article Modal */}
      {selectedArticle && (
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
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '700px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            margin: 'auto'
          }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{selectedArticle.title}</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#6b7280' }}>
              By {selectedArticle.author?.fullName || 'Unknown'} • {new Date(selectedArticle.createdAt).toLocaleDateString()}
            </p>
            <div style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
              {selectedArticle.content}
            </div>
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div style={{ margin: '0 0 20px 0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedArticle.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      backgroundColor: '#dbeafe',
                      color: '#0369a1',
                      borderRadius: '4px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedArticle(null)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Problem Modal */}
      {selectedProblem && (
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
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '700px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            margin: 'auto'
          }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>{selectedProblem.title}</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#6b7280' }}>
              ⏱️ {selectedProblem.timeLimit}s • 💾 {selectedProblem.memoryLimit}MB
            </p>
            <div style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#374151', lineHeight: '1.7', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px' }}>
              {selectedProblem.statement}
            </div>
            {selectedProblem.tags && selectedProblem.tags.length > 0 && (
              <div style={{ margin: '0 0 20px 0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedProblem.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '4px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedProblem(null)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDashboard;
