import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Thesis } from '@/types/thesis';
import ThesisViewDialog from '@/features/thesis/components/ThesisViewDialog';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: 'college' | 'senior-high';
  onApprovalAction?: () => void;
}

const ApprovalDialog = ({ open, onOpenChange, department, onApprovalAction }: ApprovalDialogProps) => {
  const { toast } = useToast();
  const [pendingTheses, setPendingTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchPendingTheses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/thesis', {
        params: { department, status: 'pending', page: 1, limit: 100 }
      });
      setPendingTheses(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pending theses.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [department, toast]);

  useEffect(() => {
    if (open) {
      fetchPendingTheses();
    }
  }, [open, fetchPendingTheses]);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/thesis/${id}/approve`);
      toast({
        title: 'Success',
        description: 'Thesis approved successfully.',
      });
      fetchPendingTheses();
      onApprovalAction?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve thesis.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/thesis/${id}/reject`);
      toast({
        title: 'Success',
        description: 'Thesis rejected successfully.',
      });
      fetchPendingTheses();
      onApprovalAction?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject thesis.',
        variant: 'destructive',
      });
    }
  };

  const handleView = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setViewDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Pending Thesis Approvals - {department === 'college' ? 'College' : 'Senior High'}</DialogTitle>
            <DialogDescription>
              Review and approve or reject submitted theses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : pendingTheses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending theses to review.
              </div>
            ) : (
              pendingTheses.map((thesis) => (
                <Card key={thesis.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{thesis.title}</CardTitle>
                        <CardDescription>
                          {thesis.authors?.length > 0 && (
                            <span>Authors: {thesis.authors.map(a => a.name).join(', ')}</span>
                          )}
                          {thesis.year && <span> | Year: {thesis.year}</span>}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(thesis)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(thesis.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(thesis.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ThesisViewDialog
        thesis={selectedThesis}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        showPdfPreview={true}
      />
    </>
  );
};

export { ApprovalDialog };
