import '../../styles/shared.css';

export function CreateProblemForm({ formData, onFormChange, onSubmit, isLoading, message }) {
  return (
    <div className="section">
      <h3 className="section-title">💻 Create New Problem</h3>
      
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
          placeholder="Problem title"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="form-group">
          <label className="form-label">Time Limit (seconds)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 1"
            value={formData.timeLimit}
            onChange={(e) => onFormChange('timeLimit', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Memory Limit (MB)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 256"
            value={formData.memoryLimit}
            onChange={(e) => onFormChange('memoryLimit', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Problem Statement</label>
        <textarea
          className="form-textarea"
          placeholder="Problem description and examples"
          value={formData.statement}
          onChange={(e) => onFormChange('statement', e.target.value)}
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
        className="btn btn-success"
      >
        {isLoading ? 'Creating...' : '✨ Create Problem'}
      </button>
    </div>
  );
}
