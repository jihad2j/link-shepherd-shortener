
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReportFormProps {
  shortCode: string;
  onSuccess?: () => void;
}

export const ReportForm = ({ shortCode, onSuccess }: ReportFormProps) => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the link ID from the short code
      const { data: linkData, error: linkError } = await supabase
        .from('shortened_links')
        .select('id')
        .eq('short_code', shortCode)
        .single();

      if (linkError) throw linkError;

      // Submit the report
      const { error } = await supabase
        .from('reports')
        .insert({
          link_id: linkData.id,
          reporter_email: email,
          reason,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "تم إرسال البلاغ بنجاح",
        description: "شكراً لك على إبلاغنا. سنراجع البلاغ قريباً ونرد عليك عبر البريد الإلكتروني.",
      });

      // Reset form
      setEmail('');
      setReason('');
      setDescription('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال البلاغ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">الإبلاغ عن رابط</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">بريدك الإلكتروني *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">سبب البلاغ *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر سبب البلاغ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">رسائل غير مرغوب فيها</SelectItem>
                <SelectItem value="malware">برامج ضارة</SelectItem>
                <SelectItem value="phishing">محاولة احتيال</SelectItem>
                <SelectItem value="inappropriate">محتوى غير لائق</SelectItem>
                <SelectItem value="copyright">انتهاك حقوق الطبع والنشر</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">تفاصيل إضافية (اختياري)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أضف أي تفاصيل إضافية حول البلاغ..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'إرسال البلاغ'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
