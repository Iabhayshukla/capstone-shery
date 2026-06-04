import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, FileCode, Layout, Globe, Loader2 } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: string) => void;
}

const templates = [
  {
    id: "blank",
    name: "Blank Canvas",
    desc: "Start from scratch",
    icon: <FileCode size={20} />,
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    desc: "Personal website",
    icon: <Layout size={20} />,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "landing",
    name: "Landing Page",
    desc: "Marketing page",
    icon: <Globe size={20} />,
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];

const NewProjectModal = ({
  isOpen,
  onClose,
  onCreate,
}: NewProjectModalProps) => {
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    onCreate(name.trim(), selectedTemplate);
    setIsCreating(false);
    setName("");
    setSelectedTemplate("blank");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="md">
      <div className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <label
            htmlFor="project-name"
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Website"
            className="w-full px-4 py-3 text-sm glass-input text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) handleCreate();
            }}
          />
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Choose a Template
          </label>
          <div className="grid grid-cols-3 gap-3">
            {templates.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedTemplate(template.id)}
                className={`
                  relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all
                  ${
                    selectedTemplate === template.id
                      ? "border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/10"
                      : "border-[var(--brand-border)] bg-[var(--brand-glass)] hover:border-[var(--brand-border-hover)] hover:bg-[var(--brand-glass-hover)]"
                  }
                `}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center text-[var(--text-muted)]`}
                >
                  {template.icon}
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {template.name}
                </span>
                <span className="text-[10px] text-[var(--text-faint)]">
                  {template.desc}
                </span>

                {/* Selection ring */}
                {selectedTemplate === template.id && (
                  <motion.div
                    layoutId="template-ring"
                    className="absolute inset-0 rounded-xl border-2 border-brand-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-glass-hover)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Create Project
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewProjectModal;
