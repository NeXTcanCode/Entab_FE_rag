import { motion } from 'framer-motion';

export default function QuoteCard({ quote, onDismiss }) {
  if (!quote) return null;

  return (
    <motion.div 
      className="quote-card"
      initial={{ height: 0, opacity: 0, marginTop: 0 }}
      animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
      exit={{ height: 0, opacity: 0, marginTop: 0 }}
    >
      <div className="d-flex align-items-center mb-1 text-muted" style={{ fontSize: '0.8rem' }}>
        <span className="me-2">↩</span> Quoting
      </div>
      <div className="d-flex justify-content-between align-items-start">
        <div className="quote-text fst-italic">"{quote}"</div>
        <button onClick={onDismiss} className="text-muted p-1" style={{ fontSize: '1rem', lineHeight: 1 }}>✕</button>
      </div>
    </motion.div>
  );
}
