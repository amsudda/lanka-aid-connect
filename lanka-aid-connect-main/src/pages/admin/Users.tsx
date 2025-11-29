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
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verifyAction, setVerifyAction] = useState<{ id: string; isVerified: boolean; userName: string } | null>(null);

  useEffect(() => {
    if (!adminAPI.isLoggedIn()) {
      navigate('/admin/login');
      return;
    }

    fetchUsers();
  }, [navigate, userTypeFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminAPI.getUsers(userTypeFilter, currentPage);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      if (err.message.includes('Authentication') || err.message.includes('denied')) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!verifyAction) return;

    try {
      await adminAPI.verifyUser(verifyAction.id, verifyAction.isVerified);
      setVerifyAction(null);
      // Refresh users
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user verification');
      setVerifyAction(null);
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
                  <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                  <p className="text-sm text-gray-600">Manage and verify user accounts</p>
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
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="donor">Donors</SelectItem>
                    <SelectItem value="requester">Requesters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{user.full_name}</CardTitle>
                          {user.is_verified && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <CardDescription className="mt-1">{user.email}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            user.user_type === 'donor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }
                        >
                          {user.user_type}
                        </Badge>
                        {user.is_verified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">User Type:</span>
                          <p className="font-medium capitalize">{user.user_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Joined:</span>
                          <p className="font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Login:</span>
                          <p className="font-medium">
                            {user.last_login
                              ? new Date(user.last_login).toLocaleDateString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t">
                        {user.is_verified ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setVerifyAction({
                                id: user.id,
                                isVerified: false,
                                userName: user.full_name
                              })
                            }
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Remove Verification
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              setVerifyAction({
                                id: user.id,
                                isVerified: true,
                                userName: user.full_name
                              })
                            }
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Verify User
                          </Button>
                        )}
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

      {/* Verification Confirmation Dialog */}
      <AlertDialog open={!!verifyAction} onOpenChange={() => setVerifyAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verifyAction?.isVerified ? 'Verify User' : 'Remove Verification'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verifyAction?.isVerified ? (
                <>
                  Are you sure you want to verify <strong>{verifyAction?.userName}</strong>?
                  This will mark the user as verified and may give them additional privileges.
                </>
              ) : (
                <>
                  Are you sure you want to remove verification from{' '}
                  <strong>{verifyAction?.userName}</strong>? This will mark the user as unverified.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyUser}
              className={verifyAction?.isVerified ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {verifyAction?.isVerified ? 'Verify User' : 'Remove Verification'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
