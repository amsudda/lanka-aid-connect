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
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function AdminFlags() {
  const navigate = useNavigate();
  const [flags, setFlags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState(false);
  const [actionFlag, setActionFlag] = useState<{ id: string; action: 'approve' | 'dismiss' } | null>(null);

  useEffect(() => {
    if (!adminAPI.isLoggedIn()) {
      navigate('/admin/login');
      return;
    }

    fetchFlags();
  }, [navigate, resolvedFilter]);

  const fetchFlags = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminAPI.getFlags(resolvedFilter);
      setFlags(data.flags);
    } catch (err: any) {
      setError(err.message || 'Failed to load flags');
      if (err.message.includes('Authentication') || err.message.includes('denied')) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveFlag = async () => {
    if (!actionFlag) return;

    try {
      await adminAPI.resolveFlag(actionFlag.id, actionFlag.action);
      setActionFlag(null);
      // Refresh flags
      fetchFlags();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve flag');
      setActionFlag(null);
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
                  <h1 className="text-xl font-bold text-gray-900">Flag Management</h1>
                  <p className="text-sm text-gray-600">Review and resolve flagged content</p>
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
                <Select
                  value={resolvedFilter ? 'resolved' : 'pending'}
                  onValueChange={(value) => setResolvedFilter(value === 'resolved')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Flags</SelectItem>
                    <SelectItem value="resolved">Resolved Flags</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flags List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading flags...</p>
          </div>
        ) : flags.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {resolvedFilter ? 'No resolved flags' : 'No pending flags'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {flags.map((flag) => (
              <Card key={flag.id} className={flag.is_resolved ? 'bg-gray-50' : 'border-red-200'}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <CardTitle className="text-lg">
                          Flagged Post: {flag.post?.title || 'Unknown Post'}
                        </CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        Posted by {flag.post?.user?.full_name || 'Unknown'} ({flag.post?.user?.email})
                      </CardDescription>
                    </div>
                    {flag.is_resolved ? (
                      <Badge className="bg-green-100 text-green-800">
                        Resolved
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        Pending
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Flag Reason:</h4>
                      <p className="text-sm bg-red-50 p-3 rounded border border-red-100">
                        {flag.reason}
                      </p>
                    </div>

                    {flag.details && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Additional Details:</h4>
                        <p className="text-sm text-gray-600">{flag.details}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-2 border-t">
                      <div>
                        <span className="text-gray-600">Post Status:</span>
                        <p className="font-medium">{flag.post?.status || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Flagged On:</span>
                        <p className="font-medium">
                          {new Date(flag.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {flag.is_resolved && (
                        <div>
                          <span className="text-gray-600">Resolved On:</span>
                          <p className="font-medium">
                            {new Date(flag.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {!flag.is_resolved && (
                      <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActionFlag({ id: flag.id, action: 'dismiss' })}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Dismiss Flag
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setActionFlag({ id: flag.id, action: 'approve' })}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve & Hide Post
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionFlag} onOpenChange={() => setActionFlag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionFlag?.action === 'approve' ? 'Approve Flag' : 'Dismiss Flag'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionFlag?.action === 'approve' ? (
                <>
                  Are you sure you want to approve this flag? This will mark the flag as resolved
                  and change the post status to "flagged", effectively hiding it from public view.
                </>
              ) : (
                <>
                  Are you sure you want to dismiss this flag? This will mark the flag as resolved
                  without taking any action on the post.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolveFlag}
              className={actionFlag?.action === 'approve' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionFlag?.action === 'approve' ? 'Approve Flag' : 'Dismiss Flag'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
