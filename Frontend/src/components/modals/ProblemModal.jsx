import '../styles/shared.css';

export function ProblemModal({ problem, onClose }) {
  if (!problem) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">{problem.title}</h2>
        <p className="modal-subtext">
          ⏱️ {problem.timeLimit}s • 💾 {problem.memoryLimit}MB
        </p>
        <div className="modal-body code">{problem.statement}</div>
        {problem.tags && problem.tags.length > 0 && (
          <div className="tags-container">
            {problem.tags.map(tag => (
              <span key={tag} className="tag green">
                {tag}
              </span>
            ))}
          </div>
        )}
        <button onClick={onClose} className="btn btn-success">
          Close
        </button>
      </div>
    </div>
  );
}
