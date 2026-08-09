import { prisma } from "@/lib/db/prisma";

export class UserRepository {
  static async findBySupabaseId(supabaseId: string) {
    return prisma.user.findUnique({
      where: { supabaseId },
      include: { settings: true },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async createOrUpdateFromSupabase(data: {
    supabaseId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }) {
    return prisma.user.upsert({
      where: { supabaseId: data.supabaseId },
      update: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      create: {
        supabaseId: data.supabaseId,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        settings: {
          create: {
            defaultModel: "openai/gpt-4o-mini",
            theme: "system",
          },
        },
      },
      include: { settings: true },
    });
  }
}
