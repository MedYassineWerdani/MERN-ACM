import '../../styles/shared.css';

export function ArticlesList({ articles, onArticleClick }) {
  if (articles.length === 0) {
    return <p className="empty-state">No articles yet</p>;
  }

  return (
    <div className="scroll-container">
      {articles.map(article => (
        <div
          key={article._id}
          onClick={() => onArticleClick(article)}
          className="card"
          style={{ cursor: 'pointer' }}
        >
          <div className="card-title">📖 {article.title}</div>
          <div className="card-meta">
            By {article.author?.fullName || 'Unknown'} •{' '}
            {new Date(article.createdAt).toLocaleDateString()}
          </div>
          <div className="card-preview">{article.content.substring(0, 100)}...</div>
          {article.tags && article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="tag blue"
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
