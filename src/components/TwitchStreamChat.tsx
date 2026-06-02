import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Crown, Zap, Heart, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RSVP } from '../types';

interface TwitchStreamChatProps {
  rsvps: RSVP[];
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  badge: 'mods' | 'sub' | 'vip' | 'regular';
  badgeMonths?: number;
  color: string;
  isRsvp?: boolean;
  attending?: boolean;
}

const CONSTANT_USERNAMES = [
  { name: 'KunFan_9320', color: '#ff4646', badge: 'sub', months: 38 },
  { name: 'GamerX_Arg', color: '#00f0ff', badge: 'regular' },
  { name: 'SpreenFan', color: '#ffb300', badge: 'vip' },
  { name: 'Biza_Music', color: '#9146ff', badge: 'vip' },
  { name: 'La_Scaloneta', color: '#00ff66', badge: 'sub', months: 18 },
  { name: 'Independiente_Rey', color: '#ef4444', badge: 'mods' },
  { name: 'Citizen_Manc', color: '#38bdf8', badge: 'regular' },
  { name: 'TwitchMod01', color: '#a855f7', badge: 'mods' }
];

const PREDEF_CHAT_TEXTS = [
  'Feliz Cumple Kuni!! 🎂',
  '¡BUENO VAMO A JUGÁ! 🎮',
  '¿Sale torneo de Valorant con el chat hoy?',
  'GG nivel 38 desbloqueado 🏆',
  'Espectacular cheeee',
  '¿Y Messi? ¿Va Leo?',
  '¡Qué grande el Kun, mi ídolo absoluto!',
  'No puedo creer que ya pasaron tantos años del 93:20 😱',
  'El rey del streaming es argentino, de una 🐐',
  '¿Ibai va a comer hamburguesas de más? Jajaja',
  'Se viene terrible festichola paaaa',
  'Al ángulo Kun! Te amamos ⚽',
  '¡El mejor streamer hispano de la historia!! 🥰',
  '¿Sale asado u otra cosa che? 🥩'
];

export default function TwitchStreamChat({ rsvps }: TwitchStreamChatProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [viewersCount, setViewersCount] = useState(38421);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Generate background chat stream
  useEffect(() => {
    // Seed initial messages
    const initialList: ChatMessage[] = Array.from({ length: 8 }).map((_, i) => {
      const user = CONSTANT_USERNAMES[i % CONSTANT_USERNAMES.length];
      return {
        id: `seed-${i}-${Date.now()}`,
        username: user.name,
        message: PREDEF_CHAT_TEXTS[Math.floor(Math.random() * PREDEF_CHAT_TEXTS.length)],
        badge: user.badge as any,
        badgeMonths: user.months,
        color: user.color
      };
    });
    setChatMessages(initialList);

    // Stream random chat messages every 3-5 seconds
    const interval = setInterval(() => {
      const randomUser = CONSTANT_USERNAMES[Math.floor(Math.random() * CONSTANT_USERNAMES.length)];
      const randomMsg = PREDEF_CHAT_TEXTS[Math.floor(Math.random() * PREDEF_CHAT_TEXTS.length)];
      
      const newMsg: ChatMessage = {
        id: `chat-${Date.now()}-${Math.random()}`,
        username: randomUser.name,
        message: randomMsg,
        badge: randomUser.badge as any,
        badgeMonths: randomUser.months,
        color: randomUser.color
      };

      setChatMessages((prev) => {
        const updated = [...prev, newMsg];
        if (updated.length > 35) updated.shift(); // keep standard memory size
        return updated;
      });

      // Fluctuate viewers slightly
      setViewersCount((prev) => prev + Math.floor(Math.random() * 21) - 10);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Listen to new RSVPs and inject them into stream chat with VIP styling
  useEffect(() => {
    if (rsvps.length === 0) return;
    const latestRsvp = rsvps[0];
    
    // Check if we already have this rsvp ID in the chat rendering
    const exists = chatMessages.some(msg => msg.id === latestRsvp.id);
    if (exists) return;

    const rsvpChatMessage: ChatMessage = {
      id: latestRsvp.id,
      username: latestRsvp.name,
      message: latestRsvp.attending 
        ? `🔥 CONFIRMÓ: "${latestRsvp.customMessage || '¡Ahí nos vemos, pa!'}" (Menú: ${latestRsvp.foodChoice.toUpperCase()})` 
        : `😢 NO PUEDE ASISTIR: "${latestRsvp.customMessage || 'Me la pierdo che...'}"`,
      badge: 'vip',
      color: '#00f0ff',
      isRsvp: true,
      attending: latestRsvp.attending
    };

    setChatMessages((prev) => {
      const updated = [...prev, rsvpChatMessage];
      if (updated.length > 35) updated.shift();
      return updated;
    });

    // Bump viewer count on RSVP confirmation
    setViewersCount(prev => prev + 1);

  }, [rsvps]);

  // Scroll stream chat to bottom on updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="w-full flex flex-col bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl aspect-[3/4] md:aspect-auto md:h-[460px]">
      
      {/* Header Twitch-looking style */}
      <div className="flex justify-between items-center bg-neutral-900 px-4 py-3.5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full absolute" />
          <h4 className="font-sans font-black text-xs text-white tracking-widest flex items-center gap-1.5 uppercase italic">
            <MessageSquare className="w-3.5 h-3.5 text-gaming-purple" />
            CHAT #SLAKUN10
          </h4>
        </div>

        <div className="flex items-center gap-1 text-black font-sans text-[10px] font-black bg-emerald-400 py-1 px-3 rounded-none transform -skew-x-12 select-none">
          <Users className="w-3 h-3 text-black" />
          <span className="text-black font-black">{viewersCount.toLocaleString()}</span>
          <span>LIVE</span>
        </div>
      </div>

      {/* Chat scroll content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 custom-scrollbar bg-neutral-950/95"
      >
        <div className="text-[10px] text-neutral-500 text-center border-b border-neutral-900 pb-2 mb-1 uppercase font-mono tracking-wider font-bold">
          BIENVENIDO AL STREAM CHAT DEL CUMPLE. RESPETÁ AL KUN AI.
        </div>

        <AnimatePresence initial={false}>
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-xs leading-relaxed rounded-lg p-1.5 transition-colors ${
                msg.isRsvp 
                  ? msg.attending 
                    ? 'bg-emerald-950/30 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                    : 'bg-rose-950/30 border border-rose-500/20'
                  : 'hover:bg-neutral-900/40'
              }`}
            >
              <div className="flex items-start gap-1.5 flex-wrap">
                
                {/* Badges system */}
                <div className="flex gap-1 mt-0.5 shrink-0 select-none">
                  {msg.badge === 'mods' && (
                    <div className="w-4 h-4 bg-emerald-500 text-white rounded flex items-center justify-center text-[8px] font-black" title="Moderador">
                      <Zap className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {msg.badge === 'vip' && (
                    <div className="w-4 h-4 bg-gaming-blue text-black rounded flex items-center justify-center text-[8px] font-extrabold" title="Invitado VIP">
                      <Crown className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {msg.badge === 'sub' && (
                    <div className="w-4 h-4 bg-gaming-purple text-white rounded flex items-center justify-center text-[7px] font-bold px-0.5" title={`Subscriptor por ${msg.badgeMonths} meses`}>
                      <Award className="w-2.5 h-2.5" />
                      <span className="text-[6px] ml-0.5">{msg.badgeMonths}</span>
                    </div>
                  )}
                  {msg.isRsvp && (
                    <div className="w-4 h-4 bg-yellow-500 text-black rounded flex items-center justify-center text-[7px] font-black px-1" title="CONFIRMACIÓN RSVP">
                      INVIC
                    </div>
                  )}
                </div>

                {/* Username */}
                <span 
                  className="font-mono font-bold hover:underline cursor-pointer tracking-wide"
                  style={{ color: msg.color }}
                >
                  {msg.username}
                </span>

                <span className="text-neutral-400">:</span>

                {/* Message body */}
                <span className={`break-words tracking-tight ${msg.isRsvp ? 'text-white font-medium' : 'text-neutral-300'}`}>
                  {msg.message}
                </span>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input layout bar - looking realistic */}
      <div className="bg-neutral-900 border-t border-neutral-800 p-3 flex gap-2">
        <div className="flex-1 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800 text-neutral-500 text-[11px] font-mono flex justify-between items-center select-none">
          <span>Escribe en el chat enviando tu RSVP...</span>
          <div className="flex gap-1.5 text-neutral-600">
            <Heart className="w-3.5 h-3.5 hover:text-rose-500 cursor-pointer" />
            <span className="text-[10px]">Bits: 100</span>
          </div>
        </div>
        <button 
          id="btn_twitch_chat_submit"
          className="bg-gaming-purple hover:bg-violet-600 text-white font-sans font-black uppercase text-xs px-4 py-2 rounded-none transform -skew-x-12 transition-all cursor-not-allowed opacity-40"
          disabled
        >
          Chat
        </button>
      </div>

    </div>
  );
}
