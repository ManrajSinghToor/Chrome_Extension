import { AlertCircle, CheckCircle2, Scan } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { StoredScan } from "@/lib/dashboard-data";

type ActivityTone = "success" | "warning" | "danger" | "default";

const toneMap = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
  default: "bg-secondary text-muted-foreground",
};

function toActivity(scan: StoredScan) {
  const result = scan.result ?? {};
  const annotations = result.annotations ?? [];
  const highSeverity = annotations.filter(
    (a) => a.severity === "critical" || a.severity === "high",
  ).length;

  let icon = Scan;
  let tone: ActivityTone = "default";
  let text = "Scan added from extension";

  if (highSeverity > 0) {
    icon = AlertCircle;
    tone = "danger";
    text = `${highSeverity} high-severity issue${highSeverity > 1 ? "s" : ""} detected`;
  } else if (annotations.length > 0) {
    icon = AlertCircle;
    tone = "warning";
    text = `${annotations.length} issue${annotations.length > 1 ? "s" : ""} detected`;
  } else if ((result.overallScore ?? 0) >= 80) {
    icon = CheckCircle2;
    tone = "success";
    text = "Scan passed with strong visual match";
  }

  const project =
    result.projectName ||
    result.domain ||
    (result.pageUrl ? new URL(result.pageUrl).hostname : "New Project");
  const time = formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true });
  return { icon, tone, project, text, time };
}

export const RecentActivity = ({ scans }: { scans: StoredScan[] }) => {
  const activity = [...scans]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8)
    .map(toActivity);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            New cards/projects added through the extension
          </p>
        </div>
      </div>

      {activity.length ? (
        <ol className="mt-4 divide-y divide-border">
          {activity.map((a, i) => {
            const Icon = a.icon;
            return (
              <li
                key={`${a.project}_${a.time}_${i}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
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
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {a.time}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-4 rounded-lg border border-border/70 bg-secondary/20 p-3 text-xs text-muted-foreground">
          No activity yet. Add your first project card from the extension.
        </div>
      )}
    </section>
  );
};
