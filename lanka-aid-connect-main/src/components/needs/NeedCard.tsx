import { useState, useEffect, useRef } from "react";
import { MapPin, MessageCircle, Clock, Flag, ChevronRight, Bookmark, BadgeCheck, Users, ChevronLeft, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeedPost as APIPost, postsAPI } from "@/services/api";
import { CATEGORY_LABELS, CATEGORY_ICONS, NeedCategory } from "@/types/database";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface NeedCardProps {
  post: APIPost;
}

const categoryBadgeClasses: Record<NeedCategory, string> = {
  food: "badge-food",
  dry_rations: "badge-dry-rations",
  baby_items: "badge-baby",
  medical: "badge-medical",
  clothes: "badge-clothes",
  other: "badge-other",
};

export function NeedCard({ post }: NeedCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const progress = Math.min((post.quantity_donated / post.quantity_needed) * 100, 100);
  const isUrgent = progress < 25;
  const isAlmostComplete = progress >= 75;
  const isComplete = progress >= 100;

  const images = post.images || [];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setIsSaved(postsAPI.isPostSaved(post.id));
  }, [post.id]);

  // Navigation functions
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasMultipleImages) {
      e.preventDefault();
      e.stopPropagation();
      setImageIndex((prev) => (prev + 1) % images.length);
    }

    if (isRightSwipe && hasMultipleImages) {
      e.preventDefault();
      e.stopPropagation();
      setImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isSaved) {
        await postsAPI.unsavePost(post.id);
        setIsSaved(false);
        toast.success("Removed from saved posts");
      } else {
        await postsAPI.savePost(post.id);
        setIsSaved(true);
        toast.success("Saved for later");
      }
    } catch (error) {
      toast.error("Failed to update saved posts");
    }
  };

  const getProgressClass = () => {
    if (isComplete) return "progress-complete";
    if (isAlmostComplete) return "progress-almost";
    if (progress >= 50) return "progress-partial";
    return "progress-urgent";
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg";
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise, use current domain (uploads are proxied through Nginx)
    return `${window.location.origin}${imageUrl}`;
  };
  const displayImage = images[imageIndex] ? getImageUrl(images[imageIndex].image_url) : "/placeholder.svg";

  const whatsappLink = post.whatsapp_link || `https://wa.me/${post.phone_number.replace(/\D/g, '')}`;

  return (
    <article className="bg-card rounded-2xl shadow-md overflow-hidden border border-border/50 animate-in">
      {/* Image Carousel */}
      <div
        ref={imageContainerRef}
        className="relative aspect-[4/3] bg-muted overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={displayImage}
          alt={post.title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Navigation Arrows (Desktop) */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        {hasMultipleImages && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium z-10">
            <Images className="w-3 h-3" />
            {imageIndex + 1}/{images.length}
          </div>
        )}

        {/* Urgency indicator */}
        {isUrgent && !isComplete && (
          <div className={cn(
            "absolute top-3 z-10",
            hasMultipleImages ? "left-20" : "left-3"
          )}>
            <Badge variant="destructive" className="pulse-urgent font-semibold">
              Urgent
            </Badge>
          </div>
        )}
        
        {isComplete && (
          <div className="absolute inset-0 bg-success/20 backdrop-blur-sm flex items-center justify-center">
            <Badge className="bg-success text-success-foreground text-lg px-4 py-2">
              ✓ Fulfilled
            </Badge>
          </div>
        )}

        {/* Image dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImageIndex(idx);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === imageIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Category badge */}
        <Badge
          className={cn(
            "absolute top-3 right-3",
            categoryBadgeClasses[post.category]
          )}
        >
          {CATEGORY_ICONS[post.category]} {CATEGORY_LABELS[post.category]}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and name */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {post.title}
            </h3>
            {post.is_verified && (
              <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Posted by {post.victim_name}
          </p>
        </div>

        {/* Location and time */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {post.location_city ? `${post.location_city}, ` : ""}{post.location_district}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {(() => {
              try {
                const date = new Date(post.created_at);
                if (isNaN(date.getTime())) {
                  return "Recently";
                }
                return formatDistanceToNow(date, { addSuffix: true });
              } catch {
                return "Recently";
              }
            })()}
          </span>
        </div>

        {/* Description preview */}
        <p className="text-sm text-foreground/80 line-clamp-2">
          {post.description}
        </p>

        {/* Family Composition */}
        {(post.is_group_request || post.num_adults > 0 || post.num_children > 0 || post.num_infants > 0) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              {post.is_group_request && post.group_size ? (
                <>Group of <span className="font-semibold">{post.group_size} people</span></>
              ) : (
                <>
                  Family of <span className="font-semibold">
                    {post.num_adults + post.num_children + post.num_infants}
                  </span>
                  {post.num_adults > 0 && <span className="text-muted-foreground ml-1">({post.num_adults} adults{post.num_children > 0 && `, ${post.num_children} children`}{post.num_infants > 0 && `, ${post.num_infants} infants`})</span>}
                </>
              )}
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {post.quantity_donated} / {post.quantity_needed} items
            </span>
            <span className={cn(
              "font-semibold",
              isComplete ? "text-success" : isUrgent ? "text-destructive" : "text-warning"
            )}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getProgressClass())}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            asChild
            variant="hero"
            className="flex-1"
            disabled={isComplete}
          >
            <Link to={`/need/${post.id}`}>
              {isComplete ? "View Details" : "Donate Items"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 text-success" />
            </a>
          </Button>
          <Button
            variant={isSaved ? "default" : "ghost"}
            size="icon"
            onClick={handleToggleSave}
          >
            <Bookmark
              className={cn(
                "w-5 h-5",
                isSaved ? "fill-current" : "text-muted-foreground"
              )}
            />
          </Button>
          <Button variant="ghost" size="icon">
            <Flag className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </article>
  );
}
