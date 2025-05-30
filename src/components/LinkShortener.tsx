
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ExternalLink, Shuffle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const LinkShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [redirectType, setRedirectType] = useState('direct');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'http://' + url;
    }
    return url;
  };

  const generateRandomCode = async () => {
    try {
      const { data: shortCodeData } = await supabase.rpc('generate_short_code');
      if (shortCodeData) {
        setCustomCode(shortCodeData);
      }
    } catch (error) {
      console.error('Error generating random code:', error);
    }
  };

  const validateCustomCode = (code: string) => {
    // Allow only alphanumeric characters and hyphens, 3-50 characters
    const regex = /^[a-zA-Z0-9-]{3,50}$/;
    return regex.test(code);
  };

  const checkCodeAvailability = async (code: string) => {
    const { data, error } = await supabase
      .from('shortened_links')
      .select('short_code')
      .eq('short_code', code)
      .single();

    return !data; // Returns true if code is available (no existing data)
  };

  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedUrl = formatUrl(originalUrl);
      let finalShortCode = customCode.trim();

      // If no custom code provided, generate one
      if (!finalShortCode) {
        const { data: shortCodeData } = await supabase.rpc('generate_short_code');
        if (!shortCodeData) {
          throw new Error('فشل في توليد الرمز المختصر');
        }
        finalShortCode = shortCodeData;
      } else {
        // Validate custom code
        if (!validateCustomCode(finalShortCode)) {
          throw new Error('الرمز المختصر يجب أن يحتوي على أحرف وأرقام فقط (3-50 حرف)');
        }

        // Check if custom code is available
        const isAvailable = await checkCodeAvailability(finalShortCode);
        if (!isAvailable) {
          throw new Error('هذا الرمز المختصر مستخدم بالفعل، يرجى اختيار رمز آخر');
        }
      }

      console.log('Creating link with title:', title); // Debug log
      
      const { data, error } = await supabase
        .from('shortened_links')
        .insert({
          original_url: formattedUrl,
          short_code: finalShortCode,
          title: title.trim() || null,
          redirect_type: redirectType,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Created link data:', data); // Debug log

      const shortUrl = `${window.location.origin}/${data.short_code}`;
      setShortenedUrl(shortUrl);
      
      // Clear form after successful creation
      setOriginalUrl('');
      setTitle('');
      setCustomCode('');
      setRedirectType('direct');
      
      toast({
        title: "تم اختصار الرابط بنجاح!",
        description: `تم إنشاء الرابط${title ? ` بعنوان: ${title}` : ''}`,
      });
    } catch (error: any) {
      console.error('Error creating shortened link:', error);
      toast({
        title: "خطأ في اختصار الرابط",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    toast({
      title: "تم النسخ!",
      description: "تم نسخ الرابط المختصر إلى الحافظة",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">اختصار رابط جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleShortenUrl} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="originalUrl">الرابط الأصلي *</Label>
            <Input
              id="originalUrl"
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="example.com"
              required
            />
            <p className="text-sm text-gray-500">سيتم إضافة http:// تلقائياً إذا لم تكن موجودة</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">العنوان (اختياري)</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="وصف مختصر للرابط"
              maxLength={100}
            />
            <p className="text-sm text-gray-500">
              {title.length}/100 حرف - العنوان سيظهر في قائمة الروابط
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customCode">الرمز المختصر (اختياري)</Label>
            <div className="flex space-x-2">
              <Input
                id="customCode"
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="مثال: my-link"
                className="flex-1"
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateRandomCode}
                className="shrink-0"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              3-50 حرف، أحرف وأرقام وشرطات فقط. إذا تُرك فارغاً سيتم توليد رمز عشوائي
            </p>
            {customCode && (
              <p className="text-sm text-blue-600" dir="ltr">
                {window.location.origin}/{customCode}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirectType">نوع إعادة التوجيه</Label>
            <Select value={redirectType} onValueChange={setRedirectType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع إعادة التوجيه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">إعادة توجيه مباشر</SelectItem>
                <SelectItem value="timer">انتظار 5 ثواني</SelectItem>
                <SelectItem value="ad">صفحة إعلانات مع زر تخطي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading || !originalUrl.trim()}>
            {loading ? 'جاري الاختصار...' : 'اختصار الرابط'}
          </Button>
        </form>
        
        {shortenedUrl && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <Label className="text-sm font-medium text-green-800">الرابط المختصر:</Label>
            <div className="flex items-center space-x-2 mt-2" dir="ltr">
              <Input value={shortenedUrl} readOnly className="flex-1" />
              <Button
                type="button"
                size="sm"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.open(shortenedUrl, '_blank')}
                variant="outline"
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
