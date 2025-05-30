
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportsManagement } from '@/components/ReportsManagement';
import { toast } from '@/hooks/use-toast';
import { Users, Shield, Ban, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            لوحة التحكم الإدارية
          </h1>
          <p className="text-gray-600 mt-2">إدارة المستخدمين والتقارير</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              إدارة المستخدمين
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              إدارة التقارير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>قائمة المستخدمين</CardTitle>
                <CardDescription>
                  يمكنك إدارة حالة المستخدمين وصلاحياتهم من هنا
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
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
                            <div className="flex gap-2">
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <ReportsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
