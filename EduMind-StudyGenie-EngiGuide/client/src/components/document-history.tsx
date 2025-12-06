import { FileText, Image, Clock, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Document } from "@shared/schema";

interface DocumentHistoryProps {
  documents: Document[];
  selectedId: string | null;
  onSelect: (doc: Document) => void;
  onDelete: (id: string) => void;
}

export function DocumentHistory({ documents, selectedId, onSelect, onDelete }: DocumentHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "analyzing":
        return <Badge variant="secondary" className="text-xs">Analyzing</Badge>;
      case "error":
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      case "complete":
        return null;
      default:
        return null;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">No documents yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload your first study material to get started
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-1 p-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              selectedId === doc.id
                ? "bg-primary/10"
                : "hover:bg-muted"
            )}
            onClick={() => onSelect(doc)}
            data-testid={`doc-item-${doc.id}`}
          >
            <div className="flex-shrink-0">
              {doc.fileType === "pdf" ? (
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Image className="w-5 h-5 text-blue-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {doc.analysis?.title || doc.fileName}
                </p>
                {getStatusBadge(doc.status)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDate(doc.uploadedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
                data-testid={`button-delete-${doc.id}`}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground transition-opacity",
                selectedId === doc.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )} />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
