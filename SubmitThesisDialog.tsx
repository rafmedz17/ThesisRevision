mport { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettingsStore } from '@/stores/settings-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { api } from '@/lib/api';

const thesisSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(500, 'Title must be less than 200 characters'),
  authors: z.string().min(1, 'At least one author is required'),
  advisor: z.string().min(1, 'At least one advisor is required'),
  program: z.string().min(1, 'Program is required'),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
});

type ThesisFormData = z.infer<typeof thesisSchema>;

interface SubmitThesisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: 'college' | 'senior-high';
}

const SubmitThesisDialog = ({ open, onOpenChange, department }: SubmitThesisDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getProgramsByDepartment } = useSettingsStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const availablePrograms = getProgramsByDepartment(department);

  const currentYear = new Date().getFullYear();

  const form = useForm<ThesisFormData>({
    resolver: zodResolver(thesisSchema),
    defaultValues: {
      title: '',
      authors: '',
      advisor: '',
      program: '',
      year: currentYear,
      abstract: '',
    },
  });

  const createThesisMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/thesis/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Thesis submitted successfully for review.',
      });
      queryClient.invalidateQueries({ queryKey: ['theses'] });
      onOpenChange(false);
      form.reset();
      setSelectedFile(null);
      setPdfPreviewUrl(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit thesis',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ThesisFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('abstract', data.abstract);
    formData.append('authors', JSON.stringify(data.authors.split('\n').map(name => ({ id: Date.now().toString() + Math.random(), name: name.trim() }))));
    formData.append('advisors', JSON.stringify(data.advisor.split('\n').map(name => ({ id: Date.now().toString() + Math.random(), name: name.trim() }))));
    formData.append('department', department);
    formData.append('program', data.program);
    formData.append('year', data.year.toString());

    if (selectedFile) {
      formData.append('pdf', selectedFile);
    }

    createThesisMutation.mutate(formData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please select a PDF file.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 50MB.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setPdfPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPdfPreviewUrl(null);
    setShowPreview(false);
  };

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Submit Thesis for Review</DialogTitle>
          <DialogDescription>
            Submit your thesis for review by administrators. It will be published after approval.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter thesis title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authors *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter author names (one per line)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="advisor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advisors *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter advisor names (one per line)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePrograms.map((program) => (
                              <SelectItem key={program.id} value={program.name}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter year"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="abstract"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abstract *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter thesis abstract"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Label>PDF File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-8 w-8 text-red-500" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {pdfPreviewUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {showPreview ? 'Hide Preview' : 'Preview PDF'}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <Label htmlFor="pdf-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Click to upload PDF
                          </span>
                        </Label>
                        <Input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 50MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createThesisMutation.isPending}>
                  {createThesisMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>

        {showPreview && pdfPreviewUrl && (
          <div className="mt-4">
            <iframe
              src={pdfPreviewUrl}
              className="w-full h-96 border rounded"
              title="PDF Preview"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { SubmitThesisDialog };
