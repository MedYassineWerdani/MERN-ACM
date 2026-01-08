import '../styles/shared.css';

export function ArticleModal({ article, onClose }) {
  if (!article) return null;

  const date = new Date(article.createdAt).toLocaleDateString();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">{article.title}</h2>
        <p className="modal-subtext">
          By {article.author?.fullName || 'Unknown'} • {date}
        </p>
        <div className="modal-body">{article.content}</div>
        {article.tags && article.tags.length > 0 && (
          <div className="tags-container">
            {article.tags.map(tag => (
              <span key={tag} className="tag blue">
                {tag}
              </span>
            ))}
          </div>
        )}
        <button onClick={onClose} className="btn btn-primary">
          Close
        </button>
      </div>
    </div>
  );
}
