import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Thesis, ThesisResponse } from '@/types/thesis';
import { toast } from 'sonner';

// Query key factory
export const studentSubmissionsKeys = {
  all: ['student-submissions'] as const,
  list: (page: number, limit: number) => [...studentSubmissionsKeys.all, page, limit] as const,
};

// Fetch student's own submissions
export const useStudentSubmissions = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: studentSubmissionsKeys.list(page, limit),
    queryFn: async (): Promise<ThesisResponse> => {
      const response = await api.get('/thesis/my-submissions', {
        params: { page, limit }
      });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Delete student's own submission
export const useDeleteStudentSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (thesisId: string) => {
      const response = await api.delete(`/thesis/${thesisId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Submission deleted successfully');
      queryClient.invalidateQueries({ queryKey: studentSubmissionsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete submission');
    },
  });
};

// Update student's own submission
export const useUpdateStudentSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.put(`/thesis/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Submission updated successfully');
      queryClient.invalidateQueries({ queryKey: studentSubmissionsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update submission');
    },
  });
};
