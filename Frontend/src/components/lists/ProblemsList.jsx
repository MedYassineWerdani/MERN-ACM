import '../../styles/shared.css';

export function ProblemsList({ problems, onProblemClick }) {
  if (problems.length === 0) {
    return <p className="empty-state">No problems yet</p>;
  }

  return (
    <div className="scroll-container">
      {problems.map(problem => (
        <div
          key={problem._id}
          onClick={() => onProblemClick(problem)}
          className="card"
          style={{ cursor: 'pointer' }}
        >
          <div className="card-title">💻 {problem.title}</div>
          <div className="card-meta">
            ⏱️ {problem.timeLimit}s • 💾 {problem.memoryLimit}MB
          </div>
          <div className="card-preview">{problem.statement.substring(0, 100)}...</div>
          {problem.tags && problem.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
              {problem.tags.map(tag => (
                <span
                  key={tag}
                  className="tag green"
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
