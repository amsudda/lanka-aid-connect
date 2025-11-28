import { cn } from "@/lib/utils";
import { NeedCategory, CATEGORY_LABELS, CATEGORY_ICONS } from "@/types/database";

interface CategoryFilterProps {
  selected: NeedCategory | "all";
  onSelect: (category: NeedCategory | "all") => void;
}

const categories: (NeedCategory | "all")[] = [
  "all",
  "food",
  "dry_rations",
  "baby_items",
  "medical",
  "clothes",
  "other",
];

const categoryStyles: Record<NeedCategory | "all", string> = {
  all: "bg-primary text-primary-foreground",
  food: "bg-emerald-500 text-white",
  dry_rations: "bg-amber-500 text-white",
  baby_items: "bg-pink-500 text-white",
  medical: "bg-red-500 text-white",
  clothes: "bg-violet-500 text-white",
  other: "bg-slate-500 text-white",
};

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-4">
      {categories.map((cat) => {
        const isSelected = selected === cat;
        const label = cat === "all" ? "All" : CATEGORY_LABELS[cat];
        const icon = cat === "all" ? "🔥" : CATEGORY_ICONS[cat];

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border-2",
              isSelected
                ? cn(categoryStyles[cat], "border-transparent shadow-md scale-105")
                : "bg-card border-border text-foreground hover:border-primary/30"
            )}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
