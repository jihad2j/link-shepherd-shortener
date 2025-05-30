
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const AdvertisementUpload = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ في حجم الملف",
          description: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "نوع ملف غير صحيح",
          description: "يرجى اختيار ملف صورة صالح",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const uploadAdvertisement = async () => {
    if (!user || !imageFile || !title.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء العنوان وتحديد صورة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('advertisements')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('advertisements')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('فشل في الحصول على رابط الصورة');
      }

      // Save advertisement to database
      const { data, error } = await supabase
        .from('advertisements')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          target_url: targetUrl.trim() || null,
          image_url: urlData.publicUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Advertisement created:', data);

      // Clear form
      setTitle('');
      setDescription('');
      setTargetUrl('');
      setImageFile(null);
      setImagePreview('');

      toast({
        title: "تم رفع الإعلان بنجاح!",
        description: "سيظهر إعلانك للمستخدمين عند زيارة الروابط المختصرة",
      });

    } catch (error: any) {
      console.error('Error uploading advertisement:', error);
      toast({
        title: "خطأ في رفع الإعلان",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">إضافة إعلان جديد</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">عنوان الإعلان *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان جذاب للإعلان"
            maxLength={100}
          />
          <p className="text-sm text-gray-500">{title.length}/100 حرف</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">وصف الإعلان (اختياري)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر للإعلان"
            maxLength={300}
            rows={3}
          />
          <p className="text-sm text-gray-500">{description.length}/300 حرف</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetUrl">رابط الإعلان (اختياري)</Label>
          <Input
            id="targetUrl"
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <p className="text-sm text-gray-500">
            الرابط الذي سيتم توجيه المستخدمين إليه عند النقر على الإعلان
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">صورة الإعلان *</Label>
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label
                htmlFor="image"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="text-lg font-medium">اختر صورة الإعلان</span>
                <span className="text-sm text-gray-500">
                  PNG, JPG, GIF حتى 5MB
                </span>
              </Label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="معاينة الإعلان"
                className="w-full h-64 object-cover rounded-lg border"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={removeImage}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={uploadAdvertisement}
          disabled={loading || !title.trim() || !imageFile}
          className="w-full"
        >
          {loading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              جاري رفع الإعلان...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              رفع الإعلان
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
