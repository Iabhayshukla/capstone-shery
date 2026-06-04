import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
}

const RenameModal = ({
  isOpen,
  onClose,
  onRename,
  currentName,
}: RenameModalProps) => {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const canSave = name.trim() && name.trim() !== currentName;

  const handleRename = async () => {
    if (!canSave) return;
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onRename(name.trim());
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Project" size="sm">
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="rename-input"
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            Project Name
          </label>
          <input
            id="rename-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
            autoFocus
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) handleRename();
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={!canSave || isSaving}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Pencil size={15} />
                Rename
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RenameModal;
