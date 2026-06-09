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
  { key: "job",        reply: ()  => "Quelle est votre motivation pour rejoindre BLUE ou en savoir plus sur nous ?" },
  { key: "motivation", reply: null },
];

const PLACEHOLDERS = [
  "Votre nom de famille...",
  "Votre prénom...",
  "Votre âge...",
  "Votre ville / commune...",
  "Votre profession...",
  "Votre motivation...",
];

const formatText = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line.split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
        /^https?:\/\//.test(part) ? (
          <a key={j} href={part} target="_blank" rel="noopener noreferrer"
            className="underline text-[#0DBD9F] break-all hover:opacity-80">{part}</a>
        ) : part
      )}
      {i < arr.length - 1 && <br />}
    </span>
  ));
};

export default function MrBlueChat() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [step,        setStep]        = useState(0);
  const [onboardDone, setOnboardDone] = useState(false);
  const [userInfo,    setUserInfo]    = useState({ lastName: "", firstName: "", age: "", location: "", job: "", motivation: "" });
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
    const existing = getChatUserBySession(sessionId);
    if (existing) {
      userIdRef.current = existing.id;
      setUserInfo({ lastName: existing.lastName, firstName: existing.firstName, age: existing.age, location: existing.location, job: existing.job, motivation: existing.motivation });
      setOnboardDone(true);
      botDelay(`Bon retour ${existing.firstName} ! 👋\n\nJe suis MR BLUE, votre assistant officiel BLUE.\nComment puis-je vous aider aujourd'hui ?`, 600);
    } else {
      botDelay("Bonjour 👋 et bienvenue chez BLUE.\n\nJe suis MR BLUE, votre assistant de recrutement et d'information.\n\nAvant de poursuivre, j'aimerais apprendre à vous connaître afin de mieux vous accompagner.\n\nQuel est votre nom de famille ?", 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen]);

  const handleOnboarding = async (val, info) => {
    const s = STEPS[step];
    const newInfo = { ...info, [s.key]: val };
    setUserInfo(newInfo);

    if (step < STEPS.length - 1) {
      setStep((n) => n + 1);
      await botDelay(s.reply(val));
    } else {
      setStep((n) => n + 1);
      const uid2 = addChatUser({ ...newInfo, sessionId });
      userIdRef.current = uid2;
      await botDelay(`Merci beaucoup ${newInfo.firstName} ! 🙏\n\nJe suis maintenant prêt à répondre à toutes vos questions sur BLUE, nos programmes, nos formations ou comment nous rejoindre.\n\nComment puis-je vous aider aujourd'hui ?`, 1000);
      const wa = getWhatsApp(newInfo.location);
      if (wa) {
        setTimeout(() => {
          setMessages((p) => [...p, { id: uid(), role: "assistant", content: `🌍 Vous appartenez à la zone **${wa.zone}**.\n\nVoici votre groupe officiel BLUE :`, time: new Date(), waLink: wa.link, waZone: wa.zone }]);
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
      if (userIdRef.current) addChatMessage(userIdRef.current, userMessage, aiText);

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

  return (
    <>
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-[#0D6EBB] text-white shadow-2xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        aria-label="Ouvrir MR BLUE">
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-2xl font-bold">✕</motion.span>
            : <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-2xl font-bold">💬</motion.span>
          }
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-[100] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[rgba(13,110,187,0.15)]"
            style={{ height: "520px" }}>

            {/* Header */}
            <div className="bg-[#0D6EBB] px-5 py-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0D6EBB] font-bold text-lg">MB</div>
              <div>
                <p className="text-white font-bold text-sm">MR BLUE</p>
                <p className="text-blue-200 text-xs">Assistant officiel BLUE</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0DBD9F] animate-pulse inline-block" />
                <span className="text-white text-xs">En ligne</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f7faff]">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0D6EBB] text-white rounded-br-sm"
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
              <p className="text-center text-[10px] text-gray-400 mt-2">Propulsé par BLUE 🌊 · IA Gemini</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
