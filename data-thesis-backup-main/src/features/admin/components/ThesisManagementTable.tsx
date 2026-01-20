import { useState } from 'react';
import { Eye, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Thesis } from '@/types/thesis';
import { useDownloadThesis, useDeleteThesis } from '@/features/thesis/hooks/useThesis';
import { toast } from 'sonner';
import ThesisViewDialog from '@/features/thesis/components/ThesisViewDialog';
import EditThesisDialog from './EditThesisDialog';
import { useAuthStore } from '@/stores/auth-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ThesisManagementTableProps {
  theses: Thesis[];
  isLoading?: boolean;
}


const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const ThesisManagementTable = ({ theses, isLoading }: ThesisManagementTableProps) => {
  const { user } = useAuthStore();
  const { mutate: downloadThesis } = useDownloadThesis();
  const { mutate: deleteThesis, isPending: isDeleting } = useDeleteThesis();

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(theses.length / pageSize);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);

  const handleView = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setViewDialogOpen(true);
  };

  const handleEdit = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedThesis) {
      deleteThesis(selectedThesis.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedThesis(null);
        },
      });
    }
  };

  const handleDownload = (thesisId: string) => {
    downloadThesis(thesisId);
  };

  // Get current page's theses
  const paginatedTheses = theses.slice((page - 1) * pageSize, page * pageSize);

  // Handle page change
  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1); // Reset to first page
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading thesis records...</p>
      </div>
    );
  }

  if (theses.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground mb-2">No thesis records found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-2 bg-muted/10">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="border rounded px-2 py-1 text-sm bg-background"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1}
          -{Math.min(page * pageSize, theses.length)} of {theses.length}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Authors</TableHead>
            <TableHead className="font-semibold">Program</TableHead>
            <TableHead className="font-semibold">Year</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTheses.map((thesis) => (
            <TableRow key={thesis.id} className="hover:bg-muted/20">
              <TableCell className="font-medium max-w-xs">
                <div className="truncate" title={thesis.title}>
                  {thesis.title}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {thesis.authors.map(author => author.name).join(' & ')}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{thesis.program}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{thesis.year}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(thesis)}
                    className="h-8 w-8 p-0"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(thesis)}
                    className="h-8 w-8 p-0"
                    title="Edit thesis"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(thesis.id)}
                      className="h-8 w-8 p-0"
                      title="Download PDF (Admin only)"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(thesis)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete thesis"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="py-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (page > 1) goToPage(page - 1);
                }}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={e => {
                    e.preventDefault();
                    goToPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (page < totalPages) goToPage(page + 1);
                }}
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : 0}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* View Dialog */}
      <ThesisViewDialog
        thesis={selectedThesis}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        showPdfPreview={true} // Enable PDF preview for admin
      />

      {/* Edit Dialog */}
      <EditThesisDialog
        thesis={selectedThesis}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the thesis
              <span className="font-semibold block mt-2">
                "{selectedThesis?.title}"
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ThesisManagementTable;
