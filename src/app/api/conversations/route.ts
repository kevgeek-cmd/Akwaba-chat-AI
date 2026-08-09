import { NextResponse } from "next/server";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { UserRepository } from "@/repositories/user.repository";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const dbUser = supabaseUser
      ? await UserRepository.findBySupabaseId(supabaseUser.id)
      : await UserRepository.findBySupabaseId("demo-guest-id");

    if (!dbUser) {
      return NextResponse.json([], { status: 200 });
    }

    const conversations = await ConversationRepository.findByUserId(dbUser.id);
    return NextResponse.json(conversations);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const dbUser = supabaseUser
      ? await UserRepository.findBySupabaseId(supabaseUser.id)
      : await UserRepository.findBySupabaseId("demo-guest-id");

    if (!dbUser) {
      return NextResponse.json({ success: true });
    }

    await ConversationRepository.deleteAllByUserId(dbUser.id);
    return NextResponse.json({ success: true, message: "Toutes les conversations ont été supprimées." });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
