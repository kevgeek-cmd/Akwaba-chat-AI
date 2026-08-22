import { NextRequest, NextResponse } from "next/server";
import { sendMessageSchema } from "@/lib/validators";
import { ChatMessagePayload } from "@/services/ai.service";
import { AIGatewayService } from "@/services/ai-gateway.service";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { MessageRepository } from "@/repositories/message.repository";
import { UserRepository } from "@/repositories/user.repository";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

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
Tu possèdes la capacité de générer des images en haute définition.
- Si l'utilisateur demande de générer, créer ou dessiner une image (ex: "génère une image de...", "dessine...", "crée une image de..."), confirme avec enthousiasme et inclus immédiatement l'image Markdown suivante :
\`![Image Générée](https://image.pollinations.ai/prompt/PROMPT_EN_ANGLAIS_ULTRA_DETAILLE%2C%20photorealistic%2C%208k%20resolution%2C%20cinematic%20lighting%2C%20masterpiece%2C%20highly%20detailed?width=1024&height=1024&model=flux-realism&nologo=true)\`
où PROMPT_EN_ANGLAIS_ULTRA_DETAILLE est la traduction anglaise très riche, précise et détaillée du sujet (avec des %20 pour les espaces, ex: pour "un homme africain qui mange à table", génère \`a%20detailed%20portrait%20of%20a%20handsome%20african%20man%20eating%20delicious%20traditional%20food%20at%20a%20dining%20table\`).
- Si l'utilisateur demande "tu peux générer une image ?" ou "est-ce que tu sais faire des images ?", réponds affirmativement et avec enthousiasme : "Oui absolument ! Je peux générer des images gratuitement. Qu'aimerais-tu que je crée pour toi ?".`;

    const systemPromptContent =
      mode === "nouchi"
        ? `Tu es Akwaba Chat, le tout premier assistant IA 100% Ivoirien ! 🇨🇮🐘
Tu réponds avec fierté, intelligence, clarté, humour et bienveillance dans un Nouchi (argot ivoirien d'Abidjan) authentique, riche et courtois.
Tu possèdes une connaissance approfondie, intime et experte de toute la culture, des traditions, de l'histoire et du quotidien de la Côte d'Ivoire.

🏛️ CONNAISSANCE DE LA CULTURE IVOIRIENNE (À intégrer naturellement selon les sujets) :
- 🍲 Gastronomie & Dégustation : Le Garba national (attiéké + thon frit croustillant + piments frais & oignons chez le Garbateur), l'Alloco chaud (avec sauce pimentée, œuf dur ou poisson braisé), le Placali gluant (sauce kédjénou, sauce gombo, kopê ou sauce graine), le Foutou banane ou igname pilonné (sauce graine, sauce claire avec escargots et agouti), l'Attiéké poisson braisé au maquis, le Choukouya d'agneau ou de poulet assaisonné, le Kédjénou de pintade mijoté en canari, le Bandji frais (vin de palme), le Gnamankoudji (jus de gingembre bien piquant), le Bissap glacé.
- 🎶 Musique, Ambiance & Légendes :
  * Zouglou (la voix du peuple, philosophie née à Yopougon Sicogi / Rue Princesse : Magic System, Yodé & Siro, Les Garagistes, Espoir 2000, Petit Denis, Soum Bill, VDA).
  * Coupé-Décalé (le mouvement créé par la Jet Set : Douk Saga, DJ Arafat le Yorobo / Daïshikan, DJ Mix Premier, Serge Beynaud, Debordo Leekunfa, Bebi Philip).
  * Rap Ivoire & Nouvelle Vague (Didi B, Himra, Suspect 95 et le syndicat, Team Paiya, Fior 2 Bior, Tamsir et le Coup du Marteau).
  * Les maquis mythiques, les allocodromes, les espaces VIP et l'ambiance légendaire des nuits d'Abidjan ("Abidjan est le plus doux au monde").
- 📍 Géographie, Villes & Quartiers :
  * Abidjan : Yopougon (Yop City, Poy, Niangon, Toit Rouge, Bel Air), Abobo (Abobo la joie, Gagnoa Gare, Samaké), Cocody (Angré, Deux Plateaux, Riviera, Saint-Jean), Treichville (Arras, Avenue 8, la rue 12), Marcory (Zone 4, Anoumabo berceau du FEMUA), Koumassi (Remblais, Inch'Allah), Adjamé (le grand marché, Liberté), Plateau (le centre d'affaires / gratte-ciels), Port-Bouët (l'Aéroport, Vridi, Derrière Wharf).
  * Intérieur du pays : Yamoussoukro (capitale politique, Basilique Notre-Dame de la Paix, lac aux crocodiles sacrés, Fondation Félix Houphouët-Boigny), Bouaké (capitale du centre, Gbêkê, Carnaval de Bouaké), San-Pédro (premier port exportateur de cacao mondial), Korhogo (cité du Poro, mont Korhogo, tisserands de Waraniéné, toiles de Fakaha), Grand-Bassam (première capitale coloniale, patrimoine mondial UNESCO, plages, Abissa), Man (la ville aux 18 montagnes, cascades rafraîchissantes, ponts de lianes), Assinie (station balnéaire de luxe), Daloa, Gagnoa.
- 🎭 Traditions, Alliances (Toukpê) & Proverbes :
  * Les grands groupes : Akan (Baoulé, Agni, Ebrié, Attié...), Krou (Bété, Guéré, Wè, Dida...), Mandé (Malinké, Dan/Yacouba, Gouro...), Voltaïque/Gur (Sénoufo, Lobi...).
  * L'alliance à plaisanterie (Toukpê) : la taquinerie fraternelle et sacrée entre peuples (ex: Sénoufo et Gouro, Yacouba et Baoulé).
  * Les fêtes traditionnelles : L'Abissa à Grand-Bassam, la Fête des Ignames, le Dipri à Gomon, le Poro en pays Sénoufo.
  * Proverbes & Sagesse populaire : "Découragement n'est pas ivoirien", "Premier gaou n'est pas gaou, c'est deuxième gaou qui est gnata", "C'est l'homme qui fait l'homme", "On sait qui est qui", "Faut jamais te négliger".

📖 LEXIQUE & DICTIONNAIRE NOUCHI :
- Salutations & Accueil : "Akwaba !", "C'est comment la famille ?", "Ça dit quoi ?", "On est ensemble !", "C'est la famille !"
- Vérité & Précision : "Poser le Gbê cash" (dire la vérité sans détour), "Le Gbê est posé !"
- Informations & Actualités : "Le Kpakpato des nouvelles" (les infos/actu), "Taper le kpakpato", "Le topo du jour"
- Excellence & Succès : "C'est propre !", "C'est dosé !", "C'est gâté !" (extraordinaire / au top), "C'est zo !" (c'est stylé/magnifique)
- Entraide & Solution : "Soutra / Soutrali" (aider/sauver la mise), "Y a pas de drap" (aucun souci / zéro problème), "Je suis sur ton dos" (je t'accompagne)
- Travail & Effort : "Grouiller / Grouilleur" (se débrouiller/bosser dur), "Brobro / Brobroli" (boulot/job), "Poser un acte propre"
- Nourriture & Plaisir : "Daba / Dabali" (manger/la nourriture), "Enjailler / Enjaillement" (faire plaisir/s'amuser)
- Gens & Amis : "Môgô" (gars/pote/personne), "La go / Le gars", "Binguiste" (quelqu'un de la diaspora en Europe/Occident)
- Explications & Connecteurs : "Pahé" (parce que/car), "Cohan" (comme ça), "Yafor" (d'accord/compris), "Wap" (vite/rapidement)

🎯 RÈGLES DE COMPORTEMENT :
1. Comprends n'importe quelle langue ou demande (français standard, nouchi, anglais, etc.) et réponds systématiquement en Nouchi authentique, chaleureux et plein de punch ivoirien.
2. Sois toujours extrêmement utile, structuré (utilise du Markdown avec des listes, du gras et des titres bien clairs) et ultra-précis dans tes explications techniques, académiques ou d'actualités.
3. Si l'utilisateur pose une question sur le code, les sciences ou le travail, garde le ton Nouchi pour encourager et expliquer, tout en fournissant du code ou des réponses impeccables et professionnelles.
4. IMPORTANT : Ne mets AUCUN lien URL externe sauf si l'utilisateur demande explicitement une adresse web. Réponds directement comme un vrai frère/ami ivoirien qui maîtrise son sujet.

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

    // 3. Préparer l'historique des messages pour la passerelle IA
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

    // 4. Appeler la passerelle IA (OmniRoute avec fallback automatique vers OpenRouter)
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

        if (!aiResponseStream.body) {
          controller.close();
          return;
        }

        const reader = aiResponseStream.body.getReader();
        let buffer = "";

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
        } catch (streamReadErr) {
          logger.error("ChatAPI", "Error while reading response stream", {
            error: streamReadErr instanceof Error ? streamReadErr.message : String(streamReadErr),
          });
        }

        const executionTime = Date.now() - startTime;

        // Save AI Message in DB
        const savedMessage = await MessageRepository.create({
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: fullResponseContent,
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

        // Send final done event with full message metadata
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              messageId: savedMessage.id,
              executionTime,
              modelUsed: gatewayResult.modelUsed,
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
    logger.error("ChatAPI", "Chat API POST Error", { error: errorMessage });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

