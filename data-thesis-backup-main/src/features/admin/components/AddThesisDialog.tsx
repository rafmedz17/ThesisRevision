import { useState, useEffect } from 'react';
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
  shelfLocation: z.string().optional(),
});

type ThesisFormData = z.infer<typeof thesisSchema>;

interface AddThesisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: 'college' | 'senior-high';
}

const AddThesisDialog = ({ open, onOpenChange, department }: AddThesisDialogProps) => {
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
      shelfLocation: '',
    },
  });

  const addThesisMutation = useMutation({
    mutationFn: async (data: ThesisFormData & { file: File | null }) => {
      const formData = new FormData();

      // Parse authors and advisors from semicolon-separated strings to JSON arrays
      const authorsArray = data.authors.split(';').map((name, index) => ({
        id: `author-${index + 1}`,
        name: name.trim()
      }));

      const advisorsArray = data.advisor.split(';').map((name, index) => ({
        id: `advisor-${index + 1}`,
        name: name.trim()
      }));

      // Append form data
      formData.append('title', data.title);
      formData.append('abstract', data.abstract);
      formData.append('authors', JSON.stringify(authorsArray));
      formData.append('advisors', JSON.stringify(advisorsArray));
      formData.append('department', department);
      formData.append('program', data.program);
      formData.append('year', data.year.toString());
      formData.append('shelfLocation', data.shelfLocation);

      if (data.file) {
        formData.append('pdf', data.file);
      }

      const response = await api.post('/thesis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Thesis added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['thesis'] });
      form.reset();
      setSelectedFile(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add thesis. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ThesisFormData) => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    addThesisMutation.mutate({ ...data, file: selectedFile });
  };

  // Cleanup preview URL only when component unmounts
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run on mount/unmount

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setPdfPreviewUrl(null);
      setShowPreview(false);
    }
  }, [open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Error',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: 'Error',
          description: 'File size must be less than 50MB',
          variant: 'destructive',
        });
        return;
      }

      // Revoke previous URL if exists
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }

      // Create new preview URL
      const previewUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(previewUrl);
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New {department === 'college' ? 'College' : 'Senior High'} Thesis</DialogTitle>
          <DialogDescription>
            Fill in the thesis metadata and upload the PDF file
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
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

            {/* Authors */}
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smith, John; Doe, Jane" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Separate multiple authors with semicolon (;)</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Advisor */}
            <FormField
              control={form.control}
              name="advisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advisor *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Brown, Alice; Garcia, Robert" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Separate multiple advisors with semicolon (;)</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Program and Year Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePrograms.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No programs available
                          </div>
                        ) : (
                          availablePrograms.map(program => (
                            <SelectItem key={program.id} value={program.name}>
                              {program.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
                        placeholder="Enter year (e.g., 2024)"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



            {/* Abstract */}
            <FormField
              control={form.control}
              name="abstract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abstract *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter thesis abstract" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shelf Location */}
            <FormField
              control={form.control}
              name="shelfLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shelf Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter shelf location (e.g., Shelf A-1)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label>PDF File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <span className="text-muted-foreground">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload PDF file (Max 50MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {selectedFile && pdfPreviewUrl && (
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPdfPreviewUrl(null);
                      setShowPreview(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {showPreview && pdfPreviewUrl && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <iframe
                    src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-[1000px] h-[500px]"
                    title="PDF Preview"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={addThesisMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addThesisMutation.isPending}>
                {addThesisMutation.isPending ? 'Adding...' : 'Add Thesis'}
              </Button>
            </div>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddThesisDialog;
