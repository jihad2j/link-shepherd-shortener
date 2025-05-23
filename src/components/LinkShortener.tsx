
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const LinkShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate short code
      const { data: shortCodeData } = await supabase.rpc('generate_short_code');
      
      const { data, error } = await supabase
        .from('shortened_links')
        .insert({
          original_url: originalUrl,
          short_code: shortCodeData,
          title: title || null,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      const shortUrl = `${window.location.origin}/${data.short_code}`;
      setShortenedUrl(shortUrl);
      
      toast({
        title: "تم اختصار الرابط بنجاح!",
        description: "يمكنك الآن نسخ الرابط المختصر",
      });
    } catch (error: any) {
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
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">العنوان (اختياري)</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="وصف مختصر للرابط"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
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
