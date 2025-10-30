import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard";
  className?: string;
}

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const variants = {
    easy: "bg-success-light text-success border-success/20",
    medium: "bg-warning-light text-warning border-warning/20",
    hard: "bg-destructive-light text-destructive border-destructive/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        variants[difficulty],
        className
      )}
    >
      {difficulty}
    </span>
  );
};
