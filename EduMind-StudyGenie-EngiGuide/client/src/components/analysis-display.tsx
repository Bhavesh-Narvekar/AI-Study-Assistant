import { 
  Lightbulb, 
  Key, 
  Calculator, 
  ListOrdered, 
  BookOpen, 
  FileText,
  Quote,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { DocumentAnalysis, AnalysisSection } from "@shared/schema";

interface AnalysisDisplayProps {
  analysis: DocumentAnalysis;
}

function getSectionIcon(type: AnalysisSection["type"]) {
  switch (type) {
    case "explanation":
      return <Lightbulb className="w-5 h-5 text-amber-500" />;
    case "keyPoints":
      return <Key className="w-5 h-5 text-blue-500" />;
    case "formula":
      return <Calculator className="w-5 h-5 text-purple-500" />;
    case "stepByStep":
      return <ListOrdered className="w-5 h-5 text-green-500" />;
    case "example":
      return <BookOpen className="w-5 h-5 text-orange-500" />;
    case "summary":
      return <FileText className="w-5 h-5 text-cyan-500" />;
    case "definition":
      return <Quote className="w-5 h-5 text-pink-500" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
}

function getSectionLabel(type: AnalysisSection["type"]) {
  switch (type) {
    case "explanation":
      return "Explanation";
    case "keyPoints":
      return "Key Points";
    case "formula":
      return "Formula";
    case "stepByStep":
      return "Step-by-Step";
    case "example":
      return "Example";
    case "summary":
      return "Summary";
    case "definition":
      return "Definition";
    default:
      return "Content";
  }
}

function SectionCard({ section }: { section: AnalysisSection }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-6" data-testid={`card-section-${section.id}`}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
            >
              <div className="flex items-center gap-3">
                {getSectionIcon(section.type)}
                <div className="text-left">
                  <CardTitle className="text-lg font-semibold">
                    {section.title}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {getSectionLabel(section.type)}
                  </Badge>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            
            {section.type === "formula" ? (
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{section.content}</pre>
              </div>
            ) : section.type === "stepByStep" && section.items ? (
              <ol className="space-y-4">
                {section.items.map((item, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <p className="text-foreground leading-relaxed pt-1">{item}</p>
                  </li>
                ))}
              </ol>
            ) : section.type === "keyPoints" && section.items ? (
              <ul className="space-y-3">
                {section.items.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                    <p className="text-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            ) : section.type === "definition" ? (
              <div className="border-l-4 border-primary/50 pl-4 py-2 bg-primary/5 rounded-r-lg">
                <p className="text-foreground leading-relaxed italic">{section.content}</p>
              </div>
            ) : section.type === "example" ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function TableOfContents({ sections, onNavigate }: { sections: AnalysisSection[]; onNavigate: (id: string) => void }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav className="space-y-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors flex items-center gap-2"
              data-testid={`toc-item-${section.id}`}
            >
              <span className="text-muted-foreground">{index + 1}.</span>
              <span className="truncate">{section.title}</span>
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const handleNavigate = (sectionId: string) => {
    const element = document.querySelector(`[data-testid="card-section-${sectionId}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="analysis-display">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {analysis.fileType.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(analysis.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-2xl font-bold mb-2" data-testid="text-analysis-title">
                {analysis.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground truncate" data-testid="text-filename">
                {analysis.fileName}
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">AI Analysis</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed" data-testid="text-overview">
            {analysis.overview}
          </p>
        </CardContent>
      </Card>

      {analysis.sections.length > 3 && (
        <TableOfContents sections={analysis.sections} onNavigate={handleNavigate} />
      )}

      <ScrollArea className="h-auto">
        {analysis.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </ScrollArea>

      {analysis.keyTakeaways.length > 0 && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex gap-3" data-testid={`takeaway-${index}`}>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <p className="text-foreground leading-relaxed">{takeaway}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
