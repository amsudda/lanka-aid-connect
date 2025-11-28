import { Heart, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
}

export function Header({ title, showSearch = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-lg font-bold text-foreground">
            {title || "LankaAid"}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Search className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" className="rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
