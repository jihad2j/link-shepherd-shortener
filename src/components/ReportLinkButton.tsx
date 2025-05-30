
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReportForm } from './ReportForm';
import { AlertTriangle } from 'lucide-react';

interface ReportLinkButtonProps {
  shortCode: string;
}

export const ReportLinkButton = ({ shortCode }: ReportLinkButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          الإبلاغ عن هذا الرابط
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>الإبلاغ عن رابط مشبوه</DialogTitle>
        </DialogHeader>
        <ReportForm 
          shortCode={shortCode} 
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
