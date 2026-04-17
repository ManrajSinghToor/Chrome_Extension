import { formatDistanceToNow } from "date-fns";
import type { Project, ProjectStatus } from "@/components/dashboard/ProjectCard";

type Severity = "critical" | "high" | "medium" | "low" | string;

type AnalysisAnnotation = {
  severity?: Severity;
};

export type DashboardAnalysisResult = {
  overallScore?: number;
  annotations?: AnalysisAnnotation[];
  createdAt?: number;
  pageUrl?: string;
  domain?: string;
  projectName?: string;
  projectDescription?: string;
  category?: string;
};

export type StoredScan = {
  id: string;
  createdAt: number;
  result: DashboardAnalysisResult;
};

const SCANS_KEY = "pixellens_dashboard_scans";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readScans(): StoredScan[] {
  const raw = safeJsonParse<StoredScan[]>(localStorage.getItem(SCANS_KEY));
  if (Array.isArray(raw) && raw.length) return raw;

  // Fallback: if something saved a single analysis object, wrap it.
  const single = safeJsonParse<DashboardAnalysisResult>(localStorage.getItem("dashboardData"));
  if (single) {
    const createdAt = single.createdAt ?? Date.now();
    return [
      {
        id: `scan_${createdAt}`,
        createdAt,
        result: { ...single, createdAt },
      },
    ];
  }

  return [];
}

export function appendScan(result: DashboardAnalysisResult) {
  const createdAt = result.createdAt ?? Date.now();
  const scan: StoredScan = {
    id: `scan_${createdAt}_${Math.random().toString(16).slice(2)}`,
    createdAt,
    result: { ...result, createdAt },
  };

  const scans = readScans();
  localStorage.setItem(SCANS_KEY, JSON.stringify([scan, ...scans]));
  return scan;
}

function statusFromResult(result: DashboardAnalysisResult): ProjectStatus {
  const score = result.overallScore ?? 0;
  const anns = result.annotations ?? [];
  const high = anns.filter((a) => a.severity === "critical" || a.severity === "high").length;
  const total = anns.length;
  if (high > 0 || total > 0) return "issues";
  if (score < 80) return "review";
  return "good";
}

function pickPreview(domain: string): Project["preview"] {
  const d = domain.toLowerCase();
  if (d.includes("shop") || d.includes("store")) return "ecom";
  if (d.includes("checkout") || d.includes("pay")) return "checkout";
  if (d.includes("blog")) return "blog";
  if (d.includes("app") || d.includes("dashboard")) return "saas";
  if (d.includes("marketing")) return "marketing";
  return "portfolio";
}

export function scanToProject(scan: StoredScan): Project {
  const result = scan.result ?? {};
  const anns = result.annotations ?? [];

  const domain =
    result.domain ||
    (() => {
      try {
        return result.pageUrl ? new URL(result.pageUrl).hostname : "unknown.local";
      } catch {
        return "unknown.local";
      }
    })();

  const totalIssues = anns.length;
  const highSeverity = anns.filter(
    (a) => a.severity === "critical" || a.severity === "high",
  ).length;
  const lastScan = formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true });

  return {
    name: result.projectName || domain,
    description: result.projectDescription,
    category: result.category,
    domain,
    status: statusFromResult(result),
    totalIssues,
    highSeverity,
    lastScan,
    preview: pickPreview(domain),
  };
}
