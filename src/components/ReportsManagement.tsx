
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, MessageSquare, CheckCircle, Clock, Eye } from 'lucide-react';

interface Report {
  id: string;
  link_id: string;
  reporter_email: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  shortened_links: {
    short_code: string;
    original_url: string;
    title: string | null;
  };
}

export const ReportsManagement = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          shortened_links (
            short_code,
            original_url,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل التقارير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: 'reviewed' | 'resolved', response?: string) => {
    setUpdating(reportId);
    try {
      const updateData: any = { status: newStatus };
      if (response) {
        updateData.admin_response = response;
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, admin_response: response || report.admin_response }
          : report
      ));

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة التقرير إلى ${newStatus === 'reviewed' ? 'مراجع' : 'محلول'}`,
      });

      setSelectedReport(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث التقرير",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />في الانتظار</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Eye className="h-3 w-3 mr-1" />مراجع</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />محلول</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      spam: 'رسائل غير مرغوب فيها',
      malware: 'برامج ضارة',
      phishing: 'محاولة احتيال',
      inappropriate: 'محتوى غير لائق',
      copyright: 'انتهاك حقوق الطبع والنشر',
      other: 'أخرى'
    };
    return reasonMap[reason] || reason;
  };

  if (adminLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-gray-600">غير مصرح لك بالوصول إلى هذه الصفحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          إدارة التقارير
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد تقارير بعد
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرابط المبلغ عنه</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإبلاغ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {report.shortened_links?.title || 'بدون عنوان'}
                      </div>
                      <div className="text-sm text-gray-600 break-all" dir="ltr">
                        {window.location.origin}/{report.shortened_links?.short_code}
                      </div>
                      <div className="text-xs text-gray-500 break-all">
                        {report.shortened_links?.original_url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{report.reporter_email}</TableCell>
                  <TableCell>{getReasonText(report.reason)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(report);
                              setAdminResponse(report.admin_response || '');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            عرض
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>تفاصيل التقرير</DialogTitle>
                          </DialogHeader>
                          {selectedReport && (
                            <div className="space-y-4">
                              <div>
                                <Label className="font-semibold">الرابط المبلغ عنه:</Label>
                                <p className="text-sm text-gray-600 break-all" dir="ltr">
                                  {window.location.origin}/{selectedReport.shortened_links?.short_code}
                                </p>
                                <p className="text-xs text-gray-500 break-all">
                                  {selectedReport.shortened_links?.original_url}
                                </p>
                              </div>
                              
                              <div>
                                <Label className="font-semibold">البريد الإلكتروني للمبلغ:</Label>
                                <p className="text-sm">{selectedReport.reporter_email}</p>
                              </div>
                              
                              <div>
                                <Label className="font-semibold">سبب الإبلاغ:</Label>
                                <p className="text-sm">{getReasonText(selectedReport.reason)}</p>
                              </div>
                              
                              {selectedReport.description && (
                                <div>
                                  <Label className="font-semibold">تفاصيل إضافية:</Label>
                                  <p className="text-sm text-gray-600">{selectedReport.description}</p>
                                </div>
                              )}
                              
                              <div>
                                <Label className="font-semibold">الحالة الحالية:</Label>
                                <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="adminResponse">رد المشرف:</Label>
                                <Textarea
                                  id="adminResponse"
                                  value={adminResponse}
                                  onChange={(e) => setAdminResponse(e.target.value)}
                                  placeholder="اكتب ردك على التقرير..."
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateReportStatus(selectedReport.id, 'reviewed', adminResponse)}
                                  disabled={updating === selectedReport.id}
                                  variant="outline"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  تم المراجعة
                                </Button>
                                
                                <Button
                                  onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminResponse)}
                                  disabled={updating === selectedReport.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  تم الحل
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
