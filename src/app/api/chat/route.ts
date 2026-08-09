import { NextRequest, NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/validators";
import { AIService, ChatMessagePayload } from "@/services/ai.service";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { MessageRepository } from "@/repositories/message.repository";
import { UserRepository } from "@/repositories/user.repository";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    // En environnement de démo sans login forcé, créer ou utiliser un user anonyme/démo
    let dbUser;
    if (supabaseUser) {
      dbUser = await UserRepository.createOrUpdateFromSupabase({
        supabaseId: supabaseUser.id,
        email: supabaseUser.email || "user@akwabachat.ci",
        name: supabaseUser.user_metadata?.full_name || "Utilisateur",
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
      });
    } else {
      // Démo / Invité
      dbUser = await UserRepository.createOrUpdateFromSupabase({
        supabaseId: "demo-guest-id",
        email: "demo@akwabachat.ci",
        name: "Invité Akwaba",
      });
    }

    const body = await req.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { content, conversationId: reqConvId, model, imageUrl, mode } = validation.data;

    const currentDate = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemPromptContent =
      mode === "nouchi"
        ? `Tu es Akwaba Chat, le premier assistant virtuel 100% Ivoirien ! 🇨🇮🐘
Tu t'exprimes avec enthousiasme, précision et chaleur dans un nouchi (argot ivoirien) authentique, riche et courtois.

Principes de réponse en Nouchi :
1. Utilise naturellement et couramment le vocabulaire et les tournures nouchi :
   - Salutations & Esprit : "Akwaba !", "C'est comment la famille ?", "Ça dit quoi ?", "On est ensemble !"
   - Vérité & Clarté : "Le Gbê est posé cash", "Je te donne le Gbê"
   - Infos & Actualités : "Le kpakpato des nouvelles", "Voilà le topo du pays et du monde"
   - Qualité & Succès : "C'est propre !", "C'est dosé !", "C'est gâté !"
   - Soutien : "Y a pas de drap", "Je suis sur ton dos"
2. Reste toujours hyper intelligent, utile, structuré (utilise du Markdown propre avec gras et listes).
3. Tu comprends parfaitement le français standard, le nouchi et n'importe quelle langue, et tu réponds avec l'esprit et l'humour ivoirien.
Nous sommes aujourd'hui le ${currentDate}. Tu as accès aux recherches web et actualités en direct.`
        : `Tu es Akwaba Chat, un assistant virtuel intelligent, courtois, précis et chaleureux. Nous sommes aujourd'hui le ${currentDate}. Tu as accès aux recherches web en temps réel. Tu réponds de façon professionnelle et structurée avec du Markdown si pertinent.`;

    // 1. Récupérer ou créer la conversation
    let conversation;
    if (reqConvId) {
      conversation = await ConversationRepository.findById(reqConvId, dbUser.id);
    }

    if (!conversation) {
      // Titre généré à partir des 5 premiers mots du message
      const initialTitle = content.split(" ").slice(0, 5).join(" ");
      conversation = await ConversationRepository.create(dbUser.id, initialTitle);
    }

    // 2. Enregistrer le message Utilisateur
    await MessageRepository.create({
      conversationId: conversation.id,
      role: "USER",
      content,
      attachments: imageUrl
        ? [{ fileUrl: imageUrl, fileType: "image/png", fileName: "image.png", fileSize: 0 }]
        : undefined,
    });

    // 3. Préparer l'historique des messages pour OpenRouter
    const conversationWithMessages = await ConversationRepository.findById(conversation.id, dbUser.id);
    const existingMessages = conversationWithMessages?.messages || [];
    const formattedMessages: ChatMessagePayload[] = [
      {
        role: "system",
        content: systemPromptContent,
      },
      ...existingMessages.map((m: { role: string; content: string }) => ({
        role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user",
        content: imageUrl
          ? [
              { type: "text", text: content },
              { type: "image_url", image_url: { url: imageUrl } },
            ]
          : content,
      },
    ];

    // 4. Appeler OpenRouter API
    const openRouterResponse = await AIService.streamCompletion({
      model,
      messages: formattedMessages,
    });

    // 5. Transformer le stream HTTP vers le client SSE + Enregistrement en DB à la fin du stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponseContent = "";

    const customStream = new ReadableStream({
      async start(controller) {
        // Envoyer d'abord les métadonnées (conversationId)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "meta", conversationId: conversation.id })}\n\n`)
        );

        if (!openRouterResponse.body) {
          controller.close();
          return;
        }

        const reader = openRouterResponse.body.getReader();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;

            if (trimmed === "data: [DONE]") {
              continue;
            }

            if (trimmed.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const textChunk = parsed.choices?.[0]?.delta?.content || "";
                if (textChunk) {
                  fullResponseContent += textChunk;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: textChunk })}\n\n`)
                  );
                }
              } catch {
                // Ignore chunk parse errors
              }
            }
          }
        }

        const executionTime = Date.now() - startTime;

        // Save AI Message in DB
        const savedMessage = await MessageRepository.create({
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: fullResponseContent,
          modelUsed: model,
          executionTime,
        });

        // Send final done event with full message metadata
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              messageId: savedMessage.id,
              executionTime,
              modelUsed: model,
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new NextResponse(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
