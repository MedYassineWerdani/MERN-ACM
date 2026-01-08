import { useState, useEffect } from 'react';
import { getArticles } from '../api';

function Blogs() {
  const [articles, setArticles] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [selectedTag]);

  const fetchArticles = async () => {
    setLoading(true);
    const data = await getArticles(selectedTag);
    if (data.error) {
      setError(data.error);
    } else {
      const articles = data.data || [];
      setArticles(articles);
      
      // Extract all unique tags
      const tags = new Set();
      articles.forEach(article => {
        article.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>📚 Recent Blogs & Articles</h2>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
            Filter by tag:
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: `2px solid ${selectedTag === null ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: selectedTag === null ? '#dbeafe' : 'white',
                color: selectedTag === null ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `2px solid ${selectedTag === tag ? '#3b82f6' : '#d1d5db'}`,
                  backgroundColor: selectedTag === tag ? '#dbeafe' : 'white',
                  color: selectedTag === tag ? '#3b82f6' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading articles...
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280'
        }}>
          No articles found for this tag
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div>
          {articles.map(article => (
            <Article
              key={article._id}
              title={article.title}
              author={article.author?.fullName || 'Unknown'}
              content={article.content}
              tags={article.tags}
              problem={article.problem?.title}
              event={article.event?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Article({ title, author, content, tags, problem, event }) {
  const [expanded, setExpanded] = useState(false);

  const truncateContent = (text, length = 200) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <article style={{
      border: '1px solid #ddd',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '8px',
      backgroundColor: '#fafafa'
    }}>
      <h3 style={{
        margin: '0 0 10px 0',
        color: '#1f2937',
        fontSize: '18px'
      }}>
        {title}
      </h3>

      <p style={{
        color: '#666',
        fontSize: '14px',
        margin: '0 0 10px 0'
      }}>
        ✍️ Written by <strong>{author}</strong>
      </p>

      {(problem || event) && (
        <p style={{
          color: '#666',
          fontSize: '13px',
          margin: '0 0 10px 0'
        }}>
          {problem && <span>📝 Problem: <strong>{problem}</strong></span>}
          {problem && event && <span> • </span>}
          {event && <span>📅 Event: <strong>{event}</strong></span>}
        </p>
      )}

      <p style={{
        color: '#374151',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0 0 10px 0'
      }}>
        {expanded ? content : truncateContent(content)}
      </p>

      {tags && tags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '10px'
        }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-block',
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
      }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {expanded ? '📖 Read less' : '📖 Read more'}
        </button>
      </div>
    </article>
  );
}

export default Blogs;
