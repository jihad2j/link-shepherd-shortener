
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserSession {
  id: string;
  session_id: string;
  user_id: string | null;
  ip_address: string | null;
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
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>الجلسة:</strong> {session.session_id}</p>
                    <p><strong>عنوان IP:</strong> {session.ip_address || 'غير محدد'}</p>
                    <p><strong>نوع الجهاز:</strong> {session.device_type || 'غير محدد'}</p>
                    <p><strong>دقة الشاشة:</strong> {session.screen_resolution || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p><strong>المتصفح:</strong> {session.browser_info?.name || 'غير محدد'}</p>
                    <p><strong>المرجع:</strong> {session.referrer || 'مباشر'}</p>
                    <p><strong>عدد الصفحات:</strong> {session.page_views}</p>
                    <p><strong>أول زيارة:</strong> {formatDate(session.first_visit)}</p>
                    <p><strong>آخر نشاط:</strong> {formatDate(session.last_activity)}</p>
                  </div>
                </div>
                {session.profiles && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm"><strong>المستخدم:</strong> {session.profiles.full_name || session.profiles.email}</p>
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
