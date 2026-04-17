import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appendScan, type DashboardAnalysisResult } from "@/lib/dashboard-data";

export const Route = createFileRoute("/add-scan")({
  component: AddScanPage,
});

const formSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
});

const CATEGORIES = ["Website", "Web App", "Landing Page", "E-commerce", "Dashboard", "Other"];

function readPending(): DashboardAnalysisResult | null {
  try {
    const raw = localStorage.getItem("pixellens_pending_analysis");
    if (!raw) return null;
    return JSON.parse(raw) as DashboardAnalysisResult;
  } catch {
    return null;
  }
}

function clearPending() {
  localStorage.removeItem("pixellens_pending_analysis");
}

function AddScanPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<DashboardAnalysisResult | null>(() => readPending());
  const [isWaiting, setIsWaiting] = useState(() => !readPending());
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pending) {
      setIsWaiting(false);
      setProjectName((prev) => prev || pending.domain || "");
      return;
    }

    setIsWaiting(true);
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      const next = readPending();
      if (next) {
        window.clearInterval(id);
        setPending(next);
        setIsWaiting(false);
      } else if (tries >= 30) {
        window.clearInterval(id);
        setIsWaiting(false);
      }
    }, 200);

    return () => window.clearInterval(id);
  }, [pending]);

  if (!pending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-[520px] border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">No scan to add</CardTitle>
            <CardDescription>
              Open the extension and click <span className="text-foreground">Add To Dashboard</span>{" "}
              after an analysis completes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            {isWaiting ? (
              <div className="text-xs text-muted-foreground">Waiting for scan data…</div>
            ) : null}
            <Button asChild variant="outline">
              <Link to="/">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse({ projectName, projectDescription, category });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please fill all fields.");
      return;
    }

    appendScan({
      ...pending,
      projectName: parsed.data.projectName,
      projectDescription: parsed.data.projectDescription,
      category: parsed.data.category,
    });
    clearPending();
    await navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-4">
      <Card className="w-full max-w-[380px] rounded-[12px] border-[#27272a] bg-[#18181b] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-2xl font-semibold text-[#e4e4e7]">Add Scan</CardTitle>
          <CardDescription className="text-sm text-[#a1a1aa]">
            Add project details so this scan appears as a dashboard card.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e4e4e7]" htmlFor="projectName">
                Project Name
              </label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Marketing Site"
                className="border-[#27272a] bg-[#0f0f1a] text-[#e4e4e7] placeholder:text-[#52525b] focus-visible:border-[#818cf8] focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e4e4e7]" htmlFor="projectDescription">
                Description
              </label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Short description of what you're scanning…"
                className="border-[#27272a] bg-[#0f0f1a] text-[#e4e4e7] placeholder:text-[#52525b] focus-visible:border-[#818cf8] focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#e4e4e7]">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-[#27272a] bg-[#0f0f1a] text-[#e4e4e7] focus:ring-0">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-10 w-full rounded-[8px] bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white shadow hover:opacity-95"
            >
              Add to Dashboard
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-[8px] border-[#27272a] bg-transparent text-[#a1a1aa] hover:border-[#818cf8] hover:text-[#e4e4e7]"
              onClick={async () => {
                clearPending();
                await navigate({ to: "/" });
              }}
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
