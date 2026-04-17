import { FolderKanban, AlertCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const toneStyles = {
  default: "bg-primary-muted text-primary",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
};

export const StatsStrip = ({
  totalProjects,
  totalIssues,
  highSeverity,
}: {
  totalProjects: number;
  totalIssues: number;
  highSeverity: number;
}) => {
  const stats = [
    {
      label: "Total Projects",
      value: String(totalProjects),
      delta: "From your latest scans",
      icon: FolderKanban,
      tone: "default" as const,
    },
    {
      label: "Total Issues",
      value: String(totalIssues),
      delta: "Across all scans",
      icon: AlertCircle,
      tone: "warning" as const,
    },
    {
      label: "High Severity",
      value: String(highSeverity),
      delta: highSeverity > 0 ? "Needs attention" : "Looking good",
      icon: Flame,
      tone: "danger" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                toneStyles[s.tone],
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground truncate">{s.delta}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
