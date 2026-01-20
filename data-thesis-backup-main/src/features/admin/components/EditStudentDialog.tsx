import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Student } from '@/types/user';
import { useUpdateStudent } from '../hooks/useStudents';

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(255, 'Username must be less than 255 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export const EditStudentDialog = ({
  open,
  onOpenChange,
  student,
}: EditStudentDialogProps) => {
  const updateMutation = useUpdateStudent();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      password: '',
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        password: '',
      });
    }
  }, [student, form]);

  const onSubmit = (data: FormData) => {
    if (!student) return;

    // Remove empty password
    const updateData = { ...data };
    if (!updateData.password) {
      delete updateData.password;
    }

    updateMutation.mutate(
      { id: student.id, data: updateData },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student account information. Leave password blank to keep current password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password (leave blank to keep current)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Student'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};