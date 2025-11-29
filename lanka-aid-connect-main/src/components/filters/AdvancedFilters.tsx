import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS } from "@/types/database";
import { X, Filter, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FilterOptions {
  district: string;
  status: 'all' | 'active' | 'fulfilled';
  sortBy: 'newest' | 'urgent' | 'progress';
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

const DEFAULT_FILTERS: FilterOptions = {
  district: 'all',
  status: 'all',
  sortBy: 'newest',
};

export function AdvancedFilters({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: AdvancedFiltersProps) {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  useEffect(() => {
    const changed = JSON.stringify(tempFilters) !== JSON.stringify(filters);
    setHasChanges(changed);
  }, [tempFilters, filters]);

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = Object.entries(tempFilters).filter(
    ([key, value]) => value !== DEFAULT_FILTERS[key as keyof FilterOptions]
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl">Filter Requests</SheetTitle>
                <SheetDescription>
                  Find exactly what you're looking for
                </SheetDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* District Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Location</Label>
            <Select
              value={tempFilters.district}
              onValueChange={(value) =>
                setTempFilters({ ...tempFilters, district: value })
              }
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {DISTRICTS.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Filter by specific district or view all locations
            </p>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Request Status</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={tempFilters.status === 'all' ? 'default' : 'outline'}
                className="h-20 flex flex-col items-center justify-center rounded-xl"
                onClick={() => setTempFilters({ ...tempFilters, status: 'all' })}
              >
                <span className="text-2xl mb-1">📋</span>
                <span className="text-xs font-medium">All</span>
              </Button>
              <Button
                variant={tempFilters.status === 'active' ? 'default' : 'outline'}
                className="h-20 flex flex-col items-center justify-center rounded-xl"
                onClick={() => setTempFilters({ ...tempFilters, status: 'active' })}
              >
                <span className="text-2xl mb-1">🔴</span>
                <span className="text-xs font-medium">Active</span>
              </Button>
              <Button
                variant={tempFilters.status === 'fulfilled' ? 'default' : 'outline'}
                className="h-20 flex flex-col items-center justify-center rounded-xl"
                onClick={() => setTempFilters({ ...tempFilters, status: 'fulfilled' })}
              >
                <span className="text-2xl mb-1">✅</span>
                <span className="text-xs font-medium">Fulfilled</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Show only active requests or include fulfilled ones
            </p>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sort By</Label>
            <div className="space-y-2">
              <Button
                variant={tempFilters.sortBy === 'newest' ? 'default' : 'outline'}
                className="w-full h-14 justify-start rounded-xl"
                onClick={() => setTempFilters({ ...tempFilters, sortBy: 'newest' })}
              >
                <span className="text-xl mr-3">🆕</span>
                <div className="text-left">
                  <p className="font-medium">Newest First</p>
                  <p className="text-xs opacity-80">Recently posted requests</p>
                </div>
              </Button>
              <Button
                variant={tempFilters.sortBy === 'urgent' ? 'default' : 'outline'}
                className="w-full h-14 justify-start rounded-xl"
                onClick={() => setTempFilters({ ...tempFilters, sortBy: 'urgent' })}
              >
                <span className="text-xl mr-3">⚡</span>
                <div className="text-left">
                  <p className="font-medium">Most Urgent</p>
                  <p className="text-xs opacity-80">Less progress, more needed</p>
                </div>
              </Button>
              <Button
                variant={tempFilters.sortBy === 'progress' ? 'default' : 'outline'}
                className="w-full h-14 justify-start rounded-xl"
                onClick={() => setTempFilters({ ...tempFilters, sortBy: 'progress' })}
              >
                <span className="text-xl mr-3">📈</span>
                <div className="text-left">
                  <p className="font-medium">Nearly Complete</p>
                  <p className="text-xs opacity-80">Close to goal, help finish</p>
                </div>
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Active Filters ({activeFilterCount})</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempFilters.district !== 'all' && (
                  <Badge variant="secondary">
                    📍 {tempFilters.district}
                  </Badge>
                )}
                {tempFilters.status !== 'all' && (
                  <Badge variant="secondary">
                    {tempFilters.status === 'active' ? '🔴' : '✅'} {tempFilters.status}
                  </Badge>
                )}
                {tempFilters.sortBy !== 'newest' && (
                  <Badge variant="secondary">
                    {tempFilters.sortBy === 'urgent' ? '⚡' : '📈'}{' '}
                    {tempFilters.sortBy === 'urgent' ? 'Urgent' : 'Nearly Complete'}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="default"
              className="flex-1 h-12 rounded-xl"
              onClick={handleApply}
              disabled={!hasChanges}
            >
              Apply Filters
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
