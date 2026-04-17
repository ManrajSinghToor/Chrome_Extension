import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/components/dashboard/ProjectCard";
import { readScans, scanToProject, type StoredScan } from "@/lib/dashboard-data";

export function useDashboardProjects() {
  const [scans, setScans] = useState<StoredScan[]>(() => {
    if (typeof window === "undefined") return [];
    return readScans();
  });

  useEffect(() => {
    const onFocus = () => setScans(readScans());
    window.addEventListener("focus", onFocus);
    const onStorage = () => setScans(readScans());
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const projects = useMemo<Project[]>(() => scans.map(scanToProject), [scans]);
  return { scans, projects, refresh: () => setScans(readScans()) };
}
