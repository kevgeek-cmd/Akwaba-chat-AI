import { prisma } from "@/lib/db/prisma";
import { Role, Feedback } from "@prisma/client";

export class MessageRepository {
  static async create(data: {
    conversationId: string;
    role: Role;
    content: string;
    modelUsed?: string;
    executionTime?: number;
    attachments?: { fileUrl: string; fileType: string; fileName: string; fileSize: number }[];
  }) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        modelUsed: data.modelUsed,
        executionTime: data.executionTime,
        attachments: data.attachments
          ? {
              create: data.attachments,
            }
          : undefined,
      },
      include: { attachments: true },
    });
  }

  static async updateFeedback(id: string, feedback: Feedback) {
    return prisma.message.update({
      where: { id },
      data: { feedback },
    });
  }
}
