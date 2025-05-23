
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

export const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            تم تأكيد البريد الإلكتروني!
          </CardTitle>
          <CardDescription className="text-lg">
            مرحباً بك في مختصر الروابط
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <Mail className="h-12 w-12 mx-auto text-blue-600" />
            <p className="text-gray-600">
              تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن استخدام جميع ميزات الموقع.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              سيتم توجيهك تلقائياً إلى الصفحة الرئيسية خلال {countdown} ثواني
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
            size="lg"
          >
            الانتقال إلى الصفحة الرئيسية
            <ArrowRight className="mr-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
