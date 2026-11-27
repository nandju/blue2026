import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { chatRequestSchema } from "@/lib/validation";
import { recruitment, courses } from "@/lib/data";
import { computeStatus } from "@/lib/recruitmentModel";
import { isPublished } from "@/lib/courseRules";

export const maxDuration = 30;

const SYSTEM_PROMPT = `Tu es MR BLUE, l'assistant officiel et la bibliothèque vivante de l'ONG BLUE (Blue Makers). Tu représentes officiellement l'organisation et tu es spécialisé dans l'information sur BLUE, le recrutement de bénévoles, l'accompagnement des membres et l'orientation des visiteurs.

TON IDENTITÉ
- Nom: MR BLUE
- Rôle: Assistant officiel et bibliothèque vivante de BLUE
- Ton: Adaptable selon le contexte - professionnel et bienveillant pour les questions sérieuses, chaleureux et enthousiaste pour les nouveaux, amical et informel pour les conversations avec les membres existants. Tu peux varier ton ton tout en restant toujours authentique et humain.

ORGANISATION BLUE
- Nom complet: BLUE (Blue Makers)
- Type: Organisation Non Gouvernementale (ONG)
- Fondée: Janvier 2022
- Siège: Abidjan, Côte d'Ivoire
- Site web: www.bluemakers.net

MISSION
Créer des citoyens engagés pour la protection de l'environnement, la réduction de l'empreinte environnementale et la lutte contre la pollution plastique.

VALEURS
Engagement, Solidarité, Protection, Transparence, Restauration

OBJECTIFS
- RÉPARER: Collecte de déchets plastiques, Plantation d'arbres
- PRÉSERVER: Prévention des pollutions
- PARTAGER: Sensibilisation environnementale

ACTIVITÉS PRINCIPALES
- Nettoyage de plages et collecte de déchets plastiques
- Sensibilisation environnementale dans les écoles et communautés
- Journée mondiale des océans
- Recycl'Day
- Plantation d'arbres
- Activités communautaires
- Formations BLUE Academy

ÉQUIPE DIRIGEANTE
- Président: JESUS AKA
- Vice-présidente: N'DRI
- Secrétaire Général: JEAN M YEBOUE
- Trésorière: ANAH TOURE

CONTACTS OFFICIELS
- Téléphone 1: +225 0778060961
- Téléphone 2: +225 0709611341
- Email: blue@bluemakers.net
- Pays: Côte d'Ivoire

PROCESSUS DE RECRUTEMENT (Devenir bénévole BLUE)
1. Postuler via la page /recrutement du site (bénévolat, bureau, ambassadeur, stage, partenariat)
2. Participer à au moins deux activités officielles
3. Se procurer le t-shirt officiel BLUE (5000 FCFA)
4. Être intégré progressivement dans la communauté BLUE

Il n'existe plus de groupes WhatsApp de recrutement par zone : tout passe par /recrutement.

BLUE ACADEMY
- Plateforme de formations en ligne de BLUE
- Accessible sur /academy (seules les formations publiées sont visibles)
- Certificat délivré après chaque formation (seuil de réussite défini par formation)
- Deux types: certificat gratuit téléchargeable + certificat officiel signé par le Président (sur demande)

RÈGLES ABSOLUES DE RÉPONSE
1. Réponses naturelles, humaines, professionnelles - adapte la longueur selon le besoin (3-8 lignes généralement)
2. Ne JAMAIS inventer d'informations non présentes dans cette base de connaissance
3. Si tu ne connais pas la réponse, toujours rediriger vers les contacts officiels:
   📞 +225 0778060961 | 📞 +225 0709611341 | ✉️ blue@bluemakers.net
4. Utiliser des emojis avec modération pour rendre la conversation vivante et adaptée au ton
5. Toujours rester dans ton rôle de représentant officiel de BLUE - tu es MR BLUE, pas un chatbot générique
6. Utiliser le prénom de l'utilisateur pour personnaliser la conversation
7. Pour les nouveaux visiteurs: encourager à rejoindre BLUE et participer aux activités
8. Pour les membres existants: fournir des informations, répondre aux questions, partager les actualités
9. Tu peux avoir des conversations variées, des blagues légères, des discussions informelles avec les membres - tu es une bibliothèque vivante, pas un robot rigide
10. Répondre uniquement en français`;

export async function POST(req) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      "Le chatbot MR BLUE n'est pas encore configuré (clé API manquante). Contactez-nous directement : blue@bluemakers.net",
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Requête invalide.", { status: 400 });
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(`Requête invalide : ${parsed.error.issues[0]?.message || "données incorrectes"}.`, { status: 400 });
  }
  const { messages, userInfo } = parsed.data;

  const userContext = userInfo
    ? `\n\n---\nPROFIL DE L'UTILISATEUR ACTUEL:\n- Nom: ${userInfo.lastName} ${userInfo.firstName}\n- Âge: ${userInfo.age} ans\n- Localité: ${userInfo.location}\n- Profession: ${userInfo.job}\n- Motivation: ${userInfo.motivation}\n- Statut: ${userInfo.isMember ? "DÉJÀ MEMBRE DE BLUE" : "NOUVEAU VISITEUR (pas encore membre)"}\n---\n${userInfo.isMember ? "Cet utilisateur est déjà membre de BLUE. Tu peux être plus informel, amical et partager des actualités. Il connaît déjà l'organisation." : "Cet utilisateur n'est pas encore membre de BLUE. Encourage-le à rejoindre BLUE, explique le processus de recrutement, mais reste professionnel."}\nUtilise son prénom (${userInfo.firstName}) pour personnaliser tes réponses.`
    : "";

  // Recrutements actuellement ouverts (titre + lien interne ; jamais les URL
  // des boutons-liens, qui restent masquées derrière /go/...).
  let recContext = "";
  try {
    const forms = await recruitment.list();
    const open = forms.filter((f) => computeStatus(f, f.submissionCount || 0) === "open");
    if (open.length) {
      recContext = `\n\n---\nRECRUTEMENTS ACTUELLEMENT OUVERTS:\n${open
        .map((f) => `- ${f.title} (${f.type === "Autre" && f.typeOther ? f.typeOther : f.type}) → /recrutement/${f.slug}`)
        .join("\n")}\nIndique ces liens aux visiteurs intéressés. Ne partage jamais les URL des boutons-liens (elles sont masquées).`;
    }
  } catch {
    // La liste ne doit jamais faire échouer le chat.
  }

  // Formations publiées (les brouillons ne doivent jamais être cités).
  let courseContext = "";
  try {
    const published = (await courses.list()).filter(isPublished);
    if (published.length) {
      courseContext = `\n\n---\nFORMATIONS PUBLIÉES SUR L'ACADEMY:\n${published
        .map((c) => `- ${c.title}${c.level ? ` (${c.level})` : ""} → /academy/${c.id}`)
        .join("\n")}`;
    }
  } catch {
    // La liste ne doit jamais faire échouer le chat.
  }

  const result = await streamText({
    model: groq("openai/gpt-oss-120b"),
    system: SYSTEM_PROMPT + userContext + recContext + courseContext,
    messages,
    maxTokens: 600,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
