import { useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AddStudentAssistantDialog } from './AddStudentAssistantDialog';
import { EditStudentAssistantDialog } from './EditStudentAssistantDialog';
import {
  useStudentAssistants,
  useDeleteStudentAssistant,
  useToggleActiveStatus,
} from '../hooks/useStudentAssistants';
import { StudentAssistant } from '@/types/user';
import { format } from 'date-fns';

export const UserManagement = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<StudentAssistant | null>(null);

  const { data: assistants, isLoading } = useStudentAssistants();
  const deleteMutation = useDeleteStudentAssistant();
  const toggleStatusMutation = useToggleActiveStatus();

  const handleEdit = (assistant: StudentAssistant) => {
    setSelectedAssistant(assistant);
    setEditDialogOpen(true);
  };

  const handleDelete = (assistant: StudentAssistant) => {
    setSelectedAssistant(assistant);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAssistant) {
      await deleteMutation.mutateAsync(selectedAssistant.id);
      setDeleteDialogOpen(false);
      setSelectedAssistant(null);
    }
  };

  const handleToggleStatus = async (assistant: StudentAssistant) => {
    await toggleStatusMutation.mutateAsync(assistant.id);
  };

  const getDepartmentBadge = (department: string) => {
    const variants: Record<string, string> = {
      college: 'default',
      'senior-high': 'secondary',
      both: 'outline',
    };
    return variants[department] || 'default';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage student assistant accounts and permissions
              </CardDescription>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student Assistant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : !assistants || assistants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No student assistants found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setAddDialogOpen(true)}
              >
                Add your first student assistant
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assistants.map((assistant) => (
                  <TableRow key={assistant.id}>
                    <TableCell className="font-medium">
                      {assistant.firstName} {assistant.lastName}
                    </TableCell>
                    <TableCell>{assistant.username}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(assistant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(assistant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <AddStudentAssistantDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Edit Dialog */}
      <EditStudentAssistantDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        assistant={selectedAssistant}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student assistant account for{' '}
              <strong>
                {selectedAssistant?.firstName} {selectedAssistant?.lastName}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
