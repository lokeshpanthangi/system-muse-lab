import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "completed" | "in-progress";
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = {
    completed: {
      icon: CheckCircle2,
      label: "Completed",
      className: "bg-success-light text-success border-success/20",
    },
    "in-progress": {
      icon: Clock,
      label: "In Progress",
      className: "bg-warning-light text-warning border-warning/20",
    },
  };

  const { icon: Icon, label, className: variantClass } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantClass,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};
