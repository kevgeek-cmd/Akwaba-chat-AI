import { prisma } from "@/lib/db/prisma";

export class ModelRepository {
  static async getActiveModels() {
    return prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: { isDefault: "desc" },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.aiModel.findUnique({
      where: { slug },
    });
  }
}
