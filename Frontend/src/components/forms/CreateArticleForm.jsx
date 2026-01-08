import '../../styles/shared.css';

export function CreateArticleForm({ formData, onFormChange, onSubmit, isLoading, message }) {
  return (
    <div className="section">
      <h3 className="section-title">📝 Create New Article</h3>
      
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-input"
          placeholder="Article title"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea"
          placeholder="Article content"
          value={formData.content}
          onChange={(e) => onFormChange('content', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Tags (comma-separated)</label>
        <input
          type="text"
          className="form-input"
          placeholder="tag1, tag2, tag3"
          value={formData.tags}
          onChange={(e) => onFormChange('tags', e.target.value)}
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Creating...' : '✨ Create Article'}
      </button>
    </div>
  );
}
