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
      slug: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      provider: "Google AI Studio",
      description: "Fast, intelligent, multimodal model powered by Google AI Studio.",
      isDefault: true,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "gemini-2.0-flash-lite",
      name: "Gemini 2.0 Flash Lite",
      provider: "Google AI Studio",
      description: "Ultra lightweight and fast Gemini model for high-throughput tasks.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "Google AI Studio",
      description: "Advanced reasoning model with large context window for complex prompts.",
      isDefault: false,
      isActive: true,
      supportsVision: true,
    },
    {
      slug: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      provider: "Google AI Studio",
      description: "Balanced speed and quality multimodal Gemini model.",
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
