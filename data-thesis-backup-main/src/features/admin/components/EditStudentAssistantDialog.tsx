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
import { StudentAssistant } from '@/types/user';
import { useUpdateStudentAssistant } from '../hooks/useStudentAssistants';

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(255, 'Username must be less than 255 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditStudentAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistant: StudentAssistant | null;
}

export const EditStudentAssistantDialog = ({
  open,
  onOpenChange,
  assistant,
}: EditStudentAssistantDialogProps) => {
  const updateMutation = useUpdateStudentAssistant();

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
    if (assistant) {
      form.reset({
        username: assistant.username,
        firstName: assistant.firstName,
        lastName: assistant.lastName,
        password: '',
      });
    }
  }, [assistant, form]);

  const onSubmit = async (data: FormData) => {
    if (!assistant) return;

    try {
      const updateData: any = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      if (data.password) {
        updateData.password = data.password;
      }

      await updateMutation.mutateAsync({
        id: assistant.id,
        data: updateData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update student assistant:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Student Assistant</DialogTitle>
          <DialogDescription>
            Update student assistant account information
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
                    <Input placeholder="assistant1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Assistant'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
