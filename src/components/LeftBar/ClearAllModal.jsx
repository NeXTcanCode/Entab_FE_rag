import { useState } from "react";
import { useDispatch } from "react-redux";
import { clearAllThreads } from "../../store/threadsSlice";

export default function ClearAllModal({ show, onClose }) {
  const dispatch = useDispatch();
  const [includePinned, setIncludePinned] = useState(false);

  if (!show) return null;

  const handleConfirm = () => {
    dispatch(clearAllThreads({ includePinned }));
    onClose();
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <div className="modal-header -0">
            <h5 className="modal-title">Clear All Threads</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Are you sure you want to delete past conversations? This action
              cannot be undone.
            </p>
            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="includePinned"
                checked={includePinned}
                onChange={(e) => setIncludePinned(e.target.checked)}
              />
              <label
                className="form-check-label text-muted"
                htmlFor="includePinned"
              >
                Also delete pinned threads
              </label>
            </div>
          </div>
          <div className="modal-footer border-top-0">
            <button
              type="button"
              className="btn btn-secondary bg-transparent text-white border-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
            >
              Delete Threads
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
