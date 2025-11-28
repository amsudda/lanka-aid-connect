import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { CategoryFilter } from "@/components/needs/CategoryFilter";
import { NeedsList } from "@/components/needs/NeedsList";
import { NeedCategory } from "@/types/database";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<NeedCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // Check if there's a token in the URL (from Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userType = urlParams.get('userType');

    if (token) {
      // Store the token
      localStorage.setItem('auth_token', token);
      // Store user type
      if (userType) {
        localStorage.setItem('user_type', userType);
      }
      // Remove params from URL
      window.history.replaceState({}, document.title, '/');
      // Show welcome message for new donors
      if (userType === 'donor') {
        toast.success("Welcome! Browse needs below and make a difference.", {
          duration: 4000,
        });
      }
    }
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="px-4 py-6">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 border border-primary/10">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Help Sri Lanka Rebuild
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Connect with families affected by disasters. Browse their needs and make a difference today.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="hero" className="flex-1">
              Donate Now
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSearch(!showSearch)}>
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pb-4 animate-slide-down">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by location, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-card border-border"
            />
          </div>
        </div>
      )}

      {/* Category Filter */}
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Stats Bar */}
      <div className="px-4 py-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">247</p>
            <p className="text-xs text-muted-foreground">Active Needs</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-success">1,832</p>
            <p className="text-xs text-muted-foreground">Items Donated</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-warning">89</p>
            <p className="text-xs text-muted-foreground">Families Helped</p>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-4 pt-2 pb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Needs</h2>
        <Button variant="link" className="text-sm text-primary p-0 h-auto">
          View All
        </Button>
      </div>

      {/* Needs List */}
      <NeedsList category={selectedCategory} searchQuery={searchQuery} />
    </PageLayout>
  );
};

export default Index;
