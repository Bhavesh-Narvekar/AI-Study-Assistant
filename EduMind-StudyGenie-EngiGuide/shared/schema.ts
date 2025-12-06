import { z } from "zod";

// Analysis section schema
export const analysisSectionSchema = z.object({
  id: z.string(),
  type: z.enum(["explanation", "keyPoints", "formula", "stepByStep", "example", "summary", "definition"]),
  title: z.string(),
  content: z.string(),
  items: z.array(z.string()).optional(),
});

export type AnalysisSection = z.infer<typeof analysisSectionSchema>;

// Document analysis schema
export const documentAnalysisSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.enum(["pdf", "image"]),
  uploadedAt: z.string(),
  title: z.string(),
  overview: z.string(),
  sections: z.array(analysisSectionSchema),
  keyTakeaways: z.array(z.string()),
});

export type DocumentAnalysis = z.infer<typeof documentAnalysisSchema>;

// Document schema
export const documentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.enum(["pdf", "image"]),
  fileSize: z.number(),
  uploadedAt: z.string(),
  analysis: documentAnalysisSchema.optional(),
  status: z.enum(["uploading", "analyzing", "complete", "error"]),
  errorMessage: z.string().optional(),
});

export type Document = z.infer<typeof documentSchema>;

// Insert schema for creating documents (omit id as it's auto-generated)
export const insertDocumentSchema = documentSchema.omit({ id: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// API response schemas
export const uploadResponseSchema = documentSchema;
export type UploadResponse = z.infer<typeof uploadResponseSchema>;

// Legacy user types (kept for compatibility with template)
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}
