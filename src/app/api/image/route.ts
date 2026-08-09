import { NextRequest, NextResponse } from "next/server";
import { ImageService } from "@/services/image.service";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Le texte de description (prompt) est requis" },
        { status: 400 }
      );
    }

    const imageUrl = ImageService.generateFreeImage(prompt);

    return NextResponse.json({
      success: true,
      prompt: prompt.trim(),
      imageUrl,
    });
  } catch (error) {
    console.error("Erreur génération d'image:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'image" },
      { status: 500 }
    );
  }
}
