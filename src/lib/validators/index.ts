import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Le message ne peut pas être vide"),
  conversationId: z.string().uuid().optional(),
  model: z.string().default("openai/gpt-4o-mini"),
  imageUrl: z.string().url().optional(),
  mode: z.enum(["nouchi", "standard"]).default("nouchi"),
});

export const renameConversationSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(100, "Titre trop long"),
});

export const messageFeedbackSchema = z.object({
  feedback: z.enum(["LIKE", "DISLIKE", "NONE"]),
});

export const userSettingsSchema = z.object({
  defaultModel: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(256).max(8192).default(2048),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type RenameConversationInput = z.infer<typeof renameConversationSchema>;
export type MessageFeedbackInput = z.infer<typeof messageFeedbackSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
