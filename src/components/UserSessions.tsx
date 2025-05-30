
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Monitor, Smartphone, Tablet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserSession {
  id: string;
  session_id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  screen_resolution: string | null;
  browser_info: any;
  location_info: any;
  cookies_data: any;
  referrer: string | null;
  page_views: number | null;
  first_visit: string;
  last_activity: string;
  profiles?: {
    email: string;
    full_name: string;
  } | null;
}

export const UserSessions = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('last_activity', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      console.log('Sessions data:', data);
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error in fetchSessions:', error);
      toast({
        title: "خطأ في جلب جلسات المستخدمين",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري تحميل جلسات المستخدمين...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>جلسات المستخدمين</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لا توجد جلسات مستخدمين
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.device_type)}
                      <span className="font-medium">
                        {session.profiles?.email || 'مستخدم غير مسجل'}
                      </span>
                      {session.device_type && (
                        <Badge variant="secondary">{session.device_type}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {session.profiles?.full_name || 'غير محدد'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>آخر نشاط: {formatDate(session.last_activity)}</div>
                    <div>أول زيارة: {formatDate(session.first_visit)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">عنوان IP:</span>{' '}
                    <span className="text-gray-600">
                      {session.ip_address || 'غير محدد'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">عدد المشاهدات:</span>{' '}
                    <span className="text-gray-600">
                      {session.page_views || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">دقة الشاشة:</span>{' '}
                    <span className="text-gray-600">
                      {session.screen_resolution || 'غير محدد'}
                    </span>
                  </div>
                  {session.referrer && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <span className="font-medium">المرجع:</span>{' '}
                      <span className="text-gray-600 break-all">
                        {session.referrer}
                      </span>
                    </div>
                  )}
                  {session.user_agent && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <span className="font-medium">وكيل المستخدم:</span>{' '}
                      <span className="text-gray-600 break-all text-xs">
                        {session.user_agent}
                      </span>
                    </div>
                  )}
                </div>
                
                {(session.browser_info || session.location_info) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {session.browser_info && (
                        <div>
                          <span className="font-medium">معلومات المتصفح:</span>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(session.browser_info, null, 2)}
                          </pre>
                        </div>
                      )}
                      {session.location_info && (
                        <div>
                          <span className="font-medium">معلومات الموقع:</span>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(session.location_info, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
