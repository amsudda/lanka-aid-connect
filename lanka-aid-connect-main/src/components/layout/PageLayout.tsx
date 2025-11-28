import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showNav?: boolean;
  showSearch?: boolean;
}

export function PageLayout({
  children,
  title,
  showHeader = true,
  showNav = true,
  showSearch = true,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header title={title} showSearch={showSearch} />}
      <main className="pb-24 max-w-lg mx-auto">{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
