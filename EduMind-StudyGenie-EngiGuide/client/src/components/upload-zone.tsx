import { useState, useCallback } from "react";
import { Upload, FileText, Image, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  selectedFile: File | null;
  onClearFile: () => void;
}

export function UploadZone({ onFileSelect, isUploading, selectedFile, onClearFile }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const isValidFile = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    return validTypes.includes(file.type);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };

  if (selectedFile) {
    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {getFileIcon(selectedFile)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" data-testid="text-selected-filename">
              {selectedFile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {isUploading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFile}
              data-testid="button-clear-file"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        {isUploading && (
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Our AI is reading and understanding your study materials...
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card
        className={cn(
          "p-8 border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
        data-testid="upload-dropzone"
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
          data-testid="input-file"
        />
        
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors",
            isDragOver ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            Upload Your Study Materials
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Drop your PDFs, images, or handwritten notes here and our AI will help you understand the content
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="secondary" className="text-xs">PDF</Badge>
            <Badge variant="secondary" className="text-xs">JPG</Badge>
            <Badge variant="secondary" className="text-xs">PNG</Badge>
          </div>
          
          <Button size="lg" data-testid="button-browse-files">
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </Card>
    </div>
  );
}
