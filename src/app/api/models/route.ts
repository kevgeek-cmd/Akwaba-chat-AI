import { NextResponse } from "next/server";
import { ModelRepository } from "@/repositories/model.repository";

export async function GET() {
  try {
    const models = await ModelRepository.getActiveModels();
    return NextResponse.json(models);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

