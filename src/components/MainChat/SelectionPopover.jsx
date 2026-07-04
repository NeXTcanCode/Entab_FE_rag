import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SelectionPopover({ selection, position, onQuote, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {selection && position && (
        <motion.div
          className="selection-popover"
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
        >
          <button 
            className="text-white"
            onClick={() => {
              navigator.clipboard.writeText(selection);
              onClose();
            }}
          >
            📋 Copy
          </button>
          <button 
            className="text-white fw-medium"
            style={{ color: 'var(--accent) !important' }}
            onClick={() => onQuote(selection)}
          >
            💬 Add to chat
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
