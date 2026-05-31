interface ConsoleErrorPanelProps {
  errors: string[];
  onClear: () => void;
}

export default function ConsoleErrorPanel({ errors, onClear }: ConsoleErrorPanelProps) {
  if (errors.length === 0) return null;

  return (
    <div style={{ background:'#1a1a1a', border:'1px solid #333', borderRadius:'6px', maxHeight:'100px', overflow:'auto', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 10px', background:'#2d2d2d', borderBottom:'1px solid #333', position:'sticky', top:0 }}>
        <span style={{ fontSize:'10px', color:'#f87171', fontWeight:700 }}>⚠ Console ({errors.length})</span>
        <button onClick={onClear} style={{ fontSize:'10px', color:'#666', background:'transparent', border:'none', cursor:'pointer' }}>Clear</button>
      </div>
      {errors.map((err, i) => (
        <div key={i} style={{ padding:'4px 10px', fontSize:'10px', color:'#f87171', borderBottom:'1px solid #222', fontFamily:'monospace' }}>
          {i + 1}. {err}
        </div>
      ))}
    </div>
  );
}