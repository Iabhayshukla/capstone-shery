import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
}


const getGradient = (name: string): string => {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-pink-500",
    "from-rose-500 to-red-500",
    "from-indigo-500 to-blue-600",
    "from-fuchsia-500 to-pink-600",
    "from-amber-500 to-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

const statusSizes = {
  sm: "w-2.5 h-2.5 border-[1.5px]",
  md: "w-3 h-3 border-2",
  lg: "w-4 h-4 border-2",
};

const statusColors = {
  online: "bg-emerald-400",
  offline: "bg-gray-500",
  away: "bg-amber-400",
};

const Avatar = ({
  name,
  src,
  size = "md",
  className,
  showStatus = false,
  status = "online",
}: AvatarProps) => {
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover ring-2 ring-white/10",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-semibold bg-gradient-to-br text-white ring-2 ring-white/10",
            sizeClasses[size],
            getGradient(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}

  
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-brand-dark",
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
