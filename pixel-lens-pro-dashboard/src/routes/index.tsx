import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { FilterBar, type SortOption, type StatusFilter } from "@/components/dashboard/FilterBar";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useDashboardProjects } from "@/hooks/useDashboardProjects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Lens Pro — Design QA Dashboard" },
      {
        name: "description",
        content:
          "Track design accuracy across your builds. Pixel Lens Pro auto-captures pages from your browser extension and surfaces every issue here.",
      },
      { property: "og:title", content: "Pixel Lens Pro — Design QA Dashboard" },
      {
        property: "og:description",
        content:
          "AI-powered UI/UX QA. See every scan from the PixelLens Pro extension in one place.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { projects, scans } = useDashboardProjects();
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortOption>("Recent");

  const filtered = useMemo(() => {
    let list = [...projects];

    if (status !== "All") {
      const map: Record<Exclude<StatusFilter, "All">, string> = {
        Good: "good",
        "Needs Review": "review",
        "Issues Found": "issues",
      };
      list = list.filter((p) => p.status === map[status]);
    }

    if (sort === "Most Issues") {
      list.sort((a, b) => b.totalIssues - a.totalIssues);
    } else if (sort === "Name A–Z") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [projects, sort, status]);

  const totals = useMemo(() => {
    const totalIssues = projects.reduce((sum, p) => sum + p.totalIssues, 0);
    const highSeverity = projects.reduce((sum, p) => sum + p.highSeverity, 0);
    return { totalProjects: projects.length, totalIssues, highSeverity };
  }, [projects]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
        <div className="space-y-8 animate-fade-up">
          <PageHeader />
          <StatsStrip
            totalProjects={totals.totalProjects}
            totalIssues={totals.totalIssues}
            highSeverity={totals.highSeverity}
          />

          <section className="space-y-4">
            <FilterBar
              status={status}
              sort={sort}
              onStatusChange={setStatus}
              onSortChange={setSort}
            />
            {filtered.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProjectCard key={`${p.domain}_${p.lastScan}_${p.totalIssues}`} project={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                No scans yet. Run an analysis in the extension and click “Add To Dashboard”.
              </div>
            )}
          </section>

          <RecentActivity scans={scans} />

          <footer className="flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
            <span>© Pixel Lens Pro</span>
            <span className="font-mono">v1.4.2 · synced just now</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
