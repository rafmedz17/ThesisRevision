import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentSubmissions, useDeleteStudentSubmission } from '../hooks/useStudentSubmissions';
import { Thesis } from '@/types/thesis';
import AppHeader from '@/components/shared/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Eye, Edit, Trash2, FileText, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ThesisViewDialog from '../components/ThesisViewDialog';
import EditSubmissionDialog from '../components/EditSubmissionDialog';
import { format } from 'date-fns';

const StudentSubmissionsPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [thesisToDelete, setThesisToDelete] = useState<Thesis | null>(null);

  const { data, isLoading, error } = useStudentSubmissions(currentPage, pageSize);
  const deleteSubmissionMutation = useDeleteStudentSubmission();

  const handleView = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (thesis: Thesis) => {
    setThesisToDelete(thesis);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (thesisToDelete) {
      deleteSubmissionMutation.mutate(thesisToDelete.id);
      setDeleteDialogOpen(false);
      setThesisToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <AppHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-destructive">Failed to load submissions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AppHeader />

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  My Thesis Submissions
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage your thesis submissions
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {data?.total || 0} submission{(data?.total || 0) !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!data?.data || data.data.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any thesis yet. Start by submitting your first thesis!
                </p>
                <Button onClick={() => navigate('/college')}>
                  Submit Thesis
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.data.map((thesis) => (
                        <TableRow key={thesis.id}>
                          <TableCell className="font-medium max-w-md truncate">
                            {thesis.title}
                          </TableCell>
                          <TableCell>{thesis.program}</TableCell>
                          <TableCell>{thesis.year}</TableCell>
                          <TableCell>{getStatusBadge(thesis.status)}</TableCell>
                          <TableCell>
                            {thesis.createdAt ? format(new Date(thesis.createdAt), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(thesis)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {thesis.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(thesis)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(thesis)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Items per page:</span>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                          setPageSize(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => {
                          const showPage =
                            page === 1 ||
                            page === data.totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          if (!showPage) {
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <PaginationItem key={page}>
                                  <span className="px-4">...</span>
                                </PaginationItem>
                              );
                            }
                            return null;
                          }

                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(data.totalPages, prev + 1))}
                            className={currentPage === data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>

                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {data.totalPages}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <ThesisViewDialog
        thesis={selectedThesis}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        showPdfPreview={true}
      />

      {/* Edit Dialog */}
      {selectedThesis && (
        <EditSubmissionDialog
          thesis={selectedThesis}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{thesisToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentSubmissionsPage;
