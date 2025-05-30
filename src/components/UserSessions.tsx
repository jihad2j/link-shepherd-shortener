
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Monitor, Smartphone, Tablet, Eye, Globe, Clock, User } from 'lucide-react';

interface UserSession {
  id: string;
  user_id: string | null;
  session_id: string;
  ip_address: string | null;
  user_agent: string | null;
  browser_info: any;
  location_info: any;
  cookies_data: any;
  first_visit: string;
  last_activity: string;
  page_views: number | null;
  referrer: string | null;
  device_type: string | null;
  screen_resolution: string | null;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export const UserSessions = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الجلسات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getTimeDifference = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `منذ ${diffHours} ساعة`;
    } else if (diffMinutes > 0) {
      return `منذ ${diffMinutes} دقيقة`;
    } else {
      return 'الآن';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-600" />
          جلسات المستخدمين
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد جلسات مسجلة بعد
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>الجهاز</TableHead>
                <TableHead>عدد المشاهدات</TableHead>
                <TableHead>أول زيارة</TableHead>
                <TableHead>آخر نشاط</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="space-y-1">
                      {session.profiles ? (
                        <>
                          <div className="font-medium">{session.profiles.full_name || 'غير محدد'}</div>
                          <div className="text-sm text-gray-600">{session.profiles.email}</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <User className="h-4 w-4" />
                          زائر مجهول
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device_type)}
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {session.device_type || 'غير محدد'}
                        </Badge>
                        {session.screen_resolution && (
                          <div className="text-xs text-gray-500">{session.screen_resolution}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {session.page_views || 1} مشاهدة
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(session.first_visit).toLocaleDateString('ar-SA')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{getTimeDifference(session.last_activity)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.last_activity).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSession(session)}
                        >
                          <Eye className="h-4 w-4" />
                          عرض التفاصيل
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>تفاصيل الجلسة</DialogTitle>
                        </DialogHeader>
                        {selectedSession && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">معلومات المستخدم</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>البريد الإلكتروني:</strong> {selectedSession.profiles?.email || 'زائر مجهول'}</p>
                                  <p><strong>الاسم:</strong> {selectedSession.profiles?.full_name || 'غير محدد'}</p>
                                  <p><strong>معرف الجلسة:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{selectedSession.session_id}</code></p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">معلومات الجهاز</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>نوع الجهاز:</strong> {selectedSession.device_type || 'غير محدد'}</p>
                                  <p><strong>دقة الشاشة:</strong> {selectedSession.screen_resolution || 'غير محدد'}</p>
                                  <p><strong>عنوان IP:</strong> {selectedSession.ip_address || 'غير محدد'}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">معلومات المتصفح</h4>
                              <div className="bg-gray-50 p-3 rounded text-sm">
                                <p><strong>User Agent:</strong></p>
                                <p className="text-xs break-all">{selectedSession.user_agent}</p>
                              </div>
                            </div>
                            
                            {selectedSession.browser_info && (
                              <div>
                                <h4 className="font-semibold mb-2">تفاصيل المتصفح</h4>
                                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                                  <p><strong>اللغة:</strong> {selectedSession.browser_info.language}</p>
                                  <p><strong>المنصة:</strong> {selectedSession.browser_info.platform}</p>
                                  <p><strong>الكوكيز مفعلة:</strong> {selectedSession.browser_info.cookieEnabled ? 'نعم' : 'لا'}</p>
                                  <p><strong>متصل بالإنترنت:</strong> {selectedSession.browser_info.onLine ? 'نعم' : 'لا'}</p>
                                </div>
                              </div>
                            )}
                            
                            {selectedSession.cookies_data && Object.keys(selectedSession.cookies_data).length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">بيانات الكوكيز</h4>
                                <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                                  <pre className="text-xs">{JSON.stringify(selectedSession.cookies_data, null, 2)}</pre>
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-semibold mb-2">إحصائيات الزيارة</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p><strong>عدد المشاهدات:</strong> {selectedSession.page_views || 1}</p>
                                  <p><strong>المصدر:</strong> {selectedSession.referrer || 'مباشر'}</p>
                                </div>
                                <div>
                                  <p><strong>أول زيارة:</strong> {new Date(selectedSession.first_visit).toLocaleString('ar-SA')}</p>
                                  <p><strong>آخر نشاط:</strong> {new Date(selectedSession.last_activity).toLocaleString('ar-SA')}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
