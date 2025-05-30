import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ReportsManagement } from '@/components/ReportsManagement';
import { UserSessions } from '@/components/UserSessions';
import { toast } from '@/hooks/use-toast';
import { Users, Shield, Ban, CheckCircle, Loader2, Cookie } from 'lucide-react';
import { UserCookiesModal } from '@/components/UserCookiesModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  status: string;
  created_at: string;
}

export const AdminPanel = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [cookiesModalOpen, setCookiesModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'users';

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(profiles.map(profile => 
        profile.id === userId 
          ? { ...profile, status: newStatus }
          : profile
      ));

      toast({
        title: "تم التحديث",
        description: `تم ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المستخدم",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(profiles.map(profile => 
        profile.id === userId 
          ? { ...profile, role: newRole }
          : profile
      ));

      toast({
        title: "تم التحديث",
        description: `تم تحديث دور المستخدم إلى ${newRole === 'admin' ? 'مشرف' : 'مستخدم'}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث دور المستخدم",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleViewCookies = (userId: string, userEmail: string) => {
    setSelectedUser({ id: userId, email: userEmail });
    setCookiesModalOpen(true);
  };

  const handleCloseCookiesModal = () => {
    setCookiesModalOpen(false);
    setSelectedUser(null);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600">هذه الصفحة مخصصة للمشرفين فقط</p>
        </div>
      </div>
    );
  }

  const renderMobileUserCard = (profile: Profile) => (
    <Card key={profile.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{profile.email}</h3>
            <p className="text-xs text-gray-500 truncate">{profile.full_name || 'غير محدد'}</p>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
              {profile.role === 'admin' ? 'مشرف' : 'مستخدم'}
            </Badge>
            <Badge variant={profile.status === 'active' ? 'default' : 'destructive'} className="text-xs">
              {profile.status === 'active' ? 'نشط' : 'معطل'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-gray-600">
          <strong>تاريخ الإنشاء:</strong> {new Date(profile.created_at).toLocaleDateString('ar-SA')}
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {profile.status === 'active' ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateUserStatus(profile.id, 'suspended')}
              disabled={updating === profile.id}
              className="text-xs h-8"
            >
              {updating === profile.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Ban className="h-3 w-3 mr-1" />
              )}
              تعطيل
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={() => updateUserStatus(profile.id, 'active')}
              disabled={updating === profile.id}
              className="text-xs h-8"
            >
              {updating === profile.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              تفعيل
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            {profile.role === 'user' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateUserRole(profile.id, 'admin')}
                disabled={updating === profile.id}
                className="text-xs h-8"
              >
                <Shield className="h-3 w-3 mr-1" />
                جعل مشرف
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateUserRole(profile.id, 'user')}
                disabled={updating === profile.id}
                className="text-xs h-8"
              >
                <Users className="h-3 w-3 mr-1" />
                جعل مستخدم
              </Button>
            )}

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleViewCookies(profile.id, profile.email)}
              className="text-xs h-8"
            >
              <Cookie className="h-3 w-3 mr-1" />
              الكوكيز
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">قائمة المستخدمين</CardTitle>
              <CardDescription className="text-sm">
                يمكنك إدارة حالة المستخدمين وصلاحياتهم من هنا
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : isMobile ? (
                <div className="space-y-4">
                  {profiles.map(renderMobileUserCard)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>الاسم الكامل</TableHead>
                        <TableHead>الدور</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.email}</TableCell>
                          <TableCell>{profile.full_name || 'غير محدد'}</TableCell>
                          <TableCell>
                            <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                              {profile.role === 'admin' ? 'مشرف' : 'مستخدم'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={profile.status === 'active' ? 'default' : 'destructive'}>
                              {profile.status === 'active' ? 'نشط' : 'معطل'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              {profile.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateUserStatus(profile.id, 'suspended')}
                                  disabled={updating === profile.id}
                                >
                                  {updating === profile.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Ban className="h-4 w-4" />
                                  )}
                                  تعطيل
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => updateUserStatus(profile.id, 'active')}
                                  disabled={updating === profile.id}
                                >
                                  {updating === profile.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  تفعيل
                                </Button>
                              )}
                              
                              {profile.role === 'user' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateUserRole(profile.id, 'admin')}
                                  disabled={updating === profile.id}
                                >
                                  <Shield className="h-4 w-4" />
                                  جعل مشرف
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateUserRole(profile.id, 'user')}
                                  disabled={updating === profile.id}
                                >
                                  <Users className="h-4 w-4" />
                                  جعل مستخدم
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleViewCookies(profile.id, profile.email)}
                              >
                                <Cookie className="h-4 w-4" />
                                الكوكيز
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'reports':
        return <ReportsManagement />;
      case 'sessions':
        return <UserSessions />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="flex items-center gap-2 border-b bg-white">
              <div className="max-w-7xl mx-auto w-full flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-3">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">لوحة التحكم الإدارية</h1>
              </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {renderTabContent()}
            </main>
          </div>
        </SidebarInset>
      </div>

      <UserCookiesModal
        userId={selectedUser?.id || ''}
        userEmail={selectedUser?.email || ''}
        isOpen={cookiesModalOpen}
        onClose={handleCloseCookiesModal}
      />
    </SidebarProvider>
  );
};
