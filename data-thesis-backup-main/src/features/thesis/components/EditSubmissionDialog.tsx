import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettingsStore } from '@/stores/settings-store';
import { useUpdateStudentSubmission } from '../hooks/useStudentSubmissions';
import { Thesis } from '@/types/thesis';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const thesisSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(500, 'Title must be less than 500 characters'),
  authors: z.string().min(1, 'At least one author is required'),
  advisor: z.string().min(1, 'At least one advisor is required'),
  program: z.string().min(1, 'Program is required'),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
});

type ThesisFormData = z.infer<typeof thesisSchema>;

interface EditSubmissionDialogProps {
  thesis: Thesis;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSubmissionDialog = ({ thesis, open, onOpenChange }: EditSubmissionDialogProps) => {
  const { toast } = useToast();
  const { getProgramsByDepartment } = useSettingsStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const availablePrograms = getProgramsByDepartment(thesis.department);
  const currentYear = new Date().getFullYear();

  const updateMutation = useUpdateStudentSubmission();

  const form = useForm<ThesisFormData>({
    resolver: zodResolver(thesisSchema),
    defaultValues: {
      title: thesis.title || '',
      authors: thesis.authors.map(a => a.name).join('; ') || '',
      advisor: thesis.advisors.map(a => a.name).join('; ') || '',
      program: thesis.program || '',
      year: thesis.year || currentYear,
      abstract: thesis.abstract || '',
    },
  });

  // Reset form when thesis changes
  useEffect(() => {
    if (thesis) {
      form.reset({
        title: thesis.title || '',
        authors: thesis.authors.map(a => a.name).join('; ') || '',
        advisor: thesis.advisors.map(a => a.name).join('; ') || '',
        program: thesis.program || '',
        year: thesis.year || currentYear,
        abstract: thesis.abstract || '',
      });
    }
  }, [thesis, form, currentYear]);

  const onSubmit = (data: ThesisFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('abstract', data.abstract);
    formData.append('authors', JSON.stringify(data.authors.split(';').map((name, index) => ({ id: `author-${index + 1}`, name: name.trim() }))));
    formData.append('advisors', JSON.stringify(data.advisor.split(';').map((name, index) => ({ id: `advisor-${index + 1}`, name: name.trim() }))));
    formData.append('department', thesis.department);
    formData.append('program', data.program);
    formData.append('year', data.year.toString());

    if (selectedFile) {
      formData.append('pdf', selectedFile);
    }

    updateMutation.mutate(
      { id: thesis.id, data: formData },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedFile(null);
          setPdfPreviewUrl(null);
        },
      }
    );
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Thesis Submission</DialogTitle>
          <DialogDescription>
            Update your thesis information. Only pending submissions can be edited.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
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
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>PDF File (Optional - leave empty to keep current PDF)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
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
                          Click to upload new PDF file (Max 50MB)
                        </p>
                        {thesis.pdfUrl && (
                          <p className="text-xs text-muted-foreground">
                            Current PDF will be kept if no new file is uploaded
                          </p>
                        )}
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
                      onClick={removeFile}
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

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Submission'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubmissionDialog;
