
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Monitor, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserSession {
  id: string;
  session_id: string;
  user_id: string | null;
  ip_address: unknown;
  user_agent: string | null;
  device_type: string | null;
  browser_info: any;
  screen_resolution: string | null;
  referrer: string | null;
  location_info: any;
  cookies_data: any;
  page_views: number;
  first_visit: string;
  last_activity: string;
  profiles?: {
    email: string;
    full_name: string;
  } | null;
}

export const UserSessions = () => {
  const { user } = useAuth();
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
        .limit(100);

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      setSessions(data || []);
    } catch (error: any) {
      console.error('Error in fetchSessions:', error);
      toast({
        title: "خطأ في جلب الجلسات",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationDisplay = (locationInfo: any) => {
    if (!locationInfo) return 'غير محدد';
    
    const parts = [];
    if (locationInfo.city) parts.push(locationInfo.city);
    if (locationInfo.country) parts.push(locationInfo.country);
    if (locationInfo.region) parts.push(locationInfo.region);
    
    return parts.length > 0 ? parts.join(', ') : 'غير محدد';
  };

  const getBrowserDisplay = (browserInfo: any) => {
    if (!browserInfo) return 'غير محدد';
    
    const browser = browserInfo.name || 'غير محدد';
    const platform = browserInfo.platform || '';
    
    return platform ? `${browser} على ${platform}` : browser;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري تحميل الجلسات...</div>
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
          <div className="space-y-6">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* معلومات الجلسة الأساسية */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      معلومات الجلسة
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>معرف الجلسة:</strong> <span className="font-mono text-xs">{session.session_id.substring(0, 8)}...</span></p>
                      <p><strong>عنوان IP:</strong> {session.ip_address ? String(session.ip_address) : 'غير محدد'}</p>
                      <p><strong>نوع الجهاز:</strong> {session.device_type || 'غير محدد'}</p>
                      <p><strong>دقة الشاشة:</strong> {session.screen_resolution || 'غير محدد'}</p>
                      <p><strong>عدد الصفحات:</strong> {session.page_views}</p>
                    </div>
                  </div>

                  {/* معلومات المتصفح والموقع */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      المتصفح والموقع
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>المتصفح:</strong> {getBrowserDisplay(session.browser_info)}</p>
                      <p><strong>الموقع الجغرافي:</strong> 
                        <span className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {getLocationDisplay(session.location_info)}
                        </span>
                      </p>
                      <p><strong>المرجع:</strong> {session.referrer || 'مباشر'}</p>
                      {session.browser_info?.language && (
                        <p><strong>اللغة:</strong> {session.browser_info.language}</p>
                      )}
                    </div>
                  </div>

                  {/* معلومات التوقيت والمستخدم */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">التوقيت والمستخدم</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>أول زيارة:</strong> {formatDate(session.first_visit)}</p>
                      <p><strong>آخر نشاط:</strong> {formatDate(session.last_activity)}</p>
                      {session.profiles && (
                        <div className="pt-2 border-t">
                          <p><strong>المستخدم:</strong></p>
                          <p className="text-blue-600">{session.profiles.full_name || session.profiles.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* معلومات إضافية */}
                {(session.browser_info?.onLine !== undefined || session.browser_info?.cookieEnabled !== undefined) && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">معلومات تقنية إضافية:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                      {session.browser_info?.onLine !== undefined && (
                        <p>متصل: {session.browser_info.onLine ? 'نعم' : 'لا'}</p>
                      )}
                      {session.browser_info?.cookieEnabled !== undefined && (
                        <p>الكوكيز: {session.browser_info.cookieEnabled ? 'مفعل' : 'معطل'}</p>
                      )}
                      {session.browser_info?.hardwareConcurrency && (
                        <p>المعالجات: {session.browser_info.hardwareConcurrency}</p>
                      )}
                      {session.browser_info?.memory && (
                        <p>الذاكرة: {session.browser_info.memory} GB</p>
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
