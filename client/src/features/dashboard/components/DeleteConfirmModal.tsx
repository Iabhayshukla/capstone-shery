import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
}: DeleteConfirmModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText === projectName;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onConfirm();
    setIsDeleting(false);
    setConfirmText("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project"
      size="sm"
      danger
    >
      <div className="space-y-5">
        {/* Warning */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-medium">
              This action cannot be undone
            </p>
            <p className="text-xs text-red-300/60 mt-1">
              This will permanently delete the project and all its generated
              code.
            </p>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-2">
          <label
            htmlFor="confirm-delete"
            className="text-sm text-[var(--text-muted)]"
          >
            Type <span className="text-[var(--text-primary)] font-mono font-medium">"{projectName}"</span> to
            confirm:
          </label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={projectName}
            className="w-full px-4 py-2.5 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)] font-mono"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && canDelete) handleDelete();
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            variant="ghost"
            onClick={() => {
              setConfirmText("");
              onClose();
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-5 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete Project
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
