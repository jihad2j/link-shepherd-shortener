
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';

export const RedirectPage = () => {
  const { shortCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError('رمز الرابط غير صالح');
        setLoading(false);
        return;
      }

      try {
        // البحث عن الرابط المختصر
        const { data: linkData, error: linkError } = await supabase
          .from('shortened_links')
          .select('*')
          .eq('short_code', shortCode)
          .single();

        if (linkError || !linkData) {
          setError('الرابط غير موجود أو انتهت صلاحيته');
          setLoading(false);
          return;
        }

        // التحقق من حالة الرابط
        if (linkData.status !== 'active') {
          setError('هذا الرابط غير متاح حالياً');
          setLoading(false);
          return;
        }

        // تحديث عدد النقرات
        await supabase
          .from('shortened_links')
          .update({ clicks: (linkData.clicks || 0) + 1 })
          .eq('id', linkData.id);

        // التوجه المباشر للرابط
        window.location.href = linkData.original_url;
        
      } catch (error) {
        console.error('Error redirecting:', error);
        setError('حدث خطأ أثناء التوجيه');
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">جاري التوجيه...</h2>
            <p className="text-gray-600 text-center">يتم توجيهك إلى الرابط المطلوب</p>
          </CardContent>
        </Card>
      </div>
    );
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
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
