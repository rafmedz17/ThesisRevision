import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Users, Eye} from "lucide-react";
import { Thesis } from "@/types/thesis";

interface ThesisViewDialogProps {
  thesis: Thesis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showPdfPreview?: boolean; // Control whether PDF preview is available
}

const ThesisViewDialog = ({ thesis, open, onOpenChange, showPdfPreview: showPdfPreviewProp = false }: ThesisViewDialogProps) => {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  if (!thesis) return null;

  // Get PDF URL (handles both Cloudinary and local URLs)
  const getPdfUrl = () => {
    if (!thesis.pdfUrl) return null;

    // If URL is already complete (Cloudinary), use it directly
    if (thesis.pdfUrl.startsWith('http://') || thesis.pdfUrl.startsWith('https://')) {
      return thesis.pdfUrl;
    }

    // Otherwise, construct URL for local uploads
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${thesis.pdfUrl}`;
  };

  const pdfUrl = getPdfUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{thesis.title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Year */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {thesis.year}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {thesis.program}
              </Badge>
            </div>

            {/* Authors Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Author/s</h3>
              </div>
              <div className="space-y-2">
                {thesis.authors.map((author) => (
                  <div key={author.id} className="flex flex-col">
                    <span className="font-medium">{author.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Abstract */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Abstract/Summary</h3>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {thesis.abstract}
              </p>
            </div>

            <Separator />
            {/* advisor name */}
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Adviser</h3>
              </div>
              <div className="space-y-2">
                {thesis.advisors.map((advisor) => (
                  <div key={advisor.id} className="flex flex-col">
                    <span className="font-medium">{advisor.name}</span>
                  </div>
                ))}
              </div>

            {/* PDF Preview Section - Only show if showPdfPreviewProp is true (admin only) */}
            {pdfUrl && showPdfPreviewProp && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">PDF Document</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPdfPreview(!showPdfPreview)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPdfPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                  </div>
                  {showPdfPreview && (
                    <div className="overflow-hidden">
                      <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                        className="w-[1100px] h-[500px]"
                        title="PDF Preview"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ThesisViewDialog;
