import { useState, useEffect } from 'react';
import { getEvents, getArticles, getProblems, logoutUser } from '../api';

function ManagerDashboard({ user, onLogout }) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateProblem, setShowCreateProblem] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ''
  });

  const [newProblem, setNewProblem] = useState({
    title: '',
    timeLimit: '',
    memoryLimit: '',
    statement: '',
    tags: ''
  });

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

  const handleGenerateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    // TODO: Save this code to backend for session tracking
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in title and content');
      return;
    }
    // TODO: Implement API call to create article
    alert('Article created! (API integration needed)');
    setNewPost({ title: '', content: '', tags: '' });
    setShowCreatePost(false);
    fetchData();
  };

  const handleCreateProblem = async () => {
    if (!newProblem.title.trim() || !newProblem.statement.trim()) {
      alert('Please fill in title and statement');
      return;
    }
    // TODO: Implement API call to create problem
    alert('Problem created! (API integration needed)');
    setNewProblem({ title: '', timeLimit: '', memoryLimit: '', statement: '', tags: '' });
    setShowCreateProblem(false);
    fetchData();
  };

  const handleRecordAttendance = async () => {
    if (!sessionCode.trim()) {
      setAttendanceMessage('Please enter session code');
      return;
    }
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
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      marginBottom: '10px',
      backgroundColor: isPast ? '#f9fafb' : 'white'
    }}>
      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#1f2937' }}>
        {event.name}
      </h4>
      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
        📅 {new Date(event.startDate).toLocaleDateString()}
      </p>
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
          <h1 style={{ margin: 0, fontSize: '20px' }}>🚀 Hub (Manager)</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            + Post
          </button>
          <button
            onClick={() => setShowCreateProblem(!showCreateProblem)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            + Problem
          </button>
          <button
            onClick={() => setShowGenerateCode(!showGenerateCode)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔐 Code
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
              fontSize: '12px'
            }}
          >
            Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Create Post Section */}
        {showCreatePost && (
          <section style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '2px solid #10b981'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
              ✏️ Create New Post
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <textarea
              placeholder="Content"
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '100px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newPost.tags}
              onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleCreatePost}
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
              Publish
            </button>
          </section>
        )}

        {/* Create Problem Section */}
        {showCreateProblem && (
          <section style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '2px solid #f59e0b'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
              🧩 Create New Problem
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={newProblem.title}
              onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="number"
                placeholder="Time Limit (seconds)"
                value={newProblem.timeLimit}
                onChange={(e) => setNewProblem({...newProblem, timeLimit: e.target.value})}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <input
                type="number"
                placeholder="Memory Limit (MB)"
                value={newProblem.memoryLimit}
                onChange={(e) => setNewProblem({...newProblem, memoryLimit: e.target.value})}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <textarea
              placeholder="Problem Statement"
              value={newProblem.statement}
              onChange={(e) => setNewProblem({...newProblem, statement: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '100px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newProblem.tags}
              onChange={(e) => setNewProblem({...newProblem, tags: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleCreateProblem}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Add Problem
            </button>
          </section>
        )}

        {/* Generate Session Code Section */}
        {showGenerateCode && (
          <section style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '2px solid #8b5cf6'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
              🔐 Generate Attendance Code
            </h3>
            <button
              onClick={handleGenerateCode}
              style={{
                padding: '10px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '10px'
              }}
            >
              Generate New Code
            </button>
            {generatedCode && (
              <div style={{
                padding: '15px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                border: '2px solid #8b5cf6'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280' }}>
                  Share this code with participants:
                </p>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#8b5cf6',
                  textAlign: 'center',
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  {generatedCode}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Events and Articles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          {/* Left: Events */}
          <div>
            <section style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '6px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1f2937' }}>
                📅 Upcoming ({upcomingEvents.length})
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {upcomingEvents.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>None</p>
                ) : (
                  upcomingEvents.map(e => <EventCard key={e._id} event={e} />)
                )}
              </div>
            </section>

            <section style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1f2937' }}>
                📚 Past ({pastEvents.length})
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {pastEvents.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>None</p>
                ) : (
                  pastEvents.map(e => <EventCard key={e._id} event={e} />)
                )}
              </div>
            </section>
          </div>

          {/* Right: Articles */}
          <section style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1f2937' }}>
              📝 Latest Articles
            </h3>
            
            {/* Tag Filter */}
            <div style={{ marginBottom: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: !selectedTag ? '#3b82f6' : '#e5e7eb',
                  color: !selectedTag ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: selectedTag === tag ? '#3b82f6' : '#e5e7eb',
                    color: selectedTag === tag ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Articles */}
            <div style={{ maxHeight: '650px', overflowY: 'auto' }}>
              {filteredArticles.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#6b7280' }}>No articles</p>
              ) : (
                filteredArticles.map(article => (
                  <div
                    key={article._id}
                    style={{
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#1f2937' }}>
                      {article.title}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#6b7280' }}>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#374151', lineHeight: '1.4' }}>
                      {article.content.substring(0, 100)}...
                    </p>
                    {article.tags && article.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {article.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              backgroundColor: '#dbeafe',
                              color: '#0369a1',
                              borderRadius: '2px'
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
        </div>

        {/* Problems Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginTop: '20px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#1f2937' }}>
            💻 Problem Bank ({problems.length})
          </h3>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {problems.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>No problems yet</p>
            ) : (
              problems.map(problem => (
                <div
                  key={problem._id}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#1f2937' }}>
                    {problem.title}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#6b7280' }}>
                    ⏱️ {problem.timeLimit}s • 💾 {problem.memoryLimit}MB
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#374151', lineHeight: '1.4' }}>
                    {problem.statement.substring(0, 100)}...
                  </p>
                  {problem.tags && problem.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {problem.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            borderRadius: '2px'
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
    </div>
  );
}

export default ManagerDashboard;
