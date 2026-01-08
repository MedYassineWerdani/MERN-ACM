import { useState, useEffect } from 'react';
import { getEvents, getArticles, getProblems, logoutUser } from '../api';
import { ProfileModal } from './modals/ProfileModal';
import { ArticleModal } from './modals/ArticleModal';
import { ProblemModal } from './modals/ProblemModal';
import { EventsList } from './lists/EventsList';
import { ArticlesList } from './lists/ArticlesList';
import { ProblemsList } from './lists/ProblemsList';
import '../styles/shared.css';

function MemberDashboard({ user, onLogout }) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionCode, setSessionCode] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async () => {
    if (!sessionCode.trim()) {
      setAttendanceStatus('Please enter session code');
      setTimeout(() => setAttendanceStatus(''), 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/sessions/record', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionCode })
      });
      const data = await response.json();
      if (data.data) {
        setAttendanceStatus('✅ Attendance recorded!');
        setSessionCode('');
      } else {
        setAttendanceStatus('❌ ' + (data.error || 'Invalid code'));
      }
      setTimeout(() => setAttendanceStatus(''), 3000);
    } catch (error) {
      setAttendanceStatus('❌ Error: ' + error.message);
      setTimeout(() => setAttendanceStatus(''), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="header">
          <h1 className="header-title">📚 Member Dashboard</h1>
          <div className="header-actions">
            <button onClick={() => setShowProfile(true)} className="btn btn-primary">
              👤 Profile
            </button>
            <button onClick={onLogout} className="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Attendance */}
        <section className="section">
          <h3 className="section-title">✅ Record Attendance</h3>
          {attendanceStatus && (
            <div className={`message ${attendanceStatus.includes('✅') ? 'success' : 'error'}`}>
              {attendanceStatus}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={handleAttendance} className="btn btn-success">
              Submit
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

        {/* Articles */}
        <section className="section">
          <h3 className="section-title">📖 Articles ({articles.length})</h3>
          <ArticlesList articles={articles} onArticleClick={setSelectedArticle} />
        </section>

        {/* Problems */}
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

export default MemberDashboard;
