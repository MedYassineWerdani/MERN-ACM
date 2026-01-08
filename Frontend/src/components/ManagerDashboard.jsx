import { useState, useEffect } from 'react';
import { getEvents, getArticles, getProblems, logoutUser } from '../api';
import { ProfileModal } from './modals/ProfileModal';
import { ArticleModal } from './modals/ArticleModal';
import { ProblemModal } from './modals/ProblemModal';
import { EventsList } from './lists/EventsList';
import { ArticlesList } from './lists/ArticlesList';
import { ProblemsList } from './lists/ProblemsList';
import { CreateArticleForm } from './forms/CreateArticleForm';
import { CreateProblemForm } from './forms/CreateProblemForm';
import '../styles/shared.css';

function ManagerDashboard({ user, onLogout }) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [sessionCode, setSessionCode] = useState('');

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
    try {
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGenerateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    setSessionCode(code);
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setMessage('❌ Please fill in title and content');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });
      const data = await response.json();
      if (data.data) {
        setMessage('✅ Article created successfully!');
        setNewPost({ title: '', content: '', tags: '' });
        setTimeout(() => setMessage(''), 3000);
        fetchData();
      } else {
        setMessage('❌ ' + (data.error || 'Failed to create article'));
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async () => {
    if (!newProblem.title.trim() || !newProblem.statement.trim()) {
      setMessage('❌ Please fill in title and statement');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/blogs/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newProblem.title.trim(),
          statement: newProblem.statement.trim(),
          timeLimit: parseInt(newProblem.timeLimit) || 1,
          memoryLimit: parseInt(newProblem.memoryLimit) || 256,
          tags: newProblem.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });
      const data = await response.json();
      if (data.data) {
        setMessage('✅ Problem created successfully!');
        setNewProblem({ title: '', timeLimit: '', memoryLimit: '', statement: '', tags: '' });
        setTimeout(() => setMessage(''), 3000);
        fetchData();
      } else {
        setMessage('❌ ' + (data.error || 'Failed to create problem'));
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value, form = 'post') => {
    if (form === 'post') {
      setNewPost({ ...newPost, [field]: value });
    } else {
      setNewProblem({ ...newProblem, [field]: value });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="header">
          <h1 className="header-title">🎯 Manager Dashboard</h1>
          <div className="header-actions">
            <button onClick={() => setShowProfile(true)} className="btn btn-primary">
              👤 Profile
            </button>
            <button onClick={onLogout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Generate Session Code */}
        <section className="section">
          <h3 className="section-title">🎫 Generate Attendance Code</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Session code will appear here"
              value={sessionCode}
              readOnly
              style={{ flex: 1 }}
            />
            <button onClick={handleGenerateCode} className="btn btn-primary">
              Generate Code
            </button>
          </div>
        </section>

        {/* Events Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <section className="section">
            <h3 className="section-title">📅 Upcoming Events ({upcomingEvents.length})</h3>
            <EventsList events={upcomingEvents} title="Upcoming" />
          </section>

          <section className="section">
            <h3 className="section-title">📜 Past Events ({pastEvents.length})</h3>
            <EventsList events={pastEvents} title="Past" />
          </section>
        </div>

        {/* Create Article Form */}
        <CreateArticleForm
          formData={newPost}
          onFormChange={(field, value) => handleFormChange(field, value, 'post')}
          onSubmit={handleCreatePost}
          isLoading={loading}
          message={message}
        />

        {/* Articles List */}
        <section className="section">
          <h3 className="section-title">📖 Published Articles ({articles.length})</h3>
          <ArticlesList articles={articles} onArticleClick={setSelectedArticle} />
        </section>

        {/* Create Problem Form */}
        <CreateProblemForm
          formData={newProblem}
          onFormChange={(field, value) => handleFormChange(field, value, 'problem')}
          onSubmit={handleCreateProblem}
          isLoading={loading}
          message={message}
        />

        {/* Problems List */}
        <section className="section">
          <h3 className="section-title">💻 Problem Bank ({problems.length})</h3>
          <ProblemsList problems={problems} onProblemClick={setSelectedProblem} />
        </section>
      </main>

      {/* Modals */}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      {selectedProblem && <ProblemModal problem={selectedProblem} onClose={() => setSelectedProblem(null)} />}
    </div>
  );
}

export default ManagerDashboard;
