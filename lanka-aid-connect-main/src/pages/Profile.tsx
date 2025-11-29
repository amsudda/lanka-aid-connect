import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authAPI, donationsAPI, postsAPI } from "@/services/api";
import { NeedPost, Donation } from "@/types/database";
import {
  Heart, Users, Package, MapPin, Award, LogIn,
  ChevronRight, Star, Shield, Zap, Gift, FileText, Bookmark, Plus,
  Edit, Eye, TrendingUp, Clock, CheckCircle2, Trash2, UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const badgeIcons: Record<string, React.ReactNode> = {
  "First Responder": <Zap className="w-4 h-4" />,
  "Heavy Lifter": <Package className="w-4 h-4" />,
  "Verified Donor": <Shield className="w-4 h-4" />,
  "Community Hero": <Star className="w-4 h-4" />,
};

const badgeColors: Record<string, string> = {
  "First Responder": "bg-amber-100 text-amber-700 border-amber-200",
  "Heavy Lifter": "bg-blue-100 text-blue-700 border-blue-200",
  "Verified Donor": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Community Hero": "bg-purple-100 text-purple-700 border-purple-200",
};

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [myPosts, setMyPosts] = useState<NeedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<NeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<NeedPost | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postDonations, setPostDonations] = useState<Donation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<NeedPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      window.history.replaceState({}, document.title, '/profile');
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.getMe();
      setUser(userData.user);
      setProfile(userData.profile);

      // Get user type from multiple possible sources
      let detectedUserType = localStorage.getItem('user_type');

      // Check if it's null, empty, or the string "undefined"
      if (!detectedUserType || detectedUserType === 'undefined' || detectedUserType === 'null') {
        detectedUserType = localStorage.getItem('selected_user_type');
      }

      if (!detectedUserType || detectedUserType === 'undefined' || detectedUserType === 'null') {
        detectedUserType = userData.user?.user_type;
      }

      // Default to donor if still nothing
      if (!detectedUserType || detectedUserType === 'undefined' || detectedUserType === 'null') {
        detectedUserType = 'donor';
      }

      console.log('🔍 User Type Detected:', detectedUserType);
      console.log('📊 User Data:', userData);
      console.log('💾 LocalStorage user_type:', localStorage.getItem('user_type'));
      console.log('💾 LocalStorage selected_user_type:', localStorage.getItem('selected_user_type'));

      setUserType(detectedUserType);

      console.log('✅ UserType state set to:', detectedUserType);

      // Store in the main user_type key for future use
      localStorage.setItem('user_type', detectedUserType);

      // Fetch data based on user type
      if (detectedUserType === 'donor') {
        // Fetch user's donations
        try {
          const donationsData = await donationsAPI.getMyDonations();
          setDonations(donationsData);
        } catch (error) {
          console.log("No donations yet");
        }

        // Fetch saved posts
        try {
          const savedData = await postsAPI.getSavedPosts();
          setSavedPosts(savedData);
        } catch (error) {
          console.log("No saved posts yet");
        }
      } else if (detectedUserType === 'requester') {
        // Fetch user's posts (if they've posted needs)
        try {
          const postsData = await postsAPI.getMyPosts();
          setMyPosts(postsData);
        } catch (error) {
          console.log("No posts yet");
        }
      }
    } catch (error) {
      console.log("Not authenticated");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Default to donor if no type selected
    const selectedUserType = localStorage.getItem('selected_user_type') || 'donor';
    const googleAuthUrl = authAPI.getGoogleAuthUrl(selectedUserType);
    window.location.href = googleAuthUrl;
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('selected_user_type');
      setUser(null);
      setProfile(null);
      setDonations([]);
      setMyPosts([]);
      toast.success("Logged out successfully");
      // Redirect to select-type page
      window.location.href = '/select-type';
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('selected_user_type');
      setUser(null);
      setProfile(null);
      toast.error("Failed to logout");
      // Redirect to select-type page even on error
      window.location.href = '/select-type';
    }
  };

  const handleViewPost = async (post: NeedPost) => {
    setSelectedPost(post);
    setPostDialogOpen(true);

    // Fetch donations for this post
    try {
      const donationsData = await donationsAPI.getByPost(post.id);
      setPostDonations(donationsData);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setPostDonations([]);
    }
  };

  const handleDeleteClick = (post: NeedPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      await postsAPI.deletePost(postToDelete.id);
      toast.success("Post deleted successfully");

      // Remove post from the list
      setMyPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete.id));

      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title="Profile">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-10 h-10 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Lanka Aid Connect
              </h2>
              <p className="text-muted-foreground">
                Sign in with Google to start donating or request aid
              </p>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <p className="text-xs text-muted-foreground">
              By signing in, you can donate items, track your impact, and request aid if needed
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const totalDonations = donations.length;
  const totalItemsDonated = donations.reduce((sum, d) => sum + d.quantity, 0);

  return (
    <PageLayout title="Profile">
      <div className="px-4 py-6 space-y-5">

        {/* Donor Profile - New UI */}
        {userType === 'donor' && (
          <div className="space-y-5">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">My Profile</h2>
                  <p className="text-primary-foreground/90 text-sm">
                    Member since {(() => {
                      try {
                        const date = new Date(user.created_at);
                        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      } catch {
                        return 'recently';
                      }
                    })()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user.full_name || 'Anonymous Donor'}</h3>
                  <p className="text-primary-foreground/90 text-sm">{user.email}</p>
                </div>
              </div>

              {/* Stats Cards - Horizontal */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/95 rounded-2xl shadow-md p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {profile?.families_helped || totalDonations}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Families</p>
                </div>

                <div className="bg-white/95 rounded-2xl shadow-md p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                    <Package className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{totalItemsDonated}</p>
                  <p className="text-xs text-muted-foreground font-medium">Items</p>
                </div>

                <div className="bg-white/95 rounded-2xl shadow-md p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                    <Award className="w-5 h-5 text-warning" />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {profile?.badges?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Badges</p>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-5">
              <h3 className="text-lg font-bold text-foreground mb-4">Achievements</h3>
              <div className="grid grid-cols-4 gap-3">
                {/* First Donation */}
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
                    totalDonations > 0 ? 'bg-accent/10' : 'bg-muted/50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full ${
                      totalDonations > 0 ? 'bg-accent/20' : 'bg-muted'
                    } flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${totalDonations > 0 ? 'text-accent' : 'text-muted-foreground/50'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${totalDonations > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    First Donation
                  </p>
                </div>

                {/* Helping Hand */}
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
                    totalDonations >= 5 ? 'bg-warning/10' : 'bg-muted/50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full ${
                      totalDonations >= 5 ? 'bg-warning/20' : 'bg-muted'
                    } flex items-center justify-center`}>
                      <svg className={`w-6 h-6 ${totalDonations >= 5 ? 'text-warning' : 'text-muted-foreground/50'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.5 4C5.6 4 4 5.6 4 7.5C4 9.4 5.6 11 7.5 11S11 9.4 11 7.5 9.4 4 7.5 4M16 17V19H2V17S2 13 9 13 16 17 16 17M14.5 11C13.1 11 12 12.1 12 13.5S13.1 16 14.5 16 17 14.9 17 13.5 15.9 11 14.5 11M22 17V19H18V17S18 16.5 18.5 15.9C19.4 16.6 20.6 17 22 17Z"/>
                      </svg>
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${totalDonations >= 5 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Helping Hand
                  </p>
                </div>

                {/* Community Hero */}
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
                    totalDonations >= 10 ? 'bg-success/10' : 'bg-muted/50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full ${
                      totalDonations >= 10 ? 'bg-success/20' : 'bg-muted'
                    } flex items-center justify-center`}>
                      <Star className={`w-6 h-6 ${totalDonations >= 10 ? 'text-success' : 'text-muted-foreground/50'}`} fill="currentColor" />
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${totalDonations >= 10 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Community Hero
                  </p>
                </div>

                {/* Super Donor */}
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
                    totalDonations >= 25 ? 'bg-primary/10' : 'bg-muted/50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full ${
                      totalDonations >= 25 ? 'bg-primary/20' : 'bg-muted'
                    } flex items-center justify-center`}>
                      <Shield className={`w-6 h-6 ${totalDonations >= 25 ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${totalDonations >= 25 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Super Donor
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requester Profile - New UI */}
        {userType === 'requester' && (
          <div className="space-y-5">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">My Requests</h2>
                  <p className="text-primary-foreground/90 text-sm">
                    Manage your help requests and see who's helping
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>

              {/* Stats Cards - Horizontal */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-white/95 rounded-2xl shadow-md p-4 text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {myPosts.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Active</p>
                </div>

                <div className="bg-white/95 rounded-2xl shadow-md p-4 text-center">
                  <p className="text-3xl font-bold text-success mb-1">
                    {myPosts.filter(p => p.status === 'fulfilled').length}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Fulfilled</p>
                </div>

                <div className="bg-white/95 rounded-2xl shadow-md p-4 text-center">
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {myPosts.reduce((sum, post) => {
                      const donorCount = post.donations?.length || 0;
                      return sum + donorCount;
                    }, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Donors</p>
                </div>
              </div>

              {/* Create New Request Button */}
              <Button
                asChild
                className="w-full mt-4 bg-white hover:bg-white/90 text-primary font-semibold h-12 text-base shadow-md"
              >
                <Link to="/post">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Request
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Your Requests Section - Requester Only */}
        {userType === 'requester' && myPosts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">Your Requests</h3>
            <div className="space-y-4">
              {myPosts.map((post) => {
                const progress = Math.min((post.quantity_donated / post.quantity_needed) * 100, 100);
                const isComplete = post.status === 'fulfilled';
                const itemsNeeded = post.quantity_needed - post.quantity_donated;

                return (
                  <div
                    key={post.id}
                    className="bg-card rounded-2xl shadow-md border border-border/50 p-5 animate-in"
                  >
                    {/* Header: Status, Time, Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${isComplete ? 'bg-success' : 'bg-primary'} text-white`}>
                          {post.status === 'active' ? 'Active' : post.status === 'fulfilled' ? 'Fulfilled' : post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(() => {
                            try {
                              const date = new Date(post.created_at);
                              if (isNaN(date.getTime())) return "recently";
                              return formatDistanceToNow(date, { addSuffix: true });
                            } catch {
                              return "recently";
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                        >
                          <Link to={`/need/${post.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(post);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-lg font-bold text-foreground mb-2">{post.title}</h4>

                    {/* Category Badge */}
                    <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-accent/20">
                      {post.category || 'Food'}
                    </Badge>

                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-success' : 'bg-warning'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {post.quantity_donated} of {post.quantity_needed} received
                        </span>
                        <span className="font-semibold text-foreground">{itemsNeeded} needed</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        onClick={() => handleViewPost(post)}
                      >
                        <Users className="w-4 h-4" />
                        View Donors ({post.donations?.length || 0})
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex items-center justify-center gap-2 text-primary hover:text-primary hover:bg-primary/10"
                        asChild
                      >
                        <Link to={`/need/${post.id}`}>
                          <Eye className="w-4 h-4" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Saved Posts - Donor Only */}
        {userType === 'donor' && savedPosts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Saved Posts
            </h3>
            <div className="space-y-3">
              {savedPosts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  to={`/need/${post.id}`}
                  className="block bg-card rounded-2xl shadow-md border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-200 p-4 animate-in"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{post.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.location_district}
                        </span>
                        <span>
                          {post.quantity_donated}/{post.quantity_needed} items
                        </span>
                      </div>
                    </div>
                    <Badge className={post.status === 'fulfilled' ? 'bg-success' : 'bg-warning'}>
                      {post.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Donation History - Donor Only */}
        {userType === 'donor' && donations.length > 0 && (
          <div className="bg-card rounded-2xl shadow-md border border-border/50 p-5">
            <h3 className="text-lg font-bold text-foreground mb-4">Donation History</h3>
            <div className="space-y-3">
              {donations.slice(0, 5).map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {donation.message || 'Emergency Supplies'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {(() => {
                          try {
                            const date = new Date(donation.created_at);
                            if (isNaN(date.getTime())) return "recently";
                            return formatDistanceToNow(date, { addSuffix: true });
                          } catch {
                            return "recently";
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{donation.quantity} items</p>
                    <p className="text-xs text-success">Delivered</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Donor */}
        {userType === 'donor' && donations.length === 0 && savedPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No donations yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start making a difference by donating to families in need
            </p>
            <Button asChild variant="default">
              <Link to="/">
                Browse Needs
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}

        {/* Empty State - Requester */}
        {userType === 'requester' && myPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No requests posted
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first aid request to get help from the community
            </p>
            <Button asChild variant="default">
              <Link to="/post">
                <Plus className="w-4 h-4 mr-1" />
                Post Aid Request
              </Link>
            </Button>
          </div>
        )}

        {/* People Helping You Dialog */}
        <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
          <DialogContent className="max-w-lg p-0 !gap-0 max-sm:!left-4 max-sm:!right-4 max-sm:!w-auto max-sm:!top-[50%] max-sm:!bottom-auto max-sm:!translate-x-0 max-sm:!translate-y-[-50%] max-sm:!h-auto max-sm:!max-h-[90vh]">
            {selectedPost && (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-border/50 px-6 py-4 z-10">
                  <DialogTitle className="text-xl font-bold text-foreground">
                    People Helping You
                  </DialogTitle>
                </div>

                <div className="px-6 py-4 space-y-4 pb-6">
                  {/* Stats Section */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground mb-1">
                        {postDonations.length}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">Total Donors</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary mb-1">
                        {selectedPost.quantity_donated}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">Items Pledged</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-success mb-1">
                        {selectedPost.quantity_donated}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">Delivered</p>
                    </div>
                  </div>

                  {/* Donors List */}
                  {postDonations.length > 0 ? (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                      {postDonations.map((donation, index) => {
                        // Determine status based on donation (for demo, using random status)
                        const statuses = ['delivered', 'in_transit', 'pledged'];
                        const status = index === 0 ? 'delivered' : index === 1 ? 'in_transit' : 'pledged';

                        return (
                          <div
                            key={donation.id}
                            className="bg-card rounded-2xl shadow-sm border border-border/50 p-4"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              {/* Avatar */}
                              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                                {donation.donor?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                              </div>

                              {/* Donor Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-foreground">
                                    {donation.donor?.full_name || 'Anonymous'}
                                  </h4>
                                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                  <Package className="w-3.5 h-3.5" />
                                  <span className="font-medium">{donation.quantity} items</span>
                                </div>

                                {/* Status Badge */}
                                <Badge
                                  className={`${
                                    status === 'delivered'
                                      ? 'bg-success/10 text-success border-success/20'
                                      : status === 'in_transit'
                                      ? 'bg-warning/10 text-warning border-warning/20'
                                      : 'bg-primary/10 text-primary border-primary/20'
                                  } font-medium`}
                                  variant="outline"
                                >
                                  {status === 'delivered' ? 'Delivered' : status === 'in_transit' ? 'In Transit' : 'Pledged'}
                                </Badge>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-1.5 mb-3 ml-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                                <span>Pledged {(() => {
                                  try {
                                    const date = new Date(donation.created_at);
                                    if (isNaN(date.getTime())) return "recently";
                                    return formatDistanceToNow(date, { addSuffix: true });
                                  } catch {
                                    return "recently";
                                  }
                                })()}</span>
                              </div>
                              {status !== 'pledged' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <div className={`w-2 h-2 rounded-full ${status === 'delivered' ? 'bg-success' : 'bg-warning'} shrink-0`}></div>
                                  <span>{status === 'delivered' ? 'Delivered' : 'In transit'} {(() => {
                                    try {
                                      const date = new Date(donation.created_at);
                                      if (isNaN(date.getTime())) return "recently";
                                      // Add 1 day for demo
                                      const updatedDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
                                      return formatDistanceToNow(updatedDate, { addSuffix: true });
                                    } catch {
                                      return "recently";
                                    }
                                  })()}</span>
                                </div>
                              )}
                            </div>

                            {/* Message */}
                            {donation.message && (
                              <div className="bg-muted/30 rounded-xl p-3 mb-3 text-sm text-muted-foreground italic">
                                "{donation.message}"
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center justify-center gap-2"
                                onClick={() => {
                                  // WhatsApp functionality
                                  toast.success("WhatsApp integration coming soon");
                                }}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                WhatsApp
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center justify-center gap-2"
                                onClick={() => {
                                  // Call functionality
                                  toast.success("Call functionality coming soon");
                                }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Call
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-muted/30 rounded-2xl">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="font-semibold text-foreground mb-1">No donations yet</p>
                      <p className="text-sm text-muted-foreground">
                        Share your request to get help from the community
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
                All associated data including donations will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}
