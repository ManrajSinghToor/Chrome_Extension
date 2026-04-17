import { Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProjectStatus = "good" | "review" | "issues";
type PreviewVariant = "ecom" | "saas" | "blog" | "portfolio" | "checkout" | "marketing";

export interface Project {
  name: string;
  description?: string;
  category?: string;
  domain: string;
  status: ProjectStatus;
  totalIssues: number;
  highSeverity: number;
  lastScan: string;
  preview: PreviewVariant;
}

const statusMap: Record<ProjectStatus, { label: string; dot: string; pill: string }> = {
  good: {
    label: "Good",
    dot: "bg-success",
    pill: "bg-success-muted text-success",
  },
  review: {
    label: "Needs Review",
    dot: "bg-warning",
    pill: "bg-warning-muted text-warning",
  },
  issues: {
    label: "Issues Found",
    dot: "bg-danger",
    pill: "bg-danger-muted text-danger",
  },
};

const PreviewThumbnail = ({ variant }: { variant: PreviewVariant }) => {
  const palettes: Record<PreviewVariant, { bg: string; accent: string }> = {
    ecom: { bg: "from-rose-50 to-amber-50", accent: "bg-rose-300" },
    saas: { bg: "from-indigo-50 to-sky-50", accent: "bg-indigo-300" },
    blog: { bg: "from-stone-50 to-zinc-100", accent: "bg-stone-300" },
    portfolio: { bg: "from-emerald-50 to-teal-50", accent: "bg-emerald-300" },
    checkout: { bg: "from-violet-50 to-fuchsia-50", accent: "bg-violet-300" },
    marketing: { bg: "from-orange-50 to-yellow-50", accent: "bg-orange-300" },
  };
  const p = palettes[variant];
  return (
    <div
      className={cn(
        "relative h-28 w-full overflow-hidden rounded-lg bg-gradient-to-br ring-1 ring-border/60",
        p.bg,
      )}
    >
      <div className="flex items-center gap-1 border-b border-border/50 bg-background/60 px-2 py-1.5 backdrop-blur-sm">
        <div className="h-1.5 w-1.5 rounded-full bg-danger/70" />
        <div className="h-1.5 w-1.5 rounded-full bg-warning/70" />
        <div className="h-1.5 w-1.5 rounded-full bg-success/70" />
        <div className="ml-2 h-2 w-20 rounded-sm bg-border/80" />
      </div>
      <div className="space-y-1.5 p-3">
        <div className={cn("h-2 w-1/3 rounded-sm", p.accent)} />
        <div className="h-1.5 w-2/3 rounded-sm bg-foreground/10" />
        <div className="h-1.5 w-1/2 rounded-sm bg-foreground/10" />
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="h-6 rounded-sm bg-foreground/5" />
          <div className="h-6 rounded-sm bg-foreground/5" />
          <div className="h-6 rounded-sm bg-foreground/5" />
        </div>
      </div>
    </div>
  );
};

export const ProjectCard = ({ project }: { project: Project }) => {
  const status = statusMap[project.status];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <PreviewThumbnail variant={project.preview} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {project.name}
          </h3>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
            {project.domain}
          </p>
          {project.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
            status.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      {project.category ? (
        <div className="mt-3 text-[11px] font-medium text-muted-foreground">
          Category: <span className="text-foreground/90">{project.category}</span>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total Issues
          </div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums">{project.totalIssues}</div>
        </div>
        <div className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-2.5 w-2.5" /> High Severity
          </div>
          <div
            className={cn(
              "mt-0.5 text-lg font-semibold tabular-nums",
              project.highSeverity > 0 ? "text-danger" : "text-foreground",
            )}
          >
            {project.highSeverity}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Last scanned {project.lastScan}
      </div>

      <div className="mt-4 flex gap-2 border-t border-border pt-3">
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex-1 rounded-lg border-border bg-card px-3 text-xs font-medium shadow-xs hover:bg-secondary"
        >
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          Run Scan
        </Button>
      </div>
    </article>
  );
};
