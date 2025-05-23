
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ReportForm } from '@/components/ReportForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ExternalLink, Flag } from 'lucide-react';

export const RedirectPage = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!shortCode) return;

      try {
        const { data, error } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('short_code', shortCode)
          .eq('status', 'active')
          .single();

        if (error || !data) {
          setLoading(false);
          return;
        }

        setLink(data);

        // Update click count
        await supabase
          .from('shortened_links')
          .update({ clicks: (data.clicks || 0) + 1 })
          .eq('id', data.id);

        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = data.original_url;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setLoading(false);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Error fetching link:', error);
        setLoading(false);
      }
    };

    fetchAndRedirect();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل الرابط...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">الرابط غير موجود</h2>
            <p className="text-gray-600">
              عذراً، الرابط المطلوب غير موجود أو تم حذفه.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showReport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-4">
          <ReportForm 
            shortCode={shortCode!} 
            onSuccess={() => setShowReport(false)} 
          />
          <Button 
            variant="outline" 
            onClick={() => setShowReport(false)}
            className="w-full"
          >
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-6xl font-bold text-blue-600">{countdown}</div>
          
          <h2 className="text-xl font-semibold">جاري إعادة التوجيه...</h2>
          
          <p className="text-gray-600">
            سيتم توجيهك إلى الرابط خلال {countdown} ثانية
          </p>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500 break-all">
              {link.title && <strong>{link.title}</strong>}
            </p>
            <p className="text-xs text-gray-400 break-all" dir="ltr">
              {link.original_url}
            </p>
          </div>
          
          <div className="flex space-x-2 justify-center">
            <Button
              onClick={() => window.location.href = link.original_url}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>انتقال فوري</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowReport(true)}
              className="flex items-center space-x-2"
            >
              <Flag className="h-4 w-4" />
              <span>إبلاغ</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
