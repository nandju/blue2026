"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveConversation } from "@/lib/store";

const SESSION_KEY = "mr_blue_session";

const STEPS = ["greeting", "lastName", "firstName", "age", "location", "job", "motivation", "chat"];

const KNOWLEDGE_BASE = [
  {
    keywords: ["bénévole", "rejoindre", "adhérer", "intégrer", "participer", "membre"],
    response: "Pour rejoindre BLUE comme bénévole, voici les étapes :\n1️⃣ Remplissez notre formulaire en ligne sur notre site\n2️⃣ Participez à une séance de présentation\n3️⃣ Suivez la formation d'ambassadeur\n4️⃣ Intégrez votre équipe locale\n\n📱 Rejoignez notre groupe WhatsApp : +225 07 78 06 09 61\n📧 Email : blue@bluemakers.net",
  },
  {
    keywords: ["programme", "projet", "initiative", "action", "activité"],
    response: "BLUE mène plusieurs programmes clés :\n🌊 Collectes de nettoyage côtières et urbaines\n🎓 Formation d'ambassadeurs environnementaux\n♻️ Sensibilisation au recyclage dans les écoles\n🤝 Partenariats avec les entreprises et institutions\n🌿 Reforestation et protection des écosystèmes\n\nDécouvrez nos projets sur /projects",
  },
  {
    keywords: ["whatsapp", "groupe", "chat", "message"],
    response: "📱 Rejoignez nos groupes WhatsApp officiels BLUE :\n• Groupe principal : +225 07 78 06 09 61\n• Groupe bénévoles : contactez-nous par email\n\nVous pouvez également nous contacter directement sur WhatsApp au +225 07 78 06 09 61",
  },
  {
    keywords: ["contact", "email", "téléphone", "appeler", "joindre"],
    response: "📬 Nos coordonnées officielles :\n📧 Email : blue@bluemakers.net\n📱 WhatsApp / Tél : +225 07 78 06 09 61\n📍 Adresse : Abidjan, Côte d'Ivoire\n\n⏰ Nous répondons généralement sous 24h ouvrables.",
  },
  {
    keywords: ["facebook", "instagram", "linkedin", "twitter", "social", "réseau"],
    response: "🌐 Retrouvez BLUE sur les réseaux sociaux :\n📘 Facebook : facebook.com/bluemakers\n📸 Instagram : @bluemakers\n💼 LinkedIn : linkedin.com/company/bluemakers\n\nSuivez-nous pour rester informé de nos actions et événements !",
  },
  {
    keywords: ["blue academy", "formation", "cours", "apprendre", "apprendre", "certification", "diplôme"],
    response: "🎓 Blue Academy est notre plateforme de formation en ligne !\n\nVous pouvez y suivre des formations sur :\n• La pollution plastique\n• La formation d'ambassadeur\n• Le recyclage et l'économie circulaire\n\n🏆 À la fin de chaque formation, un certificat vous est délivré.\n\nAccédez à Blue Academy via /academy",
  },
  {
    keywords: ["certificat", "diplôme", "attestation", "document"],
    response: "🏆 BLUE délivre deux types de certificats :\n1. Certificat gratuit de participation (téléchargeable)\n2. Certificat officiel signé par le Président de BLUE (sur demande)\n\nPour obtenir un certificat officiel, complétez une formation sur Blue Academy avec un score ≥ 80%, puis faites une demande depuis votre tableau de résultats.",
  },
  {
    keywords: ["don", "financement", "soutien", "sponsor", "partenaire"],
    response: "💙 Merci pour votre intérêt à soutenir BLUE !\n\nPour les partenariats et dons :\n📧 blue@bluemakers.net\n📱 +225 07 78 06 09 61\n\nVotre soutien nous aide à former plus d'ambassadeurs et à organiser davantage d'actions environnementales.",
  },
  {
    keywords: ["plastique", "pollution", "environnement", "océan", "déchet"],
    response: "🌊 La lutte contre la pollution plastique est au cœur de la mission de BLUE.\n\nChaque année, 8 millions de tonnes de plastique finissent dans nos océans. En Côte d'Ivoire, BLUE agit pour :\n♻️ Réduire les déchets plastiques\n🎓 Former des ambassadeurs\n🤝 Sensibiliser les communautés\n\nRejoignez notre mouvement !",
  },
  {
    keywords: ["blue", "qui", "organization", "ong", "histoire", "fondé"],
    response: "💙 BLUE est une ONG ivoirienne fondée en janvier 2022 à Abidjan.\n\nNotre mission : lutter contre la pollution plastique en formant des ambassadeurs environnementaux et en mobilisant les communautés.\n\n🎯 Nos objectifs :\n• Former 1000 ambassadeurs d'ici 2025\n• Collecter 10 tonnes de plastique par an\n• Sensibiliser 100 000 personnes\n\nApprenez-en plus sur /about",
  },
];

const FALLBACK =
  "Je ne suis pas certain de comprendre votre question 🤔. Pour une aide personnalisée, contactez-nous directement :\n📧 blue@bluemakers.net\n📱 +225 07 78 06 09 61\n📘 facebook.com/bluemakers";

function getResponse(message) {
  const lower = message.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => lower.includes(kw))) return item.response;
  }
  return FALLBACK;
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function MrBlueChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({ lastName: "", firstName: "", age: "", location: "", job: "", motivation: "" });
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return generateSessionId();
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return saved;
    const id = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const addBotMessage = (text, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { from: "bot", text, time: new Date() }]);
    }, delay);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "Bonjour ! Je suis MR BLUE 🌊, votre assistant officiel BLUE.\n\nJe suis là pour répondre à vos questions sur notre organisation, nos programmes et nos opportunités de bénévolat.\n\nPour personnaliser notre conversation, j'aurais besoin de quelques informations. Quel est votre nom de famille ?",
        600
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const persistConversation = (msgs, info) => {
    saveConversation({ sessionId, userInfo: info, messages: msgs });
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { from: "user", text: trimmed, time: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    const currentStep = STEPS[step];

    if (currentStep === "lastName") {
      const info = { ...userInfo, lastName: trimmed };
      setUserInfo(info);
      setStep((s) => s + 1);
      persistConversation(newMessages, info);
      addBotMessage(`Merci ${trimmed} ! Et votre prénom ?`);
    } else if (currentStep === "firstName") {
      const info = { ...userInfo, firstName: trimmed };
      setUserInfo(info);
      setStep((s) => s + 1);
      persistConversation(newMessages, info);
      addBotMessage("Quel est votre âge ?");
    } else if (currentStep === "age") {
      const info = { ...userInfo, age: trimmed };
      setUserInfo(info);
      setStep((s) => s + 1);
      persistConversation(newMessages, info);
      addBotMessage("Où êtes-vous situé(e) ? (Ville / Pays)");
    } else if (currentStep === "location") {
      const info = { ...userInfo, location: trimmed };
      setUserInfo(info);
      setStep((s) => s + 1);
      persistConversation(newMessages, info);
      addBotMessage("Quel est votre poste ou votre profession ?");
    } else if (currentStep === "job") {
      const info = { ...userInfo, job: trimmed };
      setUserInfo(info);
      setStep((s) => s + 1);
      persistConversation(newMessages, info);
      addBotMessage("Quelle est votre motivation pour rejoindre BLUE ou en savoir plus sur nous ?");
    } else if (currentStep === "motivation") {
      const info = { ...userInfo, motivation: trimmed };
      setUserInfo(info);
      setStep((s) => s + 1);
      persistConversation(newMessages, info);
      addBotMessage(
        `Merci beaucoup ${userInfo.firstName || trimmed} ! 🙏\n\nJe suis maintenant prêt à répondre à toutes vos questions sur BLUE, nos programmes, nos formations ou comment nous rejoindre.\n\nComment puis-je vous aider aujourd'hui ?`,
        1000
      );
    } else if (currentStep === "chat") {
      const response = getResponse(trimmed);
      persistConversation(newMessages, userInfo);
      addBotMessage(response, 1000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatText = (text) =>
    text.split("\n").map((line, i) => (
      <span key={i}>{line}{i < text.split("\n").length - 1 && <br />}</span>
    ));

  const getPlaceholder = () => {
    const s = STEPS[step];
    if (s === "lastName") return "Votre nom de famille...";
    if (s === "firstName") return "Votre prénom...";
    if (s === "age") return "Votre âge...";
    if (s === "location") return "Votre ville / pays...";
    if (s === "job") return "Votre poste / profession...";
    if (s === "motivation") return "Votre motivation...";
    return "Posez votre question...";
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-[#0D6EBB] text-white shadow-2xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ouvrir MR BLUE">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-2xl font-bold">✕</motion.span>
          ) : (
            <motion.span key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-2xl font-bold">💬</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-[100] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[rgba(13,110,187,0.15)]"
            style={{ height: "520px" }}>

            {/* Header */}
            <div className="bg-[#0D6EBB] px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0D6EBB] font-bold text-lg">MB</div>
              <div>
                <p className="text-white font-bold text-sm">MR BLUE</p>
                <p className="text-blue-200 text-xs">Assistant officiel BLUE</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0DBD9F] inline-block"></span>
                <span className="text-white text-xs">En ligne</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f7faff]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-[#0D6EBB] text-white rounded-br-sm"
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-[rgba(13,110,187,0.08)]"
                    }`}>
                    {formatText(msg.text)}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-[rgba(13,110,187,0.08)]">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-[#0D6EBB]"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-[rgba(13,110,187,0.1)]">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholder()}
                  className="flex-1 bg-[#f7faff] rounded-full px-4 py-2 text-sm outline-none border border-[rgba(13,110,187,0.15)] focus:border-[#0D6EBB] transition-colors"
                />
                <motion.button
                  onClick={handleSend}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-full bg-[#0D6EBB] text-white flex items-center justify-center disabled:opacity-40 transition-opacity">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </motion.button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">Propulsé par BLUE 🌊</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
