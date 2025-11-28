import { useEffect, useState } from "react";
import { postsAPI, NeedPost as APIPost } from "@/services/api";
import { NeedCategory } from "@/types/database";
import { NeedCard } from "./NeedCard";
import { Skeleton } from "@/components/ui/skeleton";

interface NeedsListProps {
  category: NeedCategory | "all";
  searchQuery?: string;
}

export function NeedsList({ category, searchQuery }: NeedsListProps) {
  const [posts, setPosts] = useState<APIPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [category, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { status: 'active' };

      if (category !== "all") {
        params.category = category;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const { posts: data } = await postsAPI.getAll(params);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-4xl">🙏</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No needs posted yet</h3>
        <p className="text-muted-foreground text-sm">
          When people need help, their requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 stagger-children">
      {posts.map((post) => (
        <NeedCard key={post.id} post={post} />
      ))}
    </div>
  );
}
