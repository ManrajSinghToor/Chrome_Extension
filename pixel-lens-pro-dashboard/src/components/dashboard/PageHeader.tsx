import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PageHeader = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
          Your Projects
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and manage design accuracy across your builds.
        </p>
      </div>
      <Button className="h-9 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
        <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.5} />
        New Project
      </Button>
    </div>
  );
};
