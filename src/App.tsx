import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Tv, 
  Instagram, 
  Twitter, 
  Globe, 
  CheckCircle, 
  Cpu, 
  Users, 
  Trophy,
  Compass
} from 'lucide-react';
import ThemeSelector from './components/ThemeSelector';
import InvitationCard from './components/InvitationCard';
import RSVPForm from './components/RSVPForm';
import TwitchStreamChat from './components/TwitchStreamChat';
import CakeBlaster from './components/CakeBlaster';
import { RSVP, EventTheme } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'intro' | 'invitation'>('intro');
  const [theme, setTheme] = useState<EventTheme>('gaming');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Fetch RSVPs on mount
  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        const response = await fetch('/api/rsvps');
        if (response.ok) {
          const data = await response.json();
          setRsvps(data);
        }
      } catch (err) {
        console.error('Error fetching RSVPs:', err);
      }
    };
    fetchRSVPs();
  }, []);

  const handleEnterEvent = () => {
    setActiveScreen('invitation');
    playIntroBeep();
  };

  const playIntroBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      // Vintage arcade game startup melody
      const notes = [130.81, 196.00, 261.63, 392.00, 523.25]; // C3, G3, C4, G4, C5
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }, idx * 80);
      });
    } catch {
      // Ignore audio failure
    }
  };

  const handleRsvpSuccess = (newRsvp: RSVP) => {
    // Add to the list on success
    setRsvps(prev => [newRsvp, ...prev]);
    
    if (newRsvp.attending) {
      triggerNotification(`¡Grande, ${newRsvp.name} confirmó asistencia! 🎉`);
    } else {
      triggerNotification(`Banca... ${newRsvp.name} metió re-conexion caída. 😢`);
    }
  };

  const triggerNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 4500);
  };

  // Blow candles callback
  const handleBlowSuccess = () => {
    triggerNotification('¡Velas sopladas con éxito! ¡GG en el chat pa! 🎂🎈');
  };

  // Setup theme-based background configurations
  const themeContainerStyles = {
    gaming: 'bg-[#08070F] text-white selection:bg-gaming-purple selection:text-white',
    independiente: 'bg-[#0F0707] text-white selection:bg-red-650 selection:text-white',
    mancity: 'bg-[#070C12] text-white selection:bg-sky-400 selection:text-black'
  };

  const themeGridOverlay = {
    gaming: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-neutral-950 to-neutral-950',
    independiente: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/25 via-neutral-950 to-neutral-950',
    mancity: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-955/20 via-neutral-950 to-neutral-950'
  };

  return (
    <div className={`min-h-screen font-sans ${themeContainerStyles[theme]} transition-all duration-700 relative`}>
      
      {/* Background Cyber grid overlay */}
      <div className={`absolute inset-0 z-0 pointer-events-none opacity-85 ${themeGridOverlay[theme]} transition-all duration-700`} />
      
      {/* Grid line matrix texture */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <AnimatePresence mode="wait">
        
        {/* SCREEN 1: THE RETRO GAMING STARTER LOADING PORTAL */}
        {activeScreen === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 min-h-screen py-10 px-4 flex flex-col justify-center items-center overflow-hidden crt-overlay bg-[#0a0a0a]"
          >
            {/* Ambient neon backdrop blur orbs */}
            <div className="absolute -left-20 -top-20 w-96 h-96 bg-red-700 rounded-full blur-[160px] opacity-45 pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-700 rounded-full blur-[160px] opacity-35 pointer-events-none" />
            
            {/* Giant watermark vector "10" backdrop */}
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden flex items-center justify-center">
              <h1 style={{ fontSize: 'min(75vw, 680px)', lineHeight: 0.7 }} className="font-black text-white italic tracking-tighter">10</h1>
            </div>

            {/* Geometric wireframe backgrounds from the theme */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col gap-12 z-0 opacity-20 pointer-events-none hidden xl:flex">
              <div className="w-24 h-24 border border-white rotate-45"></div>
              <div className="w-24 h-24 border-2 border-red-600 rounded-full"></div>
              <div className="w-12 h-32 bg-white/10 transform skew-y-12"></div>
            </div>
            <div className="absolute top-1/2 left-12 -translate-y-1/2 flex flex-col gap-12 z-0 opacity-20 pointer-events-none hidden xl:flex">
              <div className="text-8xl font-black italic">GG</div>
              <div className="text-8xl font-black text-red-650 italic">10</div>
            </div>

            {/* TV Frame Border Box / Bold Typography centered layout */}
            <div className="w-full max-w-2xl bg-neutral-950/85 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center relative text-center z-10 backdrop-blur-md">
              
              {/* LED Ring indicators / Custom Badge */}
              <div className="bg-red-600 text-black px-5 py-1 text-xs font-black italic transform -skew-x-12 mb-6 uppercase tracking-wider inline-block shadow-lg">
                Modo Cumple Activado
              </div>

              {/* Console Logo Cover illustration */}
              <div className="relative w-20 h-20 mb-6">
                <motion.div 
                  className="w-full h-full rounded-2xl bg-gradient-to-tr from-gaming-purple to-red-600 p-[1.5px] border border-white/15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-1.5 bg-neutral-950 rounded-xl border border-neutral-900 flex flex-col items-center justify-center p-1">
                  <Gamepad2 className="w-6 h-6 text-gaming-blue animate-bounce" />
                  <span className="font-mono text-[7px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">SLAKUN10</span>
                </div>
              </div>

              {/* Headings - Bold Typography Extreme Italic */}
              <h1 className="text-5xl sm:text-7xl font-sans font-black uppercase italic tracking-tighter leading-[0.85] mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-300">
                NIVEL 38<br/>DESBLOQUEADO
              </h1>
              
              {/* Subtle line */}
              <div className="w-24 h-0.5 bg-white/10 mb-6" />

              <p className="text-sm sm:text-base font-light text-white/80 max-w-md mb-8 font-sans leading-relaxed">
                "Del fútbol al streaming, una leyenda nunca se desconecta." <br />
                <span className="font-bold text-red-500 italic">GG, nos vemos en el cumple.</span>
              </p>

              {/* Dynamic launch button */}
              <button
                onClick={handleEnterEvent}
                id="btn_enter_landing"
                className="w-full sm:w-auto py-4 px-12 text-black font-display font-black text-xs uppercase tracking-[0.2em] rounded-xl bg-gradient-to-r from-red-600 via-amber-400 to-gaming-blue hover:opacity-90 active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.25)] flex items-center justify-center gap-2 cursor-pointer transform -skew-x-6"
              >
                <Tv className="w-4 h-4 shrink-0" />
                DALE PLAY (ENTRAR)
              </button>

              {/* Status details indicators */}
              <div className="mt-8 pt-4 w-full border-t border-white/10 flex justify-between items-center text-[10px] text-neutral-500 font-mono tracking-wider">
                <span>ESTADO: LIVE EN TWITCH</span>
                <span>FECHA: 02.06.2026</span>
              </div>

            </div>
          </motion.div>
        )}

        {/* SCREEN 2: MAIN COMPREHENSIVE INTERACTIVE INVITATION PORTAL */}
        {activeScreen === 'invitation' && (
          <motion.div 
            key="invitation"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 min-h-screen"
          >
            
            {/* INVITATION STYLIZED HEADER STREAM TITLE */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900/85 border border-neutral-800 p-5 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1.5 w-32 bg-gradient-to-r from-red-600 via-gaming-purple to-gaming-blue" />
              
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 border-2 border-white/20 flex flex-col justify-center items-center text-white shrink-0 shadow-lg">
                  <span className="font-display font-black text-xl tracking-tighter leading-none text-red-500">10</span>
                  <span className="text-[6px] font-mono leading-none tracking-widest uppercase">Argentina</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex gap-2 items-center">
                    <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse" />
                    <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-none uppercase">
                      FIESTA DEL KUN
                    </h1>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 mt-1 uppercase tracking-tight flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-gaming-purple" />
                    KUN GAMER + FÚTBOL • NIVEL 38 COMPLETADO
                  </span>
                </div>
              </div>

              {/* Dynamic live stream simulation layout links */}
              <div className="flex flex-wrap gap-2.5 items-center">
                
                {/* Social Network Link tags */}
                <a 
                  href="https://www.instagram.com/kunaguero" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center justify-center"
                  title="Instagram: @kunaguero"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a 
                  href="https://x.com/aguerosergiokun" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center justify-center"
                  title="X: @aguerosergiokun"
                >
                  <Twitter className="w-4 h-4" />
                </a>

                <a 
                  href="https://www.twitch.tv/slakun10" 
                  target="_blank" 
                  rel="noreferrer"
                  className="py-2 px-3 text-xs font-mono font-bold rounded-xl bg-[#9146ff] hover:bg-[#a362ff] text-white transition-all flex items-center gap-1.5"
                  title="Twitch: SLAKUN10"
                >
                  <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                  SLAKUN10
                </a>

                <a 
                  href="https://sergioaguero.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="py-2 px-3 text-xs font-mono font-bold rounded-xl bg-neutral-950 border border-neutral-805 hover:border-neutral-600 text-neutral-300 transition-all flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  SITIO OFICIAL
                </a>

              </div>
            </div>

            {/* MAIN TWO COLUMN CONTAINER FOR DECORATIONS, HOSTING DETAILS, CHATS & FUN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT CONTAINER COMPONENT PANEL: DESIGNS, INVITE DETAILS, FORM (7/12 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                
                {/* Theme Selector Accent Bar */}
                <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />

                {/* Classic Invitation Details Card */}
                <InvitationCard theme={theme} />

                {/* Secure Full-Stack Interactive RSVP Form */}
                <RSVPForm onRsvpSuccess={handleRsvpSuccess} />

              </div>

              {/* RIGHT CONTAINER COMPONENT PANEL: VIRTUAL CAKE, TWITCH STREAM CHAT, CHECKLISTS (5/12 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                
                {/* Visual Interleaving Virtual Cake Candle-blower */}
                <CakeBlaster theme={theme} onBlowSuccess={handleBlowSuccess} />

                {/* Interactive Cascading Stream Chat */}
                <TwitchStreamChat rsvps={rsvps} />

                {/* RSVP LIST: CONFIRMED SLOT TICKETS */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col gap-3.5 shadow-xl relative overflow-hidden h-[360px]">
                  
                  {/* Glowing side */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/5 rounded-full filter blur-xl pointer-events-none" />

                  <h3 className="font-display font-bold text-sm text-white tracking-wide uppercase flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    LISTADO DE ASISTENCIA VIP ({rsvps.filter(r => r.attending).length + 4})
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
                    {rsvps.map((rsvp) => (
                      <div 
                        key={rsvp.id} 
                        className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                          rsvp.attending 
                            ? 'bg-neutral-950 border-neutral-850 hover:border-neutral-700' 
                            : 'bg-neutral-950/40 border-neutral-900/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          
                          {/* Checked status indicators */}
                          {rsvp.attending ? (
                            <CheckCircle className="w-5.5 h-5.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-5.5 h-5.5 rounded-full border-2 border-neutral-700 flex items-center justify-center font-mono font-bold text-neutral-600 text-[10px] shrink-0">X</div>
                          )}

                          <div className="flex flex-col truncate">
                            <span className="font-display font-extrabold text-xs text-white truncate">{rsvp.name}</span>
                            <span className="text-[9px] text-neutral-500 font-mono tracking-wide truncate">
                              {rsvp.attending 
                                ? `Menú: ${rsvp.foodChoice === 'asado' ? '🥩 ASADITO' : rsvp.foodChoice === 'burger' ? '🍔 HAMBURGUESA' : '🥗 VEGGIE'}` 
                                : 'Se le cayó la conexión'
                              }
                            </span>
                          </div>

                        </div>

                        {/* Relative timing badge */}
                        <div className="font-mono text-[9px] bg-neutral-900 text-neutral-400 py-1 px-2.5 rounded-xl border border-neutral-800 select-none uppercase shrink-0 font-medium">
                          {rsvp.attending ? 'SLOT VIP' : 'CAÍDO'}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>

            {/* BRAND FOOTER AND GREETINGS CREDITS - ANCHORING DESIGN */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center py-6 border-t border-neutral-900/80 text-[10px] text-neutral-500 gap-3 font-mono mt-4">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-gaming-blue" />
                CRAFTED FOR SERGIO KUN AGÜERO BIRTHDAY CELEBRATION 🍰 2026
              </span>
              <span className="flex items-center gap-2">
                <span>ESTADO SERVIDOR: CONECTADO</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </span>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* FLOAT POPUP NOTIFICATIONS FEEDBACK OVERLAYS */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-neutral-950/95 border border-gaming-blue/30 text-xs text-white shadow-2xl flex items-center gap-2 font-display font-medium max-w-sm tracking-tight"
          >
            <div className="w-2 h-2 rounded-full bg-gaming-blue animate-ping" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
