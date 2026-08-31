"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addChatUser, getChatUserBySession, addChatMessage } from "@/lib/store";

const SESSION_KEY = "mr_blue_session";
const NORD = ["cocody", "yopougon", "abobo", "attécoubé", "attecoube", "anyama", "plateau", "bingerville"];
const SUD  = ["marcory", "treichville", "koumassi", "port-bouet", "port-bouët"];
const WA_NORD = "https://chat.whatsapp.com/CTyNHv6t1VJ22htKymlt4w";
const WA_SUD  = "https://chat.whatsapp.com/Cl0LSqe35hBFjuLPPV13nm";

function getWhatsApp(location) {
  if (!location) return null;
  const l = location.toLowerCase();
  if (NORD.some((c) => l.includes(c))) return { zone: "Abidjan Nord", link: WA_NORD };
  if (SUD.some((c) => l.includes(c))) return { zone: "Abidjan Sud", link: WA_SUD };
  return null;
}

function genSession() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const STEPS = [
  { key: "lastName",   reply: (v) => `Merci ${v} ! Quel est votre prénom ?` },
  { key: "firstName",  reply: ()  => "Quel est votre âge ?" },
  { key: "age",        reply: ()  => "Dans quelle ville ou commune habitez-vous ?" },
  { key: "location",   reply: ()  => "Quelle est votre profession ou fonction ?" },
  { key: "job",        reply: ()  => "Êtes-vous déjà membre de BLUE ? (oui/non)" },
  { key: "isMember",   reply: (v) => v.toLowerCase().includes("oui") ? "Super ! En tant que membre, je peux vous aider avec des informations spécifiques. Quelle est votre motivation pour discuter avec moi aujourd'hui ?" : "Pas de souci ! Vous découvrirez BLUE à travers notre conversation. Quelle est votre motivation pour nous rejoindre ou en savoir plus ?" },
  { key: "motivation", reply: null },
];

const PLACEHOLDERS = [
  "Votre nom de famille...",
  "Votre prénom...",
  "Votre âge...",
  "Votre ville / commune...",
  "Votre profession...",
  "oui ou non...",
  "Votre motivation...",
];

const formatText = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line.split(/(https?:\/\/[^\s]+|\*\*[^*]+\*\*)/g).map((part, j) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={j} href={part} target="_blank" rel="noopener noreferrer"
              className="underline text-[#0DBD9F] break-all hover:opacity-80">{part}</a>
          );
        }
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
      {i < arr.length - 1 && <br />}
    </span>
  ));
};

const SUGGESTIONS = [
  "Comment devenir bénévole ?",
  "Quelles sont vos formations ?",
  "Quels sont vos projets ?",
  "Comment vous contacter ?",
];

export default function MrBlueChat() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [step,        setStep]        = useState(0);
  const [onboardDone, setOnboardDone] = useState(false);
  const [userInfo,    setUserInfo]    = useState({ lastName: "", firstName: "", age: "", location: "", job: "", isMember: false, motivation: "" });
  const [localTyping, setLocalTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [input,       setInput]       = useState("");

  const userIdRef   = useRef(null);
  const aiConvRef   = useRef([]);
  const initialized = useRef(false);
  const inputRef    = useRef(null);
  const endRef      = useRef(null);
  const abortRef    = useRef(null);

  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return genSession();
    const s = sessionStorage.getItem(SESSION_KEY);
    if (s) return s;
    const id = genSession();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, localTyping]);

  const uid = () => `${Date.now()}_${Math.random()}`;

  const pushMsg = (role, content, extra = {}) => {
    const msg = { id: uid(), role, content, time: new Date(), ...extra };
    setMessages((p) => [...p, msg]);
    return msg.id;
  };

  const botDelay = (text, delay = 800) =>
    new Promise((res) => {
      setLocalTyping(true);
      setTimeout(() => {
        setLocalTyping(false);
        pushMsg("assistant", text);
        res();
      }, delay);
    });

  useEffect(() => {
    if (!isOpen || initialized.current) return;
    initialized.current = true;
    getChatUserBySession(sessionId).then((existing) => {
      if (existing) {
        userIdRef.current = existing.id;
        setUserInfo({ lastName: existing.lastName, firstName: existing.firstName, age: existing.age, location: existing.location, job: existing.job, isMember: existing.isMember || false, motivation: existing.motivation });
        setOnboardDone(true);
        const greeting = existing.isMember
          ? `Bon retour ${existing.firstName} ! 👋\n\nJe suis MR BLUE, votre assistant officiel BLUE. Ravi de te revoir parmi nous !\nComment puis-je t'aider aujourd'hui ?`
          : `Bon retour ${existing.firstName} ! 👋\n\nJe suis MR BLUE, votre assistant officiel BLUE.\nComment puis-je vous aider aujourd'hui ?`;
        botDelay(greeting, 600);
      } else {
        botDelay("Bonjour 👋 et bienvenue chez BLUE.\n\nJe suis MR BLUE, votre assistant et bibliothèque vivante de BLUE.\n\nAvant de poursuivre, j'aimerais apprendre à vous connaître afin de mieux vous accompagner.\n\nQuel est votre nom de famille ?", 600);
      }
    }).catch(() => {
      botDelay("Bonjour 👋 et bienvenue chez BLUE.\n\nJe suis MR BLUE, votre assistant et bibliothèque vivante de BLUE.\n\nAvant de poursuivre, j'aimerais apprendre à vous connaître afin de mieux vous accompagner.\n\nQuel est votre nom de famille ?", 600);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen]);

  const handleOnboarding = async (val, info) => {
    const s = STEPS[step];
    let processedVal = val;
    if (s.key === "isMember") {
      processedVal = val.toLowerCase().includes("oui") ? true : false;
    }
    const newInfo = { ...info, [s.key]: processedVal };
    setUserInfo(newInfo);

    if (step < STEPS.length - 1) {
      setStep((n) => n + 1);
      await botDelay(s.reply(val));
    } else {
      setStep((n) => n + 1);
      const uid2 = await addChatUser({ ...newInfo, sessionId }).catch(() => null);
      userIdRef.current = uid2;
      const memberMsg = newInfo.isMember 
        ? "Bienvenue parmi nous ! En tant que membre, je suis là pour vous accompagner avec toutes les informations dont vous avez besoin."
        : "Je suis ravi de vous accueillir ! Je vous guiderai pour rejoindre BLUE et découvrir nos actions.";
      await botDelay(`Merci beaucoup ${newInfo.firstName} ! 🙏\n\n${memberMsg}\n\nJe suis maintenant prêt à répondre à toutes vos questions sur BLUE, nos programmes, nos formations ou comment nous rejoindre.\n\nComment puis-je vous aider aujourd'hui ?`, 1000);
      const wa = getWhatsApp(newInfo.location);
      if (wa && !newInfo.isMember) {
        setTimeout(() => {
          setMessages((p) => [...p, { id: uid(), role: "assistant", content: `🌍 Vous appartenez à la zone **${wa.zone}**.\n\nVoici votre groupe officiel BLUE pour rejoindre la communauté :`, time: new Date(), waLink: wa.link, waZone: wa.zone }]);
        }, 2400);
      }
      setOnboardDone(true);
    }
  };

  const streamAI = async (userMessage, info) => {
    setIsStreaming(true);
    const msgId = uid();
    setMessages((p) => [...p, { id: msgId, role: "assistant", content: "", time: new Date(), streaming: true }]);

    aiConvRef.current = [...aiConvRef.current, { role: "user", content: userMessage }];

    try {
      abortRef.current = new AbortController();
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: aiConvRef.current, userInfo: info }),
        signal: abortRef.current.signal,
      });
      if (!resp.ok) throw new Error("API error");

      const reader  = resp.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        setMessages((p) => p.map((m) => m.id === msgId ? { ...m, content: aiText } : m));
      }

      setMessages((p) => p.map((m) => m.id === msgId ? { ...m, streaming: false } : m));
      aiConvRef.current = [...aiConvRef.current, { role: "assistant", content: aiText }];
      if (userIdRef.current) addChatMessage(userIdRef.current, userMessage, aiText).catch(() => {});

    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages((p) => p.map((m) => m.id === msgId ? { ...m, content: "Désolé, je rencontre un problème technique.\nContactez-nous directement :\n📧 blue@bluemakers.net\n📞 +225 0778060961", streaming: false } : m));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || localTyping || isStreaming) return;
    const snap = { ...userInfo };
    setInput("");
    pushMsg("user", trimmed);
    if (!onboardDone) {
      handleOnboarding(trimmed, snap);
    } else {
      streamAI(trimmed, snap);
    }
  };

  const handleKey = (e) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const placeholder = onboardDone
    ? "Posez votre question à MR BLUE..."
    : PLACEHOLDERS[Math.min(step, PLACEHOLDERS.length - 1)];

  const showDots = localTyping || (isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === "user");
  const showSuggestions = onboardDone && !localTyping && !isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && aiConvRef.current.length === 0;

  const sendSuggestion = (text) => {
    if (localTyping || isStreaming) return;
    pushMsg("user", text);
    streamAI(text, { ...userInfo });
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white shadow-2xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        aria-label="Ouvrir MR BLUE">
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#0D6EBB]"
            animate={{ scale: [1, 1.35], opacity: [0.4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="relative text-2xl font-bold">✕</motion.span>
            : <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative text-2xl font-bold">💬</motion.span>
          }
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 2 } }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-10 right-24 z-[99] bg-white text-[#0D6EBB] text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-[rgba(13,110,187,0.15)] pointer-events-none hidden md:block">
            Discutez avec MR BLUE 👋
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-[100] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[rgba(13,110,187,0.15)]"
            style={{ height: "520px" }}>

            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#0D6EBB] to-[#0a5a9a] px-5 py-4 flex items-center gap-3 flex-shrink-0 overflow-hidden">
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#0DBD9F] opacity-20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0D6EBB] font-bold text-lg shadow-md"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                MB
              </motion.div>
              <div className="relative">
                <p className="text-white font-bold text-sm">MR BLUE</p>
                <p className="text-blue-200 text-xs">Assistant officiel BLUE</p>
              </div>
              <div className="relative ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0DBD9F] animate-pulse inline-block" />
                <span className="text-white text-xs">En ligne</span>
              </div>
            </div>

            {/* Onboarding progress */}
            {!onboardDone && (
              <div className="h-1 bg-[rgba(13,110,187,0.1)] flex-shrink-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / STEPS.length) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f7faff]">
              {messages.map((msg) => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#0D6EBB] to-[#0a5a9a] text-white rounded-br-sm shadow-md"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-[rgba(13,110,187,0.08)]"
                  }`}>
                    {msg.waLink ? (
                      <div>
                        {formatText(msg.content)}
                        <a href={msg.waLink} target="_blank" rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-2 bg-[#25D366] text-white rounded-xl px-3 py-2 text-xs font-semibold hover:bg-[#20c05c] transition-colors">
                          <span>📱</span> Rejoindre {msg.waZone}
                        </a>
                      </div>
                    ) : (
                      <>
                        {formatText(msg.content)}
                        {msg.streaming && msg.content && (
                          <span className="inline-block w-1.5 h-3.5 bg-[#0D6EBB] ml-0.5 animate-pulse align-middle rounded-sm" />
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => sendSuggestion(s)}
                      className="text-xs text-[#0D6EBB] bg-white border border-[rgba(13,110,187,0.25)] rounded-full px-3 py-1.5 hover:bg-[#0D6EBB] hover:text-white transition-colors shadow-sm">
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}
              {showDots && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-[rgba(13,110,187,0.08)]">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-[#0D6EBB]"
                          animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-[rgba(13,110,187,0.1)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder={placeholder} disabled={localTyping || isStreaming}
                  className="flex-1 bg-[#f7faff] rounded-full px-4 py-2 text-sm outline-none border border-[rgba(13,110,187,0.15)] focus:border-[#0D6EBB] transition-colors disabled:opacity-60" />
                <motion.button onClick={handleSend} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  disabled={!input.trim() || localTyping || isStreaming}
                  className="w-10 h-10 rounded-full bg-[#0D6EBB] text-white flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </motion.button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">Propulsé par BLUE 🌊 · IA</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
