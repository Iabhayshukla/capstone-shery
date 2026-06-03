import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { ViewportSize } from '../types/preview.types';

interface ViewportToggleProps {
  current: ViewportSize;
  onChange: (v: ViewportSize) => void;
}

export default function ViewportToggle({ current, onChange }: ViewportToggleProps) {
  const options = [
    { value: 'desktop', label: 'Desktop', icon: <Monitor size={14} /> },
    { value: 'tablet', label: 'Tablet', icon: <Tablet size={14} /> },
    { value: 'mobile', label: 'Mobile', icon: <Smartphone size={14} /> },
  ] as const;

  return (
    <div className="flex items-center bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg p-0.5">
      {options.map((opt) => {
        const isActive = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              flex items-center gap-1.5
              px-3 py-1.5 rounded-md
              text-xs font-medium transition-all
              ${
                isActive
                  ? 'bg-[#333] text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }
            `}
            title={`${opt.label} View`}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}