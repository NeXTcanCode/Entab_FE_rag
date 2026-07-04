import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SetupCard({ onSubmit }) {
  const [schoolCode, setSchoolCode] = useState('');
  const [part, setPart] = useState('');
  const [mode, setMode] = useState('code'); // 'code' | 'css' | 'both'

  const isValid = schoolCode.trim().length >= 3 && part.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    
    onSubmit({
      schoolCode: schoolCode.trim().toUpperCase(),
      part: part.trim(),
      mode
    });
  };

  return (
    <motion.div 
      className="setup-card"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="mb-4 text-center">🏫 Explore a codebase</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label text-muted fw-medium" style={{ fontSize: '0.9rem' }}>School Code</label>
          <input 
            type="text" 
            className="setup-input" 
            placeholder="e.g. ABSB"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
            autoFocus
          />
          {schoolCode.length > 0 && schoolCode.length < 3 && (
            <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>
              ⚠ Minimum 3 characters required
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label text-muted fw-medium" style={{ fontSize: '0.9rem' }}>Which part? (e.g. Header, Gallery)</label>
          <input 
            type="text" 
            className="setup-input" 
            placeholder="e.g. Gallery"
            value={part}
            onChange={(e) => setPart(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label text-muted fw-medium d-block" style={{ fontSize: '0.9rem' }}>What do you want to see?</label>
          <div className="d-flex gap-2">
            <button 
              type="button"
              className={`mode-pill flex-fill ${mode === 'code' ? 'active' : ''}`}
              onClick={() => setMode('code')}
            >
              💻 Code
            </button>
            <button 
              type="button"
              className={`mode-pill flex-fill ${mode === 'css' ? 'active' : ''}`}
              onClick={() => setMode('css')}
            >
              🎨 CSS
            </button>
            <button 
              type="button"
              className={`mode-pill flex-fill ${mode === 'both' ? 'active' : ''}`}
              onClick={() => setMode('both')}
            >
              📦 Both
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn w-100 fw-medium"
          style={{ 
            backgroundColor: isValid ? 'var(--accent)' : 'var(--bg-hover-light)',
            color: isValid ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.2s',
            padding: '12px'
          }}
          disabled={!isValid}
        >
          Start Exploring →
        </button>
      </form>
    </motion.div>
  );
}
