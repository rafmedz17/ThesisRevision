import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StudentAssistant, StudentAssistantFormData } from '@/types/user';
import { toast } from '@/hooks/use-toast';

const QUERY_KEY = 'student-assistants';

// API functions
const studentsApi = {
  getAll: async (): Promise<StudentAssistant[]> => {
    const response = await api.get('/users/student-assistants');
    return response.data;
  },

  getOne: async (id: string): Promise<StudentAssistant> => {
    const response = await api.get(`/users/student-assistants/${id}`);
    return response.data;
  },

  create: async (data: StudentAssistantFormData): Promise<StudentAssistant> => {
    const response = await api.post('/users/student-assistants', data);
    return response.data;
  },

  update: async (id: string, data: Partial<StudentAssistantFormData>): Promise<StudentAssistant> => {
    const response = await api.put(`/users/student-assistants/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/student-assistants/${id}`);
  },
};

export const useStudentAssistants = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: studentsApi.getAll,
  });
};

export const useCreateStudentAssistant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudentAssistantFormData) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Student assistant created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create student assistant',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateStudentAssistant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudentAssistantFormData> }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Student assistant updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update student assistant',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteStudentAssistant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Student assistant deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete student assistant',
        variant: 'destructive',
      });
    },
  });
};

export const useToggleActiveStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      // This functionality can be added to backend later if needed
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    },
  });
};
