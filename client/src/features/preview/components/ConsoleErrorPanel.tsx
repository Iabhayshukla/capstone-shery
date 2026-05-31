interface ConsoleErrorPanelProps {
  errors: string[];
  onClear: () => void;
}

export default function ConsoleErrorPanel({ errors, onClear }: ConsoleErrorPanelProps) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-gray-900 border-t border-red-800 text-xs font-mono max-h-32 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-red-900 text-red-200 sticky top-0">
        <span>⚠️ Console Errors ({errors.length})</span>
        <button
          onClick={onClear}
          className="text-red-300 hover:text-white transition-colors"
        >
          Clear ✕
        </button>
      </div>

      {/* Error list */}
      {errors.map((err, i) => (
        <div
          key={i}
          className="flex gap-2 px-3 py-1 border-b border-gray-800 text-red-400 hover:bg-gray-800"
        >
          <span className="text-gray-500 select-none">{i + 1}</span>
          <span>{err}</span>
        </div>
      ))}
    </div>
  );
}