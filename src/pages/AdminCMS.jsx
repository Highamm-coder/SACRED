import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BookOpen, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Image,
  Layout,
  TrendingUp,
  UserCheck,
  DollarSign,
  Heart
} from 'lucide-react';
import { 
  educationResourceService, 
  productRecommendationService,
  reflectionQuestionsService,
  userManagementService,
  analyticsService,
  requireAdmin
} from '@/api/services/cms';
import { assessmentService } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Individual CMS Section Components
import ResourceManagement from '@/components/cms/ResourceManagement';
import ProductManagement from '@/components/cms/ProductManagement';
import ReflectionManagement from '@/components/cms/ReflectionManagement';
import UserManagement from '@/components/cms/UserManagement';
import MediaManagement from '@/components/cms/MediaManagement';
import AssessmentManagement from '@/components/cms/AssessmentManagement';

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      await requireAdmin();
      setIsAuthorized(true);
      await loadDashboardStats();
    } catch (error) {
      console.error('Admin access denied:', error);
      navigate(createPageUrl('Home'));
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const stats = await analyticsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#C4756B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5B73] font-sacred">Loading CMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-[#2F4F3F] font-sacred">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-[#6B5B73] font-sacred mb-4">
              You need admin privileges to access the CMS.
            </p>
            <Button onClick={() => navigate(createPageUrl('Home'))}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB]">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-sacred-bold text-[#2F4F3F] mb-2">
            SACRED CMS
          </h1>
          <p className="text-[#6B5B73] font-sacred">
            Content Management System - Admin Dashboard
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="reflections" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Reflections
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Content Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-sacred text-[#6B5B73]">Education Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-sacred-bold text-[#2F4F3F]">
                      {(dashboardStats.resources?.published || 0) + (dashboardStats.resources?.draft || 0)}
                    </div>
                    <BookOpen className="w-5 h-5 text-[#C4756B]" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {dashboardStats.resources?.published || 0} Published
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {dashboardStats.resources?.draft || 0} Draft
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-sacred text-[#6B5B73]">Shop Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-sacred-bold text-[#2F4F3F]">
                      {(dashboardStats.products?.active || 0)}
                    </div>
                    <ShoppingBag className="w-5 h-5 text-[#C4756B]" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {dashboardStats.products?.active || 0} Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-sacred text-[#6B5B73]">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-sacred-bold text-[#2F4F3F]">
                      {dashboardStats.users?.total || 0}
                    </div>
                    <Users className="w-5 h-5 text-[#C4756B]" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {dashboardStats.users?.recentSignups || 0} This Month
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {dashboardStats.users?.conversionRate || 0}% Paid
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-sacred text-[#6B5B73]">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-sacred-bold text-[#2F4F3F]">
                      {dashboardStats.users?.paidUsers || 0}
                    </div>
                    <DollarSign className="w-5 h-5 text-[#C4756B]" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Paid Users
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sacred text-[#2F4F3F]">Quick Actions</CardTitle>
                <CardDescription className="font-sacred">
                  Common CMS tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('resources')}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm">New Education Resource</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('products')}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-sm">New Shop Product</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('media')}
                  >
                    <Image className="w-5 h-5" />
                    <span className="text-sm">Upload Media</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('users')}
                  >
                    <UserCheck className="w-5 h-5" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sacred text-[#2F4F3F]">Recent Activity</CardTitle>
                <CardDescription className="font-sacred">
                  Latest content and user activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-[#6B5B73] font-sacred py-8">
                  Activity feed coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment">
            <AssessmentManagement />
          </TabsContent>

          <TabsContent value="reflections">
            <ReflectionManagement />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="media">
            <MediaManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}