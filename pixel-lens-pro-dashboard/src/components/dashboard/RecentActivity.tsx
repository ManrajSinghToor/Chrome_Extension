import { CheckCircle2, AlertCircle, Scan, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const activity = [
  {
    icon: AlertCircle,
    tone: "danger" as const,
    project: "E-commerce Website",
    text: "Homepage scanned — 12 issues found",
    time: "2h ago",
  },
  {
    icon: CheckCircle2,
    tone: "success" as const,
    project: "Acme SaaS",
    text: "Checkout page updated — 3 issues fixed",
    time: "4h ago",
  },
  {
    icon: Scan,
    tone: "default" as const,
    project: "Marketing Site",
    text: "Full site scan completed",
    time: "Yesterday",
  },
  {
    icon: GitBranch,
    tone: "default" as const,
    project: "Portfolio v2",
    text: "Design source synced from Figma",
    time: "2 days ago",
  },
  {
    icon: AlertCircle,
    tone: "warning" as const,
    project: "Blog Platform",
    text: "5 spacing inconsistencies detected",
    time: "3 days ago",
  },
];

const toneMap = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
  default: "bg-secondary text-muted-foreground",
};

export const RecentActivity = () => {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest scans and updates across your projects
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">View all</button>
      </div>

      <ol className="mt-4 divide-y divide-border">
        {activity.map((a, i) => {
          const Icon = a.icon;
          return (
            <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  toneMap[a.tone],
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  <span className="font-medium">{a.project}</span>
                  <span className="text-muted-foreground"> · {a.text}</span>
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{a.time}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
