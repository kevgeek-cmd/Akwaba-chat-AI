import { NextRequest, NextResponse } from "next/server";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { UserRepository } from "@/repositories/user.repository";
import { renameConversationSchema } from "@/lib/validators";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const dbUser = supabaseUser
      ? await UserRepository.findBySupabaseId(supabaseUser.id)
      : await UserRepository.findBySupabaseId("demo-guest-id");

    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const conversation = await ConversationRepository.findById(id, dbUser.id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation non trouvée" }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const dbUser = supabaseUser
      ? await UserRepository.findBySupabaseId(supabaseUser.id)
      : await UserRepository.findBySupabaseId("demo-guest-id");

    if (!dbUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const validation = renameConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    await ConversationRepository.updateTitle(id, dbUser.id, validation.data.title);
    return NextResponse.json({ success: true, title: validation.data.title });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const dbUser = supabaseUser
      ? await UserRepository.findBySupabaseId(supabaseUser.id)
      : await UserRepository.findBySupabaseId("demo-guest-id");

    if (!dbUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await ConversationRepository.delete(id, dbUser.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
