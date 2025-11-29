import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '@/services/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  ArrowLeft,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  BadgeCheck
} from 'lucide-react';

export default function AdminPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  useEffect(() => {
    if (!adminAPI.isLoggedIn()) {
      navigate('/admin/login');
      return;
    }

    fetchPosts();
  }, [navigate, statusFilter, currentPage]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminAPI.getPosts(statusFilter, currentPage);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
      if (err.message.includes('Authentication') || err.message.includes('denied')) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await adminAPI.updatePostStatus(postId, newStatus);
      // Refresh posts
      fetchPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to update post status');
    }
  };

  const handleToggleVerification = async (postId: string, currentVerified: boolean) => {
    try {
      await adminAPI.updatePostStatus(postId, undefined, !currentVerified);
      // Refresh posts
      fetchPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to update verification status');
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostId) return;

    try {
      await adminAPI.deletePost(deletePostId);
      setDeletePostId(null);
      // Refresh posts
      fetchPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
      setDeletePostId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-cyan-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Post Moderation</h1>
                  <p className="text-sm text-gray-600">Manage and moderate all posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No posts found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          {post.is_verified && (
                            <BadgeCheck className="w-5 h-5 text-blue-500" fill="currentColor" />
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          Posted by {post.user?.full_name || 'Unknown'} ({post.user?.email})
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">{post.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">District:</span>
                          <p className="font-medium">{post.district}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <p className="font-medium">{post.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <p className="font-medium">
                            {post.quantity_donated || 0} / {post.quantity_needed}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Urgency:</span>
                          <p className="font-medium">{post.urgency_level}</p>
                        </div>
                      </div>

                      {post.images && post.images.length > 0 && (
                        <div className="flex space-x-2">
                          {post.images.slice(0, 3).map((image: any, idx: number) => (
                            <img
                              key={image.id}
                              src={image.image_url}
                              alt={`Post ${idx + 1}`}
                              className="w-24 h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant={post.is_verified ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleVerification(post.id, post.is_verified)}
                            className={post.is_verified ? "bg-blue-600 hover:bg-blue-700" : ""}
                          >
                            <BadgeCheck className="h-4 w-4 mr-1" />
                            {post.is_verified ? "Verified" : "Verify"}
                          </Button>

                          <Select
                            value={post.status}
                            onValueChange={(value) => handleStatusChange(post.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="fulfilled">Fulfilled</SelectItem>
                              <SelectItem value="flagged">Flagged</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletePostId(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              All associated donations and data will be preserved but the post will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
