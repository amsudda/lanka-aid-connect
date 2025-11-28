import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authAPI, donationsAPI, postsAPI } from "@/services/api";
import { NeedPost, Donation } from "@/types/database";
import {
  Heart, Users, Package, MapPin, Award, LogIn,
  ChevronRight, Star, Shield, Zap, Gift, FileText, Bookmark, Plus,
  Edit, Eye, TrendingUp, Clock, CheckCircle2
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
    const googleAuthUrl = authAPI.getGoogleAuthUrl();
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
        {/* Profile Header */}
        <div className="bg-card rounded-2xl shadow-md overflow-hidden border border-border/50">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-card shadow-sm"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">
                  {user.full_name || 'Anonymous User'}
                </h2>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                {profile?.badges && profile.badges.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {profile.badges.map((badge: string) => (
                      <Badge
                        key={badge}
                        variant="secondary"
                        className={`text-xs ${badgeColors[badge] || ''}`}
                      >
                        {badgeIcons[badge]}
                        <span className="ml-1">{badge}</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Donor Profile */}
        {userType === 'donor' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalDonations}</p>
                  <p className="text-xs text-muted-foreground">Donations</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalItemsDonated}</p>
                  <p className="text-xs text-muted-foreground">Items Given</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {profile?.families_helped || totalDonations}
                  </p>
                  <p className="text-xs text-muted-foreground">Families Helped</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Bookmark className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{savedPosts.length}</p>
                  <p className="text-xs text-muted-foreground">Saved Posts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Requester Profile */}
        {userType === 'requester' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{myPosts.length}</p>
                  <p className="text-xs text-muted-foreground">Active Requests</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <Package className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {myPosts.reduce((sum, post) => sum + post.quantity_donated, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Items Received</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-warning/10">
                  <CheckCircle2 className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {myPosts.filter(p => p.status === 'fulfilled').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Fulfilled</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {myPosts.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Posted Needs - Requester Only */}
        {userType === 'requester' && myPosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                My Aid Requests
              </h3>
              <Button asChild variant="default" size="sm">
                <Link to="/post">
                  <Plus className="w-4 h-4 mr-1" />
                  New Request
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {myPosts.map((post) => {
                const progress = Math.min((post.quantity_donated / post.quantity_needed) * 100, 100);
                const isComplete = post.status === 'fulfilled';

                return (
                  <div
                    key={post.id}
                    className="group bg-card rounded-2xl shadow-md border border-border/50 hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer animate-in"
                    onClick={() => handleViewPost(post)}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg text-foreground truncate">{post.title}</h4>
                            {isComplete && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {post.location_district}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {(() => {
                                try {
                                  const date = new Date(post.created_at);
                                  if (isNaN(date.getTime())) return "Recently";
                                  return formatDistanceToNow(date, { addSuffix: true });
                                } catch {
                                  return "Recently";
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                        <Badge className={isComplete ? 'bg-success' : 'bg-primary'}>
                          {post.status}
                        </Badge>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-lg font-bold text-foreground">{post.quantity_donated}</p>
                          <p className="text-xs text-muted-foreground">Received</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="w-4 h-4 text-warning" />
                          </div>
                          <p className="text-lg font-bold text-foreground">{post.quantity_needed}</p>
                          <p className="text-xs text-muted-foreground">Needed</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="w-4 h-4 text-success" />
                          </div>
                          <p className="text-lg font-bold text-foreground">{post.donations?.length || 0}</p>
                          <p className="text-xs text-muted-foreground">Donors</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Progress</span>
                          <span className="font-bold text-foreground">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isComplete ? 'progress-complete' : 'progress-urgent'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPost(post);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          asChild
                          variant="default"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`/need/${post.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Post
                          </Link>
                        </Button>
                      </div>
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

        {/* Recent Donations - Donor Only */}
        {userType === 'donor' && donations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Recent Donations
            </h3>
            <div className="space-y-3">
              {donations.slice(0, 5).map((donation) => (
                <div
                  key={donation.id}
                  className="bg-card rounded-2xl shadow-md border border-border/50 p-4 animate-in"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        Donated {donation.quantity} items
                      </p>
                      {donation.message && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          "{donation.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {(() => {
                          try {
                            const date = new Date(donation.created_at);
                            if (isNaN(date.getTime())) return "Recently";
                            return formatDistanceToNow(date, { addSuffix: true });
                          } catch {
                            return "Recently";
                          }
                        })()}
                      </p>
                    </div>
                    <Heart className="w-5 h-5 text-accent shrink-0" />
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

        {/* Post Detail Dialog */}
        <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedPost && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {selectedPost.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Status and Progress */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={selectedPost.status === 'fulfilled' ? 'bg-success' : 'bg-primary'}>
                        {selectedPost.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Posted {(() => {
                          try {
                            const date = new Date(selectedPost.created_at);
                            if (isNaN(date.getTime())) return "recently";
                            return formatDistanceToNow(date, { addSuffix: true });
                          } catch {
                            return "recently";
                          }
                        })()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">
                          {Math.round((selectedPost.quantity_donated / selectedPost.quantity_needed) * 100)}%
                        </span>
                      </div>
                      <div className="h-3 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((selectedPost.quantity_donated / selectedPost.quantity_needed) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{selectedPost.quantity_donated} received</span>
                        <span>{selectedPost.quantity_needed} needed</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedPost.description}</p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedPost.location_city ? `${selectedPost.location_city}, ` : ''}{selectedPost.location_district}</span>
                  </div>

                  {/* Donors List */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Donors ({postDonations.length})
                    </h4>

                    {postDonations.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {postDonations.map((donation, index) => (
                          <div
                            key={donation.id}
                            className="bg-background/50 rounded-xl p-3 border border-border/50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                    {donation.donor?.full_name?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{donation.donor?.full_name || 'Anonymous'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(() => {
                                        try {
                                          const date = new Date(donation.created_at);
                                          if (isNaN(date.getTime())) return "Recently";
                                          return formatDistanceToNow(date, { addSuffix: true });
                                        } catch {
                                          return "Recently";
                                        }
                                      })()}
                                    </p>
                                  </div>
                                </div>
                                {donation.message && (
                                  <p className="text-sm text-muted-foreground mt-2 pl-10">
                                    "{donation.message}"
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                <Package className="w-3 h-3 mr-1" />
                                {donation.quantity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-muted/30 rounded-xl">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No donations yet</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button asChild variant="default" className="flex-1">
                      <Link to={`/need/${selectedPost.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Post
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPostDialogOpen(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
