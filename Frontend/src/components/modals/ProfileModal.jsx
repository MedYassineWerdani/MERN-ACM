import '../../styles/shared.css';

export function ProfileModal({ user, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content small">
        <h2 className="modal-header">👤 My Profile</h2>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
            {user.fullName}
          </p>
        </div>
        <div className="form-group">
          <label className="form-label">Handle</label>
          <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
            @{user.handle}
          </p>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
            {user.email}
          </p>
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <p style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
            {user.role}
          </p>
        </div>
        <button onClick={onClose} className="btn btn-primary">
          Close
        </button>
      </div>
    </div>
  );
}
