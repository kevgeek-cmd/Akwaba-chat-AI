import { NextRequest, NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/validators";
import { ChatMessagePayload, AIService } from "@/services/ai.service";
import { AIGatewayService } from "@/services/ai-gateway.service";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { MessageRepository } from "@/repositories/message.repository";
import { UserRepository } from "@/repositories/user.repository";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { formatNouchiLexiconForPrompt } from "@/lib/knowledge/nouchi-dictionary";
import { formatIvorianDataForPrompt } from "@/lib/knowledge/ivorian-data";
import { formatIvorianArtistsForPrompt } from "@/lib/knowledge/ivorian-artists";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

    const { content, conversationId: reqConvId, model: rawModel, imageUrl, mode } = validation.data;

    // Modèle par défaut ultra-rapide et fiable (vérifié en direct)
    // Si une image est fournie -> modèle multimodal (dots-3-note-preview:free)
    // Sinon -> modèle Nouchi rapide (minimax-m2.7:free ~1.5s)
    let model = rawModel;
    if (!model || model === "minimax/minimax-m3:free" || model === "openrouter/free") {
      model = imageUrl ? "dots-studio/dots-3-note-preview:free" : "minimax/minimax-m2.7:free";
    }

    const currentDate = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const nouchiLexicon = formatNouchiLexiconForPrompt();
    const ivorianData = formatIvorianDataForPrompt();
    const ivorianArtists = formatIvorianArtistsForPrompt();

    const imageGenInstruction = `
FONCTIONNALITÉ DE GÉNÉRATION D'IMAGES INTEGRÉE (QUALITÉ 8K PHOTORÉALISTE FLUX) :
Tu possèdes la capacité de générer des images en haute définition.
- Si l'utilisateur demande de générer, créer ou dessiner une image (ex: "génère une image de...", "dessine...", "crée une image de..."), confirme avec enthousiasme et inclus immédiatement l'image Markdown suivante :
\`![Image Générée](https://image.pollinations.ai/prompt/PROMPT_EN_ANGLAIS_ULTRA_DETAILLE%2C%20photorealistic%2C%208k%20resolution%2C%20cinematic%20lighting%2C%20masterpiece%2C%20highly%20detailed?width=1024&height=1024&model=flux-realism&nologo=true)\`
où PROMPT_EN_ANGLAIS_ULTRA_DETAILLE est la traduction anglaise très riche, précise et détaillée du sujet (avec des %20 pour les espaces, ex: pour "un homme africain qui mange à table", génère \`a%20detailed%20portrait%20of%20a%20handsome%20african%20man%20eating%20delicious%20traditional%20food%20at%20a%20dining%20table\`).
- Si l'utilisateur demande "tu peux générer une image ?" ou "est-ce que tu sais faire des images ?", réponds affirmativement et avec enthousiasme : "Oui absolument ! Je peux générer des images gratuitement. Qu'aimerais-tu que je crée pour toi ?".`;

    const systemPromptContent =
      mode === "nouchi"
        ? `Tu es Akwaba Chat, le tout premier assistant IA 100% Ivoirien ! 🇨🇮🐘
Tu réponds avec fierté, intelligence, clarté, humour et bienveillance dans un Nouchi (argot ivoirien d'Abidjan) authentique, riche et courtois.
Tu possèdes une connaissance approfondie, intime et experte de toute la culture, des artistes, des traditions, de l'histoire, des données territoriales et du quotidien de la Côte d'Ivoire.

${ivorianArtists}

${ivorianData}

📖 LEXIQUE & DICTIONNAIRE NOUCHI (Sources : Nouchitionnaire.com & Nouchi.ci) :
${nouchiLexicon}

🎯 RÈGLES DE COMPORTEMENT :
1. Comprends n'importe quelle langue ou demande (français standard, nouchi, anglais, etc.) et réponds systématiquement en Nouchi authentique, chaleureux et plein de punch ivoirien.
2. Sois toujours extrêmement utile, structuré (utilise du Markdown avec des listes, du gras et des titres bien clairs) et ultra-précis dans tes explications techniques, académiques ou d'actualités.
3. Si l'utilisateur pose une question sur le code, les sciences ou le travail, garde le ton Nouchi pour encourager et expliquer, tout en fournissant du code ou des réponses impeccables et professionnelles.
4. IMPORTANT : Ne mets AUCUN lien URL externe sauf si l'utilisateur demande explicitement une adresse web. Réponds directement comme un vrai frère/ami ivoirien qui maîtrise son sujet.

${imageGenInstruction}

Nous sommes aujourd'hui le ${currentDate}.`
        : `Tu es Akwaba Chat, un assistant virtuel intelligent, courtois, précis et chaleureux avec une expertise complète sur la Côte d'Ivoire.

${ivorianArtists}

${ivorianData}

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

    // 3. Préparer l'historique des messages pour la passerelle IA
    const conversationWithMessages = await ConversationRepository.findById(conversation.id, dbUser.id);
    const allMessages = conversationWithMessages?.messages || [];
    // Exclure le tout dernier message qui vient d'être inséré pour éviter de le doubler
    const previousMessages = allMessages.slice(0, -1);

    const formattedMessages: ChatMessagePayload[] = [
      {
        role: "system",
        content: systemPromptContent,
      },
      ...previousMessages.map((m: { role: string; content: string }) => ({
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

    // 4. Appeler la passerelle IA (avec fallback automatique en cascade)
    const gatewayResult = await AIGatewayService.streamCompletion({
      model,
      messages: formattedMessages,
    });

    const aiResponseStream = gatewayResult.response;

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

        // 1. Étape WALKING (15%) : Début de prise en charge de la requête
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              state: "walking",
              progress: 15,
              message: "Je commence la recherche...",
            })}\n\n`
          )
        );

        // 2. Étape RUNNING (38%) : Connexion au modèle & passerelle IA
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              state: "running",
              progress: 38,
              message: "J’accélère !",
            })}\n\n`
          )
        );

        if (!aiResponseStream.body) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                state: "error",
                progress: 0,
                errorCode: "NETWORK_ERROR",
                message: "Impossible d'établir la connexion au serveur IA 😔",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        const reader = aiResponseStream.body.getReader();
        let buffer = "";
        let hasTriggeredSearching = false;
        let hasTriggeredAnalysis = false;

        try {
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

              // Détecter les réponses d'erreur directes OpenRouter JSON
              if (trimmed.startsWith('{"error":') || trimmed.startsWith('data: {"error":')) {
                logger.warn("ChatAPI", "Error object detected in OpenRouter stream", { raw: trimmed });
                continue;
              }

              if (trimmed.startsWith("data: ")) {
                try {
                  const parsed = JSON.parse(trimmed.slice(6));
                  const textChunk = parsed.choices?.[0]?.delta?.content || "";
                  if (textChunk) {
                    // 3. Étape SEARCHING (72%) dès le premier chunk de texte reçu
                    if (!hasTriggeredSearching) {
                      hasTriggeredSearching = true;
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            type: "progress",
                            state: "searching",
                            progress: 72,
                            message: "Je cherche la réponse...",
                          })}\n\n`
                        )
                      );
                    }

                    fullResponseContent += textChunk;

                    // 4. Étape SEARCHING / Analyse approfondie (92%) dès que du contenu substantiel est généré
                    if (!hasTriggeredAnalysis && fullResponseContent.length > 100) {
                      hasTriggeredAnalysis = true;
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            type: "progress",
                            state: "searching",
                            progress: 92,
                            message: "J’analyse les résultats...",
                          })}\n\n`
                        )
                      );
                    }

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
        } catch (streamReadErr) {
          logger.error("ChatAPI", "Error while reading response stream", {
            error: streamReadErr instanceof Error ? streamReadErr.message : String(streamReadErr),
          });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                state: "error",
                progress: 0,
                errorCode: "NETWORK_ERROR",
                message: "Connexion interrompue lors de la recherche 😔",
              })}\n\n`
            )
          );
        }

        // Si pour une raison quelconque le stream est resté vide, faire un secours immédiat
        if (!fullResponseContent.trim()) {
          logger.warn("ChatAPI", "Stream produced empty content. Triggering emergency fallback generation.");
          try {
            const fallbackText = await AIService.quickFallbackCompletion({
              messages: formattedMessages,
              model: gatewayResult.modelUsed,
            });

            if (fallbackText) {
              fullResponseContent = fallbackText;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: fallbackText })}\n\n`)
              );
            }
          } catch (e) {
            logger.error("ChatAPI", "Emergency fallback generation failed", { error: String(e) });
          }
        }

        // Si même le secours n'a rien renvoyé, afficher un message d'assistance chaleureux et courtois
        if (!fullResponseContent.trim()) {
          const defaultApology =
            mode === "nouchi"
              ? "Ahi mon ami ! Les serveurs sont un peu calés en ce moment même. Repose ta question ou réessaie dans un instant, on est ensemble ! 🇨🇮🐘"
              : "Désolé, les serveurs d'intelligence artificielle rencontrent une forte affluence en ce moment. Veuillez réessayer dans quelques instants.";
          fullResponseContent = defaultApology;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: defaultApology })}\n\n`)
          );
        }

        const executionTime = Date.now() - startTime;

        // Nettoyer les éventuelles traces de raisonnement des modèles reasoning (ex: <think>...</think>)
        const sanitizedContent = fullResponseContent
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .replace(/^Here'?s a thinking process:[\s\S]*?(?=\n\n(?:[A-ZÀ-ÿ]|"[A-ZÀ-ÿ]|Salut|Akwaba|Bonjour|Yo|Ça))/i, "")
          .trim();

        const finalContent = sanitizedContent || fullResponseContent;

        // Save AI Message in DB
        const savedMessage = await MessageRepository.create({
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: finalContent,
          modelUsed: gatewayResult.modelUsed,
          executionTime,
        });

        logger.info("ChatAPI", "Completed chat response", {
          conversationId: conversation.id,
          providerUsed: gatewayResult.providerUsed,
          modelUsed: gatewayResult.modelUsed,
          fallbackOccurred: gatewayResult.fallbackOccurred,
          executionTimeMs: executionTime,
        });

        // 5. Étape SUCCESS (100%) : Réponse trouvée et persistée avec succès
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              state: "success",
              progress: 100,
              message: "Réponse trouvée !",
            })}\n\n`
          )
        );

        // Send final done event with full message metadata and content confirmation
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              messageId: savedMessage.id,
              executionTime,
              modelUsed: gatewayResult.modelUsed,
              content: finalContent,
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new NextResponse(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
    logger.error("ChatAPI", "Chat API POST Error", { error: errorMessage });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

