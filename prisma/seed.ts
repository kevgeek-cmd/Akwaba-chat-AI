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
      slug: "minimax/minimax-m2.7:free",
      name: "MiniMax M2.7 (Recommandé)",
      provider: "MiniMax (Free)",
      description: "Modèle gratuit ultra-rapide (~1.5s), Nouchi authentique, contexte 196k.",
      isDefault: true,
      isActive: true,
      supportsVision: false,
    },
    {
      slug: "dots-studio/dots-3-note-preview:free",
      name: "Dots 3 Vision",
      provider: "Dots Studio (Free)",
      description: "Modèle multimodal gratuit pour l'analyse d'images et texte.",
      isDefault: false,
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
      slug: "nvidia/nemotron-3.5-lightning:free",
      name: "Nemotron 3.5 Lightning",
      provider: "NVIDIA (Free)",
      description: "Modèle de raisonnement NVIDIA rapide.",
      isDefault: false,
      isActive: true,
      supportsVision: false,
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
