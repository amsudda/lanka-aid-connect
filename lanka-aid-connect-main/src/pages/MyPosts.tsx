import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { postsAPI, NeedPost as APIPost } from "@/services/api";
import { NeedCard } from "@/components/needs/NeedCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<APIPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const data = await postsAPI.getMyPosts();
      setPosts(data);
    } catch (error: any) {
      console.error("Error fetching my posts:", error);
      if (error.status === 401) {
        toast.error("Please sign in to view your posts");
        // Redirect to home or login
        navigate("/");
      } else {
        toast.error("Failed to load your posts");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="My Posts">
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
      </PageLayout>
    );
  }

  if (posts.length === 0) {
    return (
      <PageLayout title="My Posts">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            You haven't created any need posts yet. Start by posting your first need.
          </p>
          <Button variant="hero" onClick={() => navigate("/post-need")}>
            <Plus className="w-5 h-5" />
            Create Your First Post
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="My Posts">
      {/* Summary Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{posts.length}</p>
            <p className="text-xs text-muted-foreground">Total Posts</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-success">
              {posts.filter(p => p.status === 'active').length}
            </p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border/50 text-center">
            <p className="text-2xl font-bold text-warning">
              {posts.reduce((sum, p) => sum + (p.donations?.length || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Donations</p>
          </div>
        </div>
      </div>

      {/* Create New Post Button */}
      <div className="px-4 pb-4">
        <Button variant="outline" className="w-full" onClick={() => navigate("/post-need")}>
          <Plus className="w-5 h-5" />
          Create New Post
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4 px-4 pb-6">
        {posts.map((post) => (
          <div key={post.id} className="relative">
            <NeedCard post={post} />
            {post.donations && post.donations.length > 0 && (
              <div className="mt-2 p-3 bg-muted/50 rounded-xl">
                <p className="text-xs font-semibold text-foreground mb-2">Recent Donations:</p>
                <div className="space-y-1">
                  {post.donations.slice(0, 3).map((donation) => (
                    <div key={donation.id} className="text-xs text-muted-foreground flex justify-between">
                      <span>{donation.donor_name || "Anonymous"}</span>
                      <span className="font-medium">{donation.quantity} items</span>
                    </div>
                  ))}
                  {post.donations.length > 3 && (
                    <p className="text-xs text-primary">+{post.donations.length - 3} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
