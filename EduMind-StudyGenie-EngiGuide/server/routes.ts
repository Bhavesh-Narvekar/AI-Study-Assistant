import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import OpenAI from "openai";
import { storage } from "./storage";
import type { Document, DocumentAnalysis, AnalysisSection } from "@shared/schema";
import { randomUUID } from "crypto";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."));
    }
  },
});

async function analyzeWithOpenAI(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<DocumentAnalysis> {
  const base64 = fileBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const systemPrompt = `You are an advanced educational AI designed to help engineering students understand study materials easily. You will analyze the uploaded document (which could be a PDF page, image, handwritten notes, or printed notes).

Your task is to:
1. Extract and understand ALL content including text, diagrams, formulas, and tables
2. Provide clear, beginner-friendly explanations of all topics
3. Break down complex concepts step-by-step
4. Identify key definitions, formulas, and important points
5. If content is handwritten or unclear, interpret it as accurately as possible

Respond with a JSON object in this exact format:
{
  "title": "A descriptive title for the content",
  "overview": "A brief 2-3 sentence overview of what this document covers",
  "sections": [
    {
      "id": "unique-id",
      "type": "explanation|keyPoints|formula|stepByStep|example|summary|definition",
      "title": "Section title",
      "content": "Main content text (use this for explanation, formula, example, summary, definition types)",
      "items": ["Array of items (use this for keyPoints and stepByStep types)"]
    }
  ],
  "keyTakeaways": ["Array of the most important points to remember"]
}

Guidelines for sections:
- Use "explanation" for detailed topic explanations
- Use "keyPoints" with items array for bullet-point lists of important concepts
- Use "formula" for mathematical formulas and equations (format them clearly)
- Use "stepByStep" with items array for procedural breakdowns and derivations
- Use "example" for worked examples and sample problems
- Use "summary" for section summaries
- Use "definition" for important definitions

Make your explanations:
- Beginner-friendly and easy to understand
- Technically accurate
- Well-structured with clear hierarchy
- Include real-life applications where relevant`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze this study material (${fileName}) and provide a comprehensive, student-friendly explanation. Extract all text, formulas, diagrams descriptions, and key concepts. Organize the content into clear sections.`,
          },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content);
  
  // Ensure all sections have valid IDs
  const sections: AnalysisSection[] = (parsed.sections || []).map((section: any, index: number) => ({
    id: section.id || `section-${index}`,
    type: section.type || "explanation",
    title: section.title || `Section ${index + 1}`,
    content: section.content || "",
    items: section.items,
  }));

  return {
    id: randomUUID(),
    fileName,
    fileType: mimeType.includes("pdf") ? "pdf" : "image",
    uploadedAt: new Date().toISOString(),
    title: parsed.title || fileName,
    overview: parsed.overview || "Analysis of uploaded document",
    sections,
    keyTakeaways: parsed.keyTakeaways || [],
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Upload and analyze document
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { buffer, originalname, mimetype, size } = req.file;

      // Create initial document record
      const doc = await storage.createDocument({
        fileName: originalname,
        fileType: mimetype.includes("pdf") ? "pdf" : "image",
        fileSize: size,
        uploadedAt: new Date().toISOString(),
        status: "analyzing",
      });

      try {
        // Analyze with OpenAI
        const analysis = await analyzeWithOpenAI(buffer, originalname, mimetype);
        
        // Update document with analysis
        const updated = await storage.updateDocument(doc.id, {
          status: "complete",
          analysis,
        });

        res.json(updated);
      } catch (analyzeError: any) {
        console.error("Analysis error:", analyzeError);
        
        // Update document with error status
        await storage.updateDocument(doc.id, {
          status: "error",
          errorMessage: analyzeError.message || "Failed to analyze document",
        });

        res.status(500).json({ 
          message: analyzeError.message || "Failed to analyze document" 
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to upload document" 
      });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  return httpServer;
}
