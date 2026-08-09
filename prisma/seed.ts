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

  const defaultModels = [
    {
      slug: "openai/gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      description: "Modèle rapide, intelligent et multimodal (Texte & Vision).",
      isDefault: true,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "openrouter/free",
      name: "OpenRouter Free",
      provider: "OpenRouter",
      description: "Router automatique de modèles 100% gratuits avec support Vision.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "google/gemma-4-31b-it:free",
      name: "Gemma 4 31B Vision",
      provider: "Google (Free)",
      description: "Modèle gratuit de Google capable d'analyser des images et du texte.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "nvidia/nemotron-nano-12b-v2-vl:free",
      name: "Nemotron 12B VL",
      provider: "NVIDIA (Free)",
      description: "Modèle gratuit NVIDIA Vision-Language pour l'analyse d'images.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "meta-llama/llama-3.3-70b-instruct",
      name: "Llama 3.3 70B",
      provider: "Meta",
      description: "Modèle open-source de pointe pour la génération de texte et raisonnement.",
      isDefault: false,
      isActive: true,
      supportsVision: false,
    },
    {
      slug: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      description: "Modèle d'excellence pour le code, la rédaction et l'analyse d'images.",
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
