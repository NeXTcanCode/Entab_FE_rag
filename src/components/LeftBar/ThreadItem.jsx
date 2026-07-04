import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteThread, pinThread, restoreThread } from '../../store/threadsSlice';
import { showToast } from '../../store/uiSlice';

export default function ThreadItem({ thread, isActive, onSelect }) {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteThread(thread.id));
    // Show toast with undo
    dispatch(showToast({
      message: 'Thread deleted',
      undoAction: () => dispatch(restoreThread(thread))
    }));
  };

  const handlePin = (e) => {
    e.stopPropagation();
    dispatch(pinThread(thread.id));
  };

  return (
    <div 
      className={`thread-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(thread.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-truncate flex-grow-1" style={{ marginRight: '8px' }}>
        {thread.pinned && <span className="me-2">📌</span>}
        {thread.title}
      </div>
      <div className="thread-actions">
        <button onClick={handlePin} title={thread.pinned ? "Unpin" : "Pin"}>
          {thread.pinned ? '📌' : '📍'}
        </button>
        <button onClick={handleDelete} title="Delete">
          🗑
        </button>
      </div>
    </div>
  );
}
