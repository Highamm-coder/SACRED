import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Users,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Calendar,
  DollarSign,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { userManagementService } from '@/api/services/cms';
import { formatDistanceToNow } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table or cards

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'user',
    is_active: true,
    has_paid: false,
    onboarding_completed: false
  });

  const roles = [
    { value: 'user', label: 'User', color: 'bg-blue-100 text-blue-800', icon: '👤' },
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800', icon: '👑' },
    { value: 'moderator', label: 'Moderator', color: 'bg-purple-100 text-purple-800', icon: '🛡️' }
  ];

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const options = {};
      if (roleFilter !== 'all') options.role = roleFilter;
      
      const data = await userManagementService.listUsers(options);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active) ||
                         (statusFilter === 'paid' && user.has_paid) ||
                         (statusFilter === 'unpaid' && !user.has_paid);
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      role: user.role || 'user',
      is_active: user.is_active,
      has_paid: user.has_paid,
      onboarding_completed: user.onboarding_completed
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        await userManagementService.updateUserRole(editingUser.id, formData.role);
        await userManagementService.toggleUserStatus(editingUser.id, formData.is_active);
        // Note: In a real app, you'd need separate endpoints for other fields
      }
      // Note: Creating new users would typically be handled through auth system
      
      await loadUsers();
      resetForm();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userManagementService.toggleUserStatus(userId, !currentStatus);
      await loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userManagementService.updateUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'user',
      is_active: true,
      has_paid: false,
      onboarding_completed: false
    });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const getRoleBadge = (role) => {
    const roleConfig = roles.find(r => r.value === role) || roles[0];
    return (
      <Badge className={`${roleConfig.color} text-xs font-sacred`}>
        {roleConfig.icon} {roleConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    );
  };

  const getPaidBadge = (hasPaid) => {
    return hasPaid ? (
      <Badge className="bg-emerald-100 text-emerald-800">
        <DollarSign className="w-3 h-3 mr-1" />
        Paid
      </Badge>
    ) : (
      <Badge variant="outline" className="text-orange-600 border-orange-600">
        Unpaid
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-sacred-bold text-[#2F4F3F]">User Management</h2>
          <p className="text-[#6B5B73] font-sacred">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          >
            {viewMode === 'table' ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Card View
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Table View
              </>
            )}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-[#C4756B] hover:bg-[#B86761]">
                <Plus className="w-4 h-4 mr-2" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-sacred">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription className="font-sacred">
                  {editingUser ? 'Update user information and permissions.' : 'Add a new user to the system.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sacred">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                      disabled={!!editingUser} // Can't change email of existing user
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="font-sacred">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-sacred">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.icon} {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_active" className="font-sacred">Active Account</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has_paid"
                      checked={formData.has_paid}
                      onChange={(e) => setFormData({ ...formData, has_paid: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="has_paid" className="font-sacred">Paid Account</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="onboarding_completed"
                      checked={formData.onboarding_completed}
                      onChange={(e) => setFormData({ ...formData, onboarding_completed: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="onboarding_completed" className="font-sacred">Onboarding Completed</Label>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#C4756B] hover:bg-[#B86761]">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sacred text-gray-600">Total Users</p>
                <p className="text-2xl font-sacred-bold text-[#2F4F3F]">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-[#C4756B]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sacred text-gray-600">Active Users</p>
                <p className="text-2xl font-sacred-bold text-green-600">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sacred text-gray-600">Paid Users</p>
                <p className="text-2xl font-sacred-bold text-emerald-600">
                  {users.filter(u => u.has_paid).length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sacred text-gray-600">Admins</p>
                <p className="text-2xl font-sacred-bold text-red-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Display */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#C4756B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B5B73] font-sacred">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-[#C4756B]/50 mx-auto mb-4" />
              <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2">No Users Found</h3>
              <p className="text-[#6B5B73] font-sacred mb-4">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'No users match your current filters.' 
                  : 'No users found in the system.'
                }
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-sacred-bold text-[#2F4F3F] text-lg">
                          {user.full_name || 'No Name'}
                        </h3>
                        <p className="text-sm text-gray-600 font-sacred flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.is_active)}
                      {getPaidBadge(user.has_paid)}
                      {user.onboarding_completed && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Onboarded
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 font-sacred space-y-1">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                      {user.last_login_at && (
                        <p className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Last login {formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={user.is_active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                      >
                        {user.is_active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Table View
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-sacred text-[#2F4F3F]">User</th>
                      <th className="text-left p-4 font-sacred text-[#2F4F3F]">Role</th>
                      <th className="text-left p-4 font-sacred text-[#2F4F3F]">Status</th>
                      <th className="text-left p-4 font-sacred text-[#2F4F3F]">Payment</th>
                      <th className="text-left p-4 font-sacred text-[#2F4F3F]">Joined</th>
                      <th className="text-left p-4 font-sacred text-[#2F4F3F]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-sacred-bold text-[#2F4F3F]">
                              {user.full_name || 'No Name'}
                            </p>
                            <p className="text-sm text-gray-600 font-sacred">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {getStatusBadge(user.is_active)}
                            {user.onboarding_completed && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Onboarded
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {getPaidBadge(user.has_paid)}
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-sacred text-gray-600">
                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                              className={user.is_active ? "text-orange-600" : "text-green-600"}
                            >
                              {user.is_active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}