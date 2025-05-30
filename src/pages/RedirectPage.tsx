
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportLinkButton } from '@/components/ReportLinkButton';
import { ExternalLink, AlertTriangle, Clock, Eye } from 'lucide-react';

export const RedirectPage = () => {
  const { shortCode } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [linkData, setLinkData] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const [showAd, setShowAd] = useState(false);
  const [adViewed, setAdViewed] = useState(false);
  const [isDirectRedirect, setIsDirectRedirect] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError('رمز الرابط غير صالح');
        return;
      }

      try {
        // البحث عن الرابط المختصر
        const { data: linkInfo, error: linkError } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('short_code', shortCode)
          .single();

        if (linkError || !linkInfo) {
          setError('الرابط غير موجود أو انتهت صلاحيته');
          return;
        }

        // التحقق من حالة الرابط
        if (linkInfo.status !== 'active') {
          setError('هذا الرابط غير متاح حالياً');
          return;
        }

        setLinkData(linkInfo);

        // تحديث عدد النقرات
        await supabase
          .from('shortened_links')
          .update({ clicks: (linkInfo.clicks || 0) + 1 })
          .eq('id', linkInfo.id);

        // تحديد نوع إعادة التوجيه
        const redirectType = linkInfo.redirect_type || 'direct';
        
        if (redirectType === 'direct') {
          // التوجه المباشر فوراً دون إظهار أي صفحة
          setIsDirectRedirect(true);
          window.location.href = linkInfo.original_url;
          return;
        } else if (redirectType === 'timer') {
          // انتظار 5 ثواني
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                window.location.href = linkInfo.original_url;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (redirectType === 'ad') {
          // إظهار صفحة الإعلانات
          setShowAd(true);
        }
        
      } catch (error) {
        console.error('Error redirecting:', error);
        setError('حدث خطأ أثناء التوجيه');
      }
    };

    handleRedirect();
  }, [shortCode]);

  const handleSkipAd = () => {
    if (linkData) {
      window.location.href = linkData.original_url;
    }
  };

  const handleAdViewed = () => {
    setAdViewed(true);
    setTimeout(() => {
      if (linkData) {
        window.location.href = linkData.original_url;
      }
    }, 1000);
  };

  // في حالة التوجيه المباشر، لا نعرض شيء
  if (isDirectRedirect) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">خطأ في الرابط</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              العودة إلى الصفحة الرئيسية
            </Button>
            {shortCode && (
              <ReportLinkButton shortCode={shortCode} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // صفحة انتظار 5 ثواني
  if (linkData && linkData.redirect_type === 'timer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">إعادة التوجيه</CardTitle>
            <CardDescription>
              {linkData.title || 'سيتم توجيهك إلى الرابط المطلوب'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">{countdown}</div>
            <p className="text-gray-600">ثانية متبقية</p>
            <Button 
              onClick={() => window.location.href = linkData.original_url}
              variant="outline"
              className="w-full"
            >
              انتقال فوري
            </Button>
            <ReportLinkButton shortCode={shortCode!} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // صفحة الإعلانات
  if (showAd && linkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900">إعلان</CardTitle>
            <CardDescription>مشاهدة الإعلان تدعم الموقع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* منطقة الإعلان */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
              <Eye className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">إعلان تجريبي</h3>
              <p className="text-lg opacity-90">شكراً لك على دعم موقعنا!</p>
              <p className="text-sm mt-4 opacity-75">هذا إعلان تجريبي - يمكن استبداله بإعلانات حقيقية</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleSkipAd}
                variant="outline"
                className="flex-1"
              >
                تخطي الإعلان
              </Button>
              <Button 
                onClick={handleAdViewed}
                className="flex-1"
                disabled={adViewed}
              >
                {adViewed ? 'جاري التوجيه...' : 'شاهدت الإعلان - متابعة'}
              </Button>
            </div>
            
            <div className="text-center">
              <ReportLinkButton shortCode={shortCode!} />
            </div>
            
            {linkData.title && (
              <p className="text-center text-gray-600 text-sm">
                الوجهة: {linkData.title}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
