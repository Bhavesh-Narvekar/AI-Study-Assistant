import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Upload, History, HelpCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisDisplay } from "@/components/analysis-display";
import { DocumentHistory } from "@/components/document-history";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document, DocumentAnalysis } from "@shared/schema";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { toast } = useToast();

  const { data: documents = [], isLoading: isLoadingDocs } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }
      
      return response.json() as Promise<Document>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      if (data.analysis) {
        setCurrentAnalysis(data.analysis);
        setSelectedDocId(data.id);
      }
      setSelectedFile(null);
      toast({
        title: "Analysis Complete",
        description: "Your study materials have been analyzed successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setSelectedFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      if (selectedDocId === deletedId) {
        setCurrentAnalysis(null);
        setSelectedDocId(null);
      }
      toast({
        title: "Document Deleted",
        description: "The document has been removed from your history.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleSelectDocument = useCallback((doc: Document) => {
    setSelectedDocId(doc.id);
    if (doc.analysis) {
      setCurrentAnalysis(doc.analysis);
    }
    setIsHistoryOpen(false);
  }, []);

  const handleDeleteDocument = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleNewUpload = useCallback(() => {
    setCurrentAnalysis(null);
    setSelectedDocId(null);
    setSelectedFile(null);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg">AI Study Assistant</h1>
              <p className="text-xs text-muted-foreground">Your smart learning companion</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {currentAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewUpload}
                data-testid="button-new-upload"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Upload</span>
              </Button>
            )}
            
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-history">
                  <History className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Document History
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {isLoadingDocs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <DocumentHistory
                      documents={documents}
                      selectedId={selectedDocId}
                      onSelect={handleSelectDocument}
                      onDelete={handleDeleteDocument}
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-help">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>How to Use</DialogTitle>
                  <DialogDescription>
                    Get the most out of your AI Study Assistant
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Upload Your Materials</h4>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop PDFs, images, or photos of handwritten notes
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">AI Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Our AI reads and understands your content, extracting key concepts
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Learn Better</h4>
                      <p className="text-sm text-muted-foreground">
                        Get clear explanations, step-by-step breakdowns, and key takeaways
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {currentAnalysis ? (
          <AnalysisDisplay analysis={currentAnalysis} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">
                Understand Your Study Materials
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Upload PDFs, images, or handwritten notes and get clear, student-friendly explanations powered by AI
              </p>
            </div>
            
            <UploadZone
              onFileSelect={handleFileSelect}
              isUploading={uploadMutation.isPending}
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
            />

            {uploadMutation.isError && (
              <Card className="mt-6 max-w-md border-destructive/50 bg-destructive/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">
                    {uploadMutation.error?.message || "Failed to analyze the document. Please try again."}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <Card className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-2">Student-Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  Complex concepts explained in simple, easy-to-understand language
                </p>
              </Card>
              
              <Card className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Any Format</h3>
                <p className="text-sm text-muted-foreground">
                  PDFs, printed notes, or handwritten content - we handle it all
                </p>
              </Card>
              
              <Card className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <History className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Save & Review</h3>
                <p className="text-sm text-muted-foreground">
                  Access your analyzed documents anytime from your history
                </p>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AI Study Assistant - Helping engineering students learn smarter</p>
        </div>
      </footer>
    </div>
  );
}
