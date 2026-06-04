import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "avatar" | "card" | "button" | "thumbnail";
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton = ({
  className,
  variant = "text",
  width,
  height,
  rounded = false,
}: SkeletonProps) => {
  const variantStyles: Record<string, string> = {
    text: "h-4 w-full rounded-md",
    avatar: "h-10 w-10 rounded-full",
    card: "h-48 w-full rounded-xl",
    button: "h-10 w-24 rounded-lg",
    thumbnail: "h-32 w-full rounded-lg",
  };

  return (
    <div
      className={cn(
        "skeleton",
        variantStyles[variant],
        rounded && "rounded-full",
        className
      )}
      style={{ width, height }}
    />
  );
};

// Pre-built skeleton groups for common layouts
export const ProjectCardSkeleton = () => (
  <div className="glass-card p-4 space-y-4">
    <Skeleton variant="thumbnail" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
    <div className="flex gap-2">
      <Skeleton variant="button" className="w-16" />
      <Skeleton variant="button" className="w-16" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <ProjectCardSkeleton key={i} />
    ))}
  </div>
);

export const EditorSkeleton = () => (
  <div className="flex h-full gap-1">
    <div className="w-[400px] p-4 space-y-4">
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="button" className="w-full h-12" />
    </div>
    <div className="flex-1 p-4">
      <Skeleton variant="card" className="h-full" />
    </div>
  </div>
);

export default Skeleton;
