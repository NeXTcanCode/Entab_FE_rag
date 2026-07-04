import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setActiveSource } from '../../store/uiSlice';
import SelectionPopover from './SelectionPopover';

export default function Message({ threadId, message, onSelectText }) {
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [selectionData, setSelectionData] = useState(null);

  const isAssistant = message.role === 'assistant';
  const hasSources = isAssistant && message.sources && message.sources.length > 0;
  const isLegacySourceNotice = hasSources && /^Loaded\s+`[^`]+`\s+from\s+/i.test(message.content || '');
  const displayContent = isLegacySourceNotice
    ? (() => {
        const seen = new Set();
        const blocks = [];
        message.sources.forEach((context) => {
          (context.source_files || []).forEach((sourceFile) => {
            if (!sourceFile.path || seen.has(sourceFile.path)) return;
            seen.add(sourceFile.path);
            const extension = sourceFile.path.split('.').pop()?.toLowerCase();
            const language = extension === 'js' || extension === 'jsx'
              ? 'jsx'
              : extension === 'css'
                ? 'css'
                : extension || 'text';
            blocks.push(`File: \`${sourceFile.path}\`\n\n\`\`\`${language}\n${sourceFile.content || ''}\n\`\`\``);
          });
        });
        return blocks.join('\n\n') || message.content;
      })()
    : message.content;

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isAssistant) return;
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text && contentRef.current && contentRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectionData({
          text,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top
          }
        });
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isAssistant, onSelectText]);

  const handleSourceClick = () => {
    dispatch(setActiveSource({ threadId, messageId: message.id }));
  };

  return (
    <motion.div 
      className={`msg-container ${isAssistant ? 'msg-assistant' : 'msg-user'}`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="msg-content" ref={contentRef}>
        {isAssistant && <div className="mb-2" style={{ fontSize: '1.2rem' }}>🤖</div>}
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>
      
      {hasSources && (
        <button className="source-chip ms-auto mt-2" onClick={handleSourceClick}>
          📄 {message.sources.length} Sources →
        </button>
      )}

      <SelectionPopover
        selection={selectionData?.text}
        position={selectionData?.position}
        onQuote={(text) => {
          onSelectText({ text });
          setSelectionData(null);
          window.getSelection()?.removeAllRanges();
        }}
        onClose={() => setSelectionData(null)}
      />
    </motion.div>
  );
}
