import { prisma } from "@/lib/db/prisma";

export class ConversationRepository {
  static async findByUserId(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  static async findById(id: string, userId: string) {
    return prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { attachments: true },
        },
      },
    });
  }

  static async create(userId: string, title?: string) {
    return prisma.conversation.create({
      data: {
        userId,
        title: title || "Nouvelle conversation",
      },
    });
  }

  static async updateTitle(id: string, userId: string, title: string) {
    return prisma.conversation.updateMany({
      where: { id, userId },
      data: { title },
    });
  }

  static async delete(id: string, userId: string) {
    return prisma.conversation.deleteMany({
      where: { id, userId },
    });
  }

  static async deleteAllByUserId(userId: string) {
    return prisma.conversation.deleteMany({
      where: { userId },
    });
  }
}
