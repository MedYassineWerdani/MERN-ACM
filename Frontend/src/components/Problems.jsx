import { useState, useEffect } from 'react';
import { getProblems } from '../api';

function Problems() {
  const [problems, setProblems] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProblems();
  }, [selectedTag]);

  const fetchProblems = async () => {
    setLoading(true);
    const data = await getProblems(selectedTag);
    if (data.error) {
      setError(data.error);
    } else {
      const problems = data.data || [];
      setProblems(problems);
      
      // Extract all unique tags
      const tags = new Set();
      problems.forEach(problem => {
        problem.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>💻 Recent Problems</h2>

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
                border: `2px solid ${selectedTag === null ? '#10b981' : '#d1d5db'}`,
                backgroundColor: selectedTag === null ? '#d1fae5' : 'white',
                color: selectedTag === null ? '#10b981' : '#6b7280',
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
                  border: `2px solid ${selectedTag === tag ? '#10b981' : '#d1d5db'}`,
                  backgroundColor: selectedTag === tag ? '#d1fae5' : 'white',
                  color: selectedTag === tag ? '#10b981' : '#6b7280',
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
          Loading problems...
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

      {!loading && problems.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280'
        }}>
          No problems found for this tag
        </div>
      )}

      {!loading && problems.length > 0 && (
        <div>
          {problems.map(problem => (
            <ProblemCard
              key={problem._id}
              title={problem.title}
              statement={problem.statement}
              timeLimit={problem.timeLimit}
              memoryLimit={problem.memoryLimit}
              tags={problem.tags}
              examples={problem.examples}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProblemCard({ title, statement, timeLimit, memoryLimit, tags, examples }) {
  const [expanded, setExpanded] = useState(false);

  const truncateContent = (text, length = 150) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div style={{
      border: '2px solid #10b981',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '8px',
      backgroundColor: '#f0fdf4'
    }}>
      <h3 style={{
        margin: '0 0 10px 0',
        color: '#1f2937',
        fontSize: '18px'
      }}>
        {title}
      </h3>

      <div style={{
        display: 'flex',
        gap: '20px',
        fontSize: '13px',
        color: '#10b981',
        marginBottom: '10px',
        fontWeight: '600'
      }}>
        <span>⏱️ Time: {timeLimit}ms</span>
        <span>💾 Memory: {memoryLimit}MB</span>
      </div>

      <p style={{
        color: '#374151',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0 0 10px 0'
      }}>
        {expanded ? statement : truncateContent(statement)}
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
                backgroundColor: '#dcfce7',
                color: '#166534',
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

      {expanded && examples && examples.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '15px',
          marginTop: '10px',
          marginBottom: '10px',
          fontSize: '13px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>📋 Examples:</h4>
          {examples.map((example, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ color: '#6b7280', marginBottom: '5px' }}>
                <strong>Input:</strong>
              </div>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                marginBottom: '8px',
                color: '#374151'
              }}>
                {example.input}
              </div>
              <div style={{ color: '#6b7280', marginBottom: '5px' }}>
                <strong>Output:</strong>
              </div>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#374151'
              }}>
                {example.output}
              </div>
              {idx < examples.length - 1 && (
                <hr style={{ margin: '10px 0', borderColor: '#e5e7eb' }} />
              )}
            </div>
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
            backgroundColor: '#10b981',
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
        <button
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
          💻 Solve
        </button>
      </div>
    </div>
  );
}

export default Problems;
