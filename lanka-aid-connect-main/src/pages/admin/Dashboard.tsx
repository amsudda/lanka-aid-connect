import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '@/services/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  FileText,
  Users,
  Flag,
  Heart,
  LogOut,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
  stats: {
    posts: { total: number; active: number; fulfilled: number; pending: number };
    users: { total: number; donors: number; requesters: number };
    flags: { pending: number };
    donations: { total: number; items: number };
  };
  recentActivity: {
    posts: any[];
    flags: any[];
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    if (!adminAPI.isLoggedIn()) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard stats');
      if (err.message.includes('Authentication') || err.message.includes('denied')) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    adminAPI.logout();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Lanka Aid Connect</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Posts Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Posts
                  </CardTitle>
                  <FileText className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.stats.posts.total}</div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                    <span className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      {stats.stats.posts.active} active
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 text-blue-600" />
                      {stats.stats.posts.fulfilled} fulfilled
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Users Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Users
                  </CardTitle>
                  <Users className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.stats.users.total}</div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                    <span>{stats.stats.users.donors} donors</span>
                    <span>{stats.stats.users.requesters} requesters</span>
                  </div>
                </CardContent>
              </Card>

              {/* Flags Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Flags
                  </CardTitle>
                  <Flag className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.stats.flags.pending}</div>
                  <p className="text-xs text-gray-600 mt-2">
                    {stats.stats.flags.pending > 0 ? 'Requires attention' : 'All clear'}
                  </p>
                </CardContent>
              </Card>

              {/* Donations Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Donations
                  </CardTitle>
                  <Heart className="w-4 h-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.stats.donations.total}</div>
                  <p className="text-xs text-gray-600 mt-2">
                    {stats.stats.donations.items} items donated
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/admin/posts">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-cyan-600" />
                      Manage Posts
                    </CardTitle>
                    <CardDescription>
                      Review, approve, or delete posts
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/admin/flags">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flag className="mr-2 h-5 w-5 text-red-600" />
                      Review Flags
                    </CardTitle>
                    <CardDescription>
                      Handle flagged content reports
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/admin/users">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-600" />
                      Manage Users
                    </CardTitle>
                    <CardDescription>
                      Verify or manage user accounts
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Latest posts created on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity.posts.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentActivity.posts.map((post: any) => (
                        <div
                          key={post.id}
                          className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{post.title}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              by {post.user?.full_name || 'Unknown'}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              post.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : post.status === 'fulfilled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent posts
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Flags */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Flags</CardTitle>
                  <CardDescription>Latest content flags pending review</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity.flags.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentActivity.flags.map((flag: any) => (
                        <div
                          key={flag.id}
                          className="flex items-start justify-between p-3 bg-red-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {flag.post?.title || 'Unknown Post'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{flag.reason}</p>
                          </div>
                          <AlertCircle className="w-4 h-4 text-red-600 mt-1" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No pending flags
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
