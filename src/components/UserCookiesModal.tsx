
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

      // Map the database fields to our interface
      const mappedSessions: SessionCookies[] = (data || []).map(session => ({
        sessionId: session.session_id,
        lastActivity: session.last_activity,
        deviceType: session.device_type || 'غير محدد',
        cookiesData: session.cookies_data,
        browserInfo: session.browser_info
      }));

      setSessions(mappedSessions);
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
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Cookie className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">معلومات الكوكيز للمستخدم: {userEmail}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                    <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        جلسة #{index + 1}
                      </span>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span className="hidden sm:inline">{formatDate(session.lastActivity)}</span>
                        <span className="sm:hidden">{new Date(session.lastActivity).toLocaleDateString('ar-SA')}</span>
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>نوع الجهاز:</strong> {session.deviceType}</p>
                      <p><strong>المتصفح:</strong> {session.browserInfo?.name || 'غير محدد'}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">الكوكيز:</h5>
                        {session.cookiesData && Object.keys(session.cookiesData).length > 0 ? (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                            {Object.entries(session.cookiesData).map(([key, value]) => (
                              <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium text-blue-600 text-xs sm:text-sm break-all">
                                    {key}:
                                  </span>
                                  <span className="text-gray-700 text-xs bg-white p-2 rounded border break-all max-h-20 overflow-y-auto">
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
                          <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">معلومات المتصفح الإضافية:</h5>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
                              {session.browserInfo.language && (
                                <p className="break-all"><strong>اللغة:</strong> {session.browserInfo.language}</p>
                              )}
                              {session.browserInfo.platform && (
                                <p className="break-all"><strong>المنصة:</strong> {session.browserInfo.platform}</p>
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
        </div>

        <div className="flex justify-end p-4 sm:p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
