import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import QuoteCard from './QuoteCard';

export default function Composer({ input, setInput, onSend, onStop, loading, quote, onDismissQuote, placeholder }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading) {
        onSend();
      }
    }
  };

  return (
    <div className="composer-container">
      <AnimatePresence>
        {quote && <QuoteCard quote={quote} onDismiss={onDismissQuote} />}
      </AnimatePresence>
      
      <div className="d-flex align-items-end gap-2">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask a question..."}
          disabled={loading}
        />
        
        <button 
          type="button"
          className="btn rounded-circle d-flex align-items-center justify-content-center"
          style={{ 
            width: '40px', height: '40px', 
            backgroundColor: loading || input.trim() ? 'var(--accent)' : 'var(--bg-sidebar)',
            color: loading || input.trim() ? '#0c1017' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
          onClick={() => {
            if (loading) onStop?.();
            else if (input.trim()) onSend();
          }}
          disabled={!loading && !input.trim()}
          aria-label={loading ? 'Stop generating' : 'Send message'}
          title={loading ? 'Stop generating' : 'Send message'}
        >
          {loading ? <span className="stop-icon" aria-hidden="true" /> : '↑'}
        </button>
      </div>
    </div>
  );
}
