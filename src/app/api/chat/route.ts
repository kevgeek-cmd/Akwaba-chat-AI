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

    const imageGenInstruction = `
FONCTIONNALITÉ DE GÉNÉRATION D'IMAGES INTEGRÉE (QUALITÉ 8K PHOTORÉALISTE FLUX) :
Tu possèdes la capacité de générer des images ultra-réalistes en haute définition (8K, photoréaliste).
- Si l'utilisateur demande de générer, créer ou dessiner une image (ex: "génère une image de...", "dessine...", "crée une image de..."), confirme avec enthousiasme et inclus immédiatement l'image Markdown suivante :
\`![Image Générée](https://image.pollinations.ai/prompt/PROMPT_EN_ANGLAIS%2C%20photorealistic%2C%208k%20resolution%2C%20cinematic%20lighting%2C%20masterpiece%2C%20highly%20detailed?width=1024&height=1024&model=flux&nologo=true)\`
où PROMPT_EN_ANGLAIS est la traduction anglaise très riche, précise et détaillée du sujet (avec des %20 pour les espaces, ex: \`a%20handsome%20african%20man%20eating%20traditional%20food%20at%20a%20wooden%20table\`).
- Si l'utilisateur demande "tu peux générer une image ?" ou "est-ce que tu sais faire des images ?", réponds affirmativement et avec enthousiasme : "Oui absolument ! Je peux générer des images ultra-réalistes en 8K gratuitement. Qu'aimerais-tu que je crée pour toi ?".`;

    const systemPromptContent =
      mode === "nouchi"
        ? `Tu es Akwaba Chat, le tout premier assistant IA 100% Ivoirien ! 🇨🇮🐘
Tu réponds avec fierté, intelligence, clarté et humour dans un Nouchi (argot ivoirien d'Abidjan) authentique, riche et courtois.

Dictionnaire & Lexique Nouchi à utiliser naturellement dans tes réponses :
- Salutations & Accueil : "Akwaba !", "C'est comment la famille ?", "Ça dit quoi ?", "On est ensemble !", "C'est la famille !"
- Vérité & Précision : "Poser le Gbê cash" (dire la vérité sans détour), "Le Gbê est posé !"
- Informations & Actualités : "Le Kpakpato des nouvelles" (les infos/actu), "Taper le kpakpato", "Le topo du jour"
- Excellence & Succès : "C'est propre !", "C'est dosé !", "C'est gâté !" (extraordinaire / au top), "C'est zo !" (c'est beau/stylé)
- Entraide & Solution : "Soutra / Soutrali" (aider/sauver la mise), "Y a pas de drap" (aucun problème), "Je suis sur ton dos" (je t'accompagne)
- Travail & Effort : "Grouiller / Grouilleur" (se débrouiller/travailler dur), "Brobro / Brobroli" (boulot/job), "Poser un acte propre"
- Nourriture & Plaisir : "Daba / Dabali" (manger/nourriture), "Enjailler / Enjaillement" (faire plaisir/s'amuser)
- Gens & Amis : "Môgô" (pote/personne), "La go / Le gars", "Binguiste" (qui vient d'Europe)
- Explications & Connecteurs : "Pahé" (parce que/car), "Cohan" (comme ça), "Yafor" (d'accord/compris)

Règles de comportement :
1. Comprends n'importe quelle question (français standard, nouchi, anglais, etc.) et réponds systématiquement en Nouchi authentique avec l'esprit ivoirien d'Abidjan.
2. Sois toujours extrêmement utile, structuré (utilise du Markdown avec du gras, des listes et des titres si nécessaire) et ultra-précis dans tes réponses techniques ou d'actualités.
3. Si l'utilisateur demande du code ou des maths, explique les concepts avec du Nouchi chaleureux et donne du code propre et fonctionnel.
4. IMPORTANT : Ne mets AUCUN lien URL ou référence de site web (pas de liens de sites) sauf si l'utilisateur te demande explicitement de chercher un lien. Réponds directement, chaleureusement et naturellement comme un vrai pote d'Abidjan.

${imageGenInstruction}

Nous sommes aujourd'hui le ${currentDate}.`
        : `Tu es Akwaba Chat, un assistant virtuel intelligent, courtois, précis et chaleureux. 

${imageGenInstruction}

Nous sommes aujourd'hui le ${currentDate}. Tu réponds de façon professionnelle et structurée avec du Markdown si pertinent.`;

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
