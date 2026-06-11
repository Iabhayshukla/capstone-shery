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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onConfirm();
    setIsDeleting(false);
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
          <AlertTriangle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Are you sure you want to delete this project?
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-300/60 mt-1">
              This will permanently delete the project <span className="font-semibold text-red-700 dark:text-red-200">"{projectName}"</span> and all of its generated code. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
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
