export default function FileTab({ path, isActive, onClick }) {
  // Extract just the filename for the tab
  const filename = path.split('/').pop();
  
  return (
    <button 
      className={`source-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={path}
    >
      {filename}
    </button>
  );
}
