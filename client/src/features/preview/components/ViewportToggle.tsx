import { ViewportSize } from '../types/preview.types';

interface ViewportToggleProps {
  current: ViewportSize;
  onChange: (size: ViewportSize) => void;
}

const VIEWPORTS: { label: string; size: ViewportSize; icon: string }[] = [
  { label: 'Mobile', size: 'mobile', icon: '📱' },
  { label: 'Tablet', size: 'tablet', icon: '📟' },
  { label: 'Desktop', size: 'desktop', icon: '🖥' },
];

export default function ViewportToggle({ current, onChange }: ViewportToggleProps) {
  return (
    <div style={{ display:'flex', gap:'2px', background:'#2d2d2d', border:'1px solid #3e3e3e', borderRadius:'4px', padding:'2px' }}>
      {VIEWPORTS.map(({ label, size, icon }) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          style={{
            padding:'3px 10px', borderRadius:'3px', border:'none',
            background: current === size ? '#0078d4' : 'transparent',
            color: current === size ? '#fff' : '#969696',
            fontSize:'10px', fontWeight: current === size ? 700 : 400,
            cursor:'pointer', transition:'all 0.15s',
            display:'flex', alignItems:'center', gap:'4px',
          }}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}