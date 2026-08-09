import { NextRequest, NextResponse } from "next/server";
import { MessageRepository } from "@/repositories/message.repository";
import { messageFeedbackSchema } from "@/lib/validators";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = messageFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const updated = await MessageRepository.updateFeedback(id, validation.data.feedback);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

