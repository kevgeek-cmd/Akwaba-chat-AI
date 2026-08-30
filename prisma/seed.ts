import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding AI models...");

  // Désactiver tous les anciens modèles (notamment les modèles payants)
  await prisma.aiModel.updateMany({
    data: { isActive: false, isDefault: false },
  });

  const defaultModels = [
    {
      slug: "minimax/minimax-m3:free",
      name: "MiniMax M3 (Recommandé)",
      provider: "MiniMax (Free)",
      description: "Modèle gratuit ultra-rapide (~1s), Nouchi authentique, 1M de contexte et support Vision.",
      isDefault: true,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "openrouter/free",
      name: "Auto-Router Free",
      provider: "OpenRouter (Free)",
      description: "Router automatique 100% gratuit avec support Vision et Texte.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "dots-studio/dots-3-note-preview:free",
      name: "Dots 3 Vision",
      provider: "Dots Studio (Free)",
      description: "Modèle multimodal gratuit pour l'analyse d'images et de notes.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "google/gemma-4-31b-it:free",
      name: "Gemma 4 31B Vision",
      provider: "Google (Free)",
      description: "Modèle gratuit de Google pour l'analyse d'images et texte.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
  ];

  for (const model of defaultModels) {
    await prisma.aiModel.upsert({
      where: { slug: model.slug },
      update: model,
      create: model,
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
