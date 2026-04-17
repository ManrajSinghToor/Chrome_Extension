import { ChevronDown, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const FilterButton = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className="h-8 rounded-lg border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-xs hover:bg-secondary"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="ml-1">{value}</span>
        <ChevronDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-44">
      <DropdownMenuLabel className="text-xs text-muted-foreground">{label}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {options.map((o) => (
        <DropdownMenuItem key={o} className="text-sm" onSelect={() => onChange(o)}>
          {o}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export type StatusFilter = "All" | "Good" | "Needs Review" | "Issues Found";
export type SortOption = "Recent" | "Most Issues" | "Name A–Z";

export const FilterBar = ({
  status,
  sort,
  onStatusChange,
  onSortChange,
}: {
  status: StatusFilter;
  sort: SortOption;
  onStatusChange: (next: StatusFilter) => void;
  onSortChange: (next: SortOption) => void;
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </Button>
        <span className="h-4 w-px bg-border" />
        <FilterButton
          label="Status"
          value={status}
          options={["All", "Good", "Needs Review", "Issues Found"]}
          onChange={(v) => onStatusChange(v as StatusFilter)}
        />
        <FilterButton
          label="Sort"
          value={sort}
          options={["Recent", "Most Issues", "Name A–Z"]}
          onChange={(v) => onSortChange(v as SortOption)}
        />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 shadow-xs">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md bg-secondary text-foreground"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
