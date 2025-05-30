
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Cookie, Loader2, Calendar, Monitor } from 'lucide-react';

interface UserCookiesModalProps {
  userId: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SessionCookies {
  sessionId: string;
  lastActivity: string;
  deviceType: string;
  cookiesData: any;
  browserInfo: any;
}

export const UserCookiesModal = ({ userId, userEmail, isOpen, onClose }: UserCookiesModalProps) => {
  const [sessions, setSessions] = useState<SessionCookies[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('session_id, last_activity, device_type, cookies_data, browser_info')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching user sessions:', error);
        throw error;
      }

      setSessions(data || []);
    } catch (error: any) {
      console.error('Error in fetchUserSessions:', error);
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
    if (isOpen && userId) {
      fetchUserSessions();
    }
  }, [isOpen, userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCookieValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value || 'غير محدد');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            معلومات الكوكيز للمستخدم: {userEmail}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لا توجد جلسات لهذا المستخدم
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <Card key={session.sessionId || index} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      جلسة #{index + 1}
                    </span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.lastActivity)}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    <p><strong>نوع الجهاز:</strong> {session.deviceType || 'غير محدد'}</p>
                    <p><strong>المتصفح:</strong> {session.browserInfo?.name || 'غير محدد'}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">الكوكيز:</h5>
                      {session.cookiesData && Object.keys(session.cookiesData).length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {Object.entries(session.cookiesData).map(([key, value]) => (
                            <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                                <span className="font-medium text-blue-600 min-w-0 break-all">
                                  {key}:
                                </span>
                                <span className="text-gray-700 text-sm break-all">
                                  {renderCookieValue(value)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">لا توجد كوكيز لهذه الجلسة</p>
                      )}
                    </div>

                    {session.browserInfo && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">معلومات المتصفح الإضافية:</h5>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {session.browserInfo.language && (
                              <p><strong>اللغة:</strong> {session.browserInfo.language}</p>
                            )}
                            {session.browserInfo.platform && (
                              <p><strong>المنصة:</strong> {session.browserInfo.platform}</p>
                            )}
                            {session.browserInfo.cookieEnabled !== undefined && (
                              <p><strong>الكوكيز مفعلة:</strong> {session.browserInfo.cookieEnabled ? 'نعم' : 'لا'}</p>
                            )}
                            {session.browserInfo.onLine !== undefined && (
                              <p><strong>متصل:</strong> {session.browserInfo.onLine ? 'نعم' : 'لا'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
