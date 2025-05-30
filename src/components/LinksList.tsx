
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Copy, ExternalLink, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Link {
  id: string;
  original_url: string;
  short_code: string;
  title: string | null;
  clicks: number;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
}

export const LinksList = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('shortened_links')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل الروابط",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setEditTitle(link.title || '');
    setEditUrl(link.original_url);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;

    try {
      const { error } = await supabase
        .from('shortened_links')
        .update({
          title: editTitle || null,
          original_url: editUrl,
        })
        .eq('id', editingLink.id);

      if (error) throw error;

      toast({
        title: "تم تحديث الرابط بنجاح",
        description: "تم حفظ التغييرات",
      });

      setIsEditDialogOpen(false);
      setEditingLink(null);
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث الرابط",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('shortened_links')
        .update({ status: 'deleted' })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "تم حذف الرابط",
        description: "تم حذف الرابط بنجاح",
      });

      fetchLinks();
    } catch (error: any) {
      toast({
        title: "خطأ في حذف الرابط",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyShortUrl = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "تم النسخ!",
      description: "تم نسخ الرابط المختصر",
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">جاري تحميل الروابط...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">روابطي المختصرة</CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            لا توجد روابط مختصرة بعد. ابدأ بإنشاء رابط جديد!
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">
                        {link.title || 'بدون عنوان'}
                      </h3>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{link.clicks} نقرة</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 break-all">{link.original_url}</p>
                    <p className="text-sm font-mono text-blue-600 break-all" dir="ltr">
                      {window.location.origin}/{link.short_code}
                    </p>
                    <p className="text-xs text-gray-400">
                      تم الإنشاء: {new Date(link.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyShortUrl(link.short_code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/${link.short_code}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(link)}
                      title="تعديل الرابط"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(link.id)}
                      title="حذف الرابط"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الرابط</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">العنوان</Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="عنوان الرابط"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUrl">الرابط الأصلي</Label>
                <Input
                  id="editUrl"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateLink} className="flex-1">
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
