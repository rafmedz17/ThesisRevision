import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Student, StudentFormData } from '@/types/user';
import { toast } from '@/hooks/use-toast';

const QUERY_KEY = 'students';

// API functions
const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/users/students');
    return response.data;
  },

  getOne: async (id: string): Promise<Student> => {
    const response = await api.get(`/users/students/${id}`);
    return response.data;
  },

  create: async (data: StudentFormData): Promise<Student> => {
    const response = await api.post('/users/students', data);
    return response.data;
  },

  update: async (id: string, data: Partial<StudentFormData>): Promise<Student> => {
    const response = await api.put(`/users/students/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/students/${id}`);
  },
};

export const useStudents = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: studentsApi.getAll,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudentFormData) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Student created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create student',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudentFormData> }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update student',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete student',
        variant: 'destructive',
      });
    },
  });
};