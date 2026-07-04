export default function SearchBar({ value, onChange }) {
  return (
    <div className="px-3 pb-2 pt-2">
      <input 
        type="text" 
        className="form-control setup-input" 
        placeholder="🔍 Search threads..." 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: '0.9rem', padding: '8px 12px' }}
      />
    </div>
  );
}
