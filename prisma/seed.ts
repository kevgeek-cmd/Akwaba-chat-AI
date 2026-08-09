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
      description: "Fast, lightweight and intelligent model for everyday chat tasks.",
      isDefault: true,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "meta-llama/llama-3.3-70b-instruct",
      name: "Llama 3.3 70B",
      provider: "Meta",
      description: "State-of-the-art open-source model with high reasoning capacity.",
      isDefault: false,
      isActive: true,
      supportsVision: false,
    },
    {
      slug: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      description: "Exceptional capabilities in coding, writing and analytical thinking.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "google/gemini-2.0-flash-001",
      name: "Gemini 2.0 Flash",
      provider: "Google",
      description: "Ultra-fast response times and native multimodal understanding.",
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
