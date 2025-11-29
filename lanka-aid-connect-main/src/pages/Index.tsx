import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { CategoryFilter } from "@/components/needs/CategoryFilter";
import { NeedsList } from "@/components/needs/NeedsList";
import { NeedCategory, DISTRICTS } from "@/types/database";
import { Search, SlidersHorizontal, Phone, AlertCircle, Info, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { postsAPI } from "@/services/api";
import { AdvancedFilters, FilterOptions } from "@/components/filters/AdvancedFilters";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<NeedCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({ activeRequests: 0, itemsDonated: 0, familiesHelped: 0 });
  const [filters, setFilters] = useState<FilterOptions>({
    district: 'all',
    status: 'all',
    sortBy: 'newest',
  });

  const emergencyCards = [
    {
      type: "emergency-single",
      title: "Police Emergency",
      icon: <Phone className="w-6 h-6" />,
      number: "119",
      description: "For immediate police assistance and emergencies"
    },
    {
      type: "emergency-single",
      title: "Ambulance Service",
      icon: <Phone className="w-6 h-6" />,
      number: "1990",
      description: "24/7 emergency medical services and ambulance"
    },
    {
      type: "emergency-single",
      title: "Fire & Rescue",
      icon: <Phone className="w-6 h-6" />,
      number: "110",
      description: "Fire emergencies and rescue operations"
    },
    {
      type: "emergency-single",
      title: "Disaster Management",
      icon: <Phone className="w-6 h-6" />,
      number: "117",
      description: "Disaster response and emergency coordination"
    },
    {
      type: "status",
      title: "Live Statistics",
      icon: <AlertCircle className="w-6 h-6" />,
      message: "Platform actively helping communities",
      stats: [
        { label: "Active Requests", value: stats.activeRequests.toString() },
        { label: "Items Donated", value: stats.itemsDonated.toLocaleString() },
        { label: "Families Helped", value: stats.familiesHelped.toString() }
      ]
    },
    {
      type: "info",
      title: "Latest Updates",
      icon: <Info className="w-6 h-6" />,
      message: "Help families affected by recent floods in Southern Province",
      action: "View Affected Areas"
    }
  ];

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

  // Fetch live stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await postsAPI.getStats();
        setStats({
          activeRequests: statsData.active || 0,
          itemsDonated: statsData.totalQuantityDonated || 0,
          familiesHelped: statsData.total || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % emergencyCards.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [emergencyCards.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % emergencyCards.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + emergencyCards.length) % emergencyCards.length);
  };

  return (
    <PageLayout>
      {/* Emergency Info Carousel */}
      <section className="px-4 py-6">
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/10 overflow-hidden">
          {/* Carousel Container */}
          <div className="relative h-64">
            {emergencyCards.map((card, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="p-6 h-full flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {card.icon}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{card.title}</h2>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {card.type === "emergency-single" && (
                      <a
                        href={`tel:${card.number}`}
                        className="w-full text-center"
                      >
                        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 mb-3 hover:scale-[1.02] transition-transform">
                          <Phone className="w-10 h-10 mx-auto mb-2 text-white" />
                          <p className="text-5xl font-bold text-white mb-1">{card.number}</p>
                          <p className="text-white/90 text-xs">Tap to call</p>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed px-2">{card.description}</p>
                      </a>
                    )}

                    {card.type === "status" && (
                      <div className="w-full">
                        <p className="text-success font-semibold mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-success"></span>
                          {card.message}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {card.stats?.map((stat, i) => (
                            <div key={i} className="bg-background/80 rounded-xl p-4 border border-border/50 text-center">
                              <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                              <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {card.type === "info" && (
                      <div className="w-full text-center">
                        <p className="text-foreground mb-6 leading-relaxed text-lg">{card.message}</p>
                        <Button variant="hero" size="lg" className="w-full">{card.action}</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {emergencyCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-primary w-6' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Search & Filter Buttons */}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => setShowSearch(!showSearch)}>
            <Search className="w-5 h-5 mr-2" />
            Search Requests
          </Button>
          <Button variant="outline" size="icon" className="relative" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="w-5 h-5" />
            {(filters.district !== 'all' || filters.status !== 'all' || filters.sortBy !== 'newest') && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {[filters.district !== 'all', filters.status !== 'all', filters.sortBy !== 'newest'].filter(Boolean).length}
              </span>
            )}
          </Button>
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

      {/* Active Filters Chips */}
      {(filters.district !== 'all' || filters.status !== 'all' || filters.sortBy !== 'newest' || searchQuery) && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Active:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                🔍 "{searchQuery}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {filters.district !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                📍 {filters.district}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => setFilters({ ...filters, district: 'all' })}
                />
              </Badge>
            )}
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {filters.status === 'active' ? '🔴' : '✅'} {filters.status}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => setFilters({ ...filters, status: 'all' })}
                />
              </Badge>
            )}
            {filters.sortBy !== 'newest' && (
              <Badge variant="secondary" className="gap-1">
                {filters.sortBy === 'urgent' ? '⚡ Urgent' : '📈 Nearly Complete'}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => setFilters({ ...filters, sortBy: 'newest' })}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => {
                setSearchQuery("");
                setFilters({ district: 'all', status: 'all', sortBy: 'newest' });
              }}
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="px-4 py-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{stats.activeRequests}</p>
            <p className="text-xs text-muted-foreground">Active Needs</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-success">{stats.itemsDonated.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Items Donated</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-warning">{stats.familiesHelped}</p>
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
      <NeedsList
        category={selectedCategory}
        searchQuery={searchQuery}
        district={filters.district}
        status={filters.status}
        sortBy={filters.sortBy}
      />

      {/* Advanced Filters Sheet */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
      />
    </PageLayout>
  );
};

export default Index;
