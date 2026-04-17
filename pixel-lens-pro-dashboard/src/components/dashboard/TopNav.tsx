import { Search, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import { useAuthUser } from "@/hooks/useAuthUser";

export const TopNav = () => {
  const { user } = useAuthUser();
  const initial = (user?.name?.trim()?.[0] || "").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md shadow-xs">
            <img src={logo} alt="Pixel Lens Pro logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            Pixel Lens <span className="text-muted-foreground font-medium">Pro</span>
          </span>
        </Link>

        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects or pages…"
            className="h-9 rounded-lg border-border/80 bg-secondary/60 pl-9 pr-14 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Button>
          {user ? (
            <Avatar className="h-8 w-8 ring-1 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initial || "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-border/80 bg-background/60 text-foreground hover:bg-accent"
            >
              <Link to="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
