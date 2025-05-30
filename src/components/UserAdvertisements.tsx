
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  target_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const UserAdvertisements = () => {
  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvertisements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching advertisements:', error);
        throw error;
      }

      setAdvertisements(data || []);
    } catch (error: any) {
      console.error('Error in fetchAdvertisements:', error);
      toast({
        title: "خطأ في جلب الإعلانات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', adId);

      if (error) throw error;

      setAdvertisements(prev => 
        prev.map(ad => 
          ad.id === adId ? { ...ad, is_active: !currentStatus } : ad
        )
      );

      toast({
        title: !currentStatus ? "تم تفعيل الإعلان" : "تم إيقاف الإعلان",
        description: !currentStatus ? "سيظهر الإعلان للمستخدمين" : "لن يظهر الإعلان للمستخدمين",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث حالة الإعلان",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAdvertisement = async (adId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      // Try to delete image from storage (optional, may fail if file doesn't exist)
      try {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('advertisements')
            .remove([`${user?.id}/${fileName}`]);
        }
      } catch (storageError) {
        console.warn('Could not delete image from storage:', storageError);
      }

      setAdvertisements(prev => prev.filter(ad => ad.id !== adId));

      toast({
        title: "تم حذف الإعلان",
        description: "تم حذف الإعلان بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في حذف الإعلان",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري تحميل إعلاناتك...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>إعلاناتي</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdvertisements}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {advertisements.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لم تقم بإضافة أي إعلانات بعد
          </div>
        ) : (
          <div className="space-y-4">
            {advertisements.map((ad) => (
              <div key={ad.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{ad.title}</h3>
                        {ad.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {ad.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          تم الإنشاء: {formatDate(ad.created_at)}
                        </p>
                      </div>
                      <Badge variant={ad.is_active ? "default" : "secondary"}>
                        {ad.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                      >
                        {ad.is_active ? (
                          <EyeOff className="h-4 w-4 mr-1" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1" />
                        )}
                        {ad.is_active ? "إيقاف" : "تفعيل"}
                      </Button>
                      
                      {ad.target_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(ad.target_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          زيارة الرابط
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAdvertisement(ad.id, ad.image_url)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
