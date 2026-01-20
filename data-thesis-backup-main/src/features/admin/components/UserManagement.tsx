import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Pencil, Trash2, UserCheck, UserX, Search } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AddStudentAssistantDialog } from './AddStudentAssistantDialog';
import { EditStudentAssistantDialog } from './EditStudentAssistantDialog';
import { AddStudentDialog } from './AddStudentDialog';
import { EditStudentDialog } from './EditStudentDialog';
import {
  useStudentAssistants,
  useDeleteStudentAssistant,
  useToggleActiveStatus,
} from '../hooks/useStudentAssistants';
import {
  useStudents,
  useDeleteStudent,
} from '../hooks/useStudents';
import { StudentAssistant, Student } from '@/types/user';
import { format } from 'date-fns';

export const UserManagement = () => {
  const [addAssistantDialogOpen, setAddAssistantDialogOpen] = useState(false);
  const [editAssistantDialogOpen, setEditAssistantDialogOpen] = useState(false);
  const [deleteAssistantDialogOpen, setDeleteAssistantDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<StudentAssistant | null>(null);

  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [editStudentDialogOpen, setEditStudentDialogOpen] = useState(false);
  const [deleteStudentDialogOpen, setDeleteStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [assistantSearch, setAssistantSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const { data: assistants, isLoading: assistantsLoading } = useStudentAssistants();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const deleteAssistantMutation = useDeleteStudentAssistant();
  const deleteStudentMutation = useDeleteStudent();
  const toggleStatusMutation = useToggleActiveStatus();

  // Filter assistants based on search
  const filteredAssistants = assistants?.filter(assistant =>
    assistant.username.toLowerCase().includes(assistantSearch.toLowerCase()) ||
    assistant.firstName.toLowerCase().includes(assistantSearch.toLowerCase()) ||
    assistant.lastName.toLowerCase().includes(assistantSearch.toLowerCase())
  ) || [];

  // Filter students based on search
  const filteredStudents = students?.filter(student =>
    student.username.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.lastName.toLowerCase().includes(studentSearch.toLowerCase())
  ) || [];

  const handleEditAssistant = (assistant: StudentAssistant) => {
    setSelectedAssistant(assistant);
    setEditAssistantDialogOpen(true);
  };

  const handleDeleteAssistant = (assistant: StudentAssistant) => {
    setSelectedAssistant(assistant);
    setDeleteAssistantDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditStudentDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setDeleteStudentDialogOpen(true);
  };

  const confirmDeleteAssistant = async () => {
    if (selectedAssistant) {
      await deleteAssistantMutation.mutateAsync(selectedAssistant.id);
      setDeleteAssistantDialogOpen(false);
      setSelectedAssistant(null);
    }
  };

  const confirmDeleteStudent = async () => {
    if (selectedStudent) {
      await deleteStudentMutation.mutateAsync(selectedStudent.id);
      setDeleteStudentDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage student assistants and students accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assistants" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assistants">Student Assistants</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="assistants" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by username or name..."
                    value={assistantSearch}
                    onChange={(e) => setAssistantSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setAddAssistantDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assistant
                </Button>
              </div>

              {assistantsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !filteredAssistants || filteredAssistants.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No student assistants found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setAddAssistantDialogOpen(true)}
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
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssistants.map((assistant) => (
                      <TableRow key={assistant.id}>
                        <TableCell className="font-medium">
                          {assistant.firstName} {assistant.lastName}
                        </TableCell>
                        <TableCell>{assistant.username}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{assistant.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditAssistant(assistant)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAssistant(assistant)}
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
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by username or name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setAddStudentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>

              {studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !filteredStudents || filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No students found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setAddStudentDialogOpen(true)}
                  >
                    Add your first student
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditStudent(student)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStudent(student)}
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
            </TabsContent>
          </Tabs>

          {/* Dialogs for Assistants */}
          <AddStudentAssistantDialog open={addAssistantDialogOpen} onOpenChange={setAddAssistantDialogOpen} />
          <EditStudentAssistantDialog
            open={editAssistantDialogOpen}
            onOpenChange={setEditAssistantDialogOpen}
            assistant={selectedAssistant}
          />
          <AlertDialog open={deleteAssistantDialogOpen} onOpenChange={setDeleteAssistantDialogOpen}>
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
                  onClick={confirmDeleteAssistant}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleteAssistantMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialogs for Students */}
          <AddStudentDialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen} />
          <EditStudentDialog
            open={editStudentDialogOpen}
            onOpenChange={setEditStudentDialogOpen}
            student={selectedStudent}
          />
          <AlertDialog open={deleteStudentDialogOpen} onOpenChange={setDeleteStudentDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the student account for{' '}
                  <strong>
                    {selectedStudent?.firstName} {selectedStudent?.lastName}
                  </strong>
                  . This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteStudent}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleteStudentMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
