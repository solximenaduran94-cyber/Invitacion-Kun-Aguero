import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Volume2, Gamepad, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { EventTheme } from '../types';

interface InvitationCardProps {
  theme: EventTheme;
}

export default function InvitationCard({ theme }: InvitationCardProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Target event date: Saturday, June 6, 2026 (based on calendar timeline)
  const targetDate = new Date('2026-06-06T21:00:00-03:00'); // Buenos Aires timezone (-3)

  useEffect(() => {
    const calculateTime = () => {
      const difference = +targetDate - +new Date();
      let timeLeftValues = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeftValues = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      setTimeLeft(timeLeftValues);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Retro synthesizer bleeps
  const triggerSound = (type: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'vamo') {
        // High ascending 3 notes
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'gg') {
        // High retro beep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1046, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'tecomo') {
        // Low comical sound wave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      } else if (type === 'alangulo') {
        // Whistle stadium wave
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // Ignore
    }
  };

  const slogans = {
    gaming: {
      tag: "Modo Cumple Activado 🎮",
      title: "PARTIDA INICIADA",
      subtitle: "Nivel 38 Desbloqueado"
    },
    independiente: {
      tag: "Entrá a la partida del Kun ⚽",
      title: "¡VÍA LIBRE DIABLO!",
      subtitle: "Fiesta de Leyenda Roja"
    },
    mancity: {
      tag: "Del fútbol al streaming, una leyenda se conecta 👑",
      title: "TIEMPO HISTÓRICO 93:20",
      subtitle: "Sergio Kun Agüero Celebration"
    }
  };

  const selectedSlogan = slogans[theme] || slogans.gaming;

  return (
    <div className="w-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Decorative top badge tags */}
      <div className={`absolute top-4 left-4 z-20 font-black text-[9px] tracking-widest text-white uppercase py-1 px-3.5 rounded-none transform -skew-x-12 border shadow-lg transition-colors duration-500 ${
        theme === 'gaming' ? 'bg-indigo-600 border-indigo-500' :
        theme === 'independiente' ? 'bg-red-600 border-red-500' :
        'bg-sky-400 border-sky-400 text-black'
      }`}>
        {selectedSlogan.tag}
      </div>

      {/* Decorative generated image banner on top half */}
      <div className="relative h-60 md:h-64 overflow-hidden bg-neutral-950">
        <img 
          src="/src/assets/images/kun_banner_1780364680625.png" 
          alt="Kun Aguero Gaming and Football Banner" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105 select-none"
        />
        {/* Glow tint gradients matching theme */}
        <div className={`absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40 transition-all duration-700 ${
          theme === 'gaming' ? 'shadow-[inset_0_-20px_50px_rgba(99,102,241,0.2)]' :
          theme === 'independiente' ? 'shadow-[inset_0_-20px_50px_rgba(239,68,68,0.2)]' :
          'shadow-[inset_0_-20px_50px_rgba(56,189,248,0.1)]'
        }`} />
      </div>

      {/* CARD CONTENT */}
      <div className="p-6 flex flex-col pt-4">
        
        {/* Title details */}
        <div className="flex flex-col mb-6">
          <span className={`font-mono text-[10px] tracking-widest font-black uppercase transition-colors duration-500 italic ${
            theme === 'gaming' ? 'text-gaming-blue' :
            theme === 'independiente' ? 'text-red-550' :
            'text-sky-350'
          }`}>
            // {selectedSlogan.subtitle}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tighter leading-none mt-1.5 uppercase italic">
            {selectedSlogan.title}
          </h2>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-xs text-neutral-450 uppercase font-bold tracking-wider">Te invita:</span>
            <span className="text-xs bg-red-600 text-black font-black font-sans italic tracking-wide py-1 px-3 rounded-none transform -skew-x-12 inline-flex items-center gap-1.5 border border-red-700 shadow-md">
              <Gamepad className="w-3.5 h-3.5" />
              SERGIO "KUN" AGÜERO
            </span>
          </div>
        </div>

        {/* PARTY DETAILS - BENTO GRID STYLE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          
          {/* Calendar Box */}
          <div className="bg-neutral-950 border border-white/5 p-4 rounded-xl flex flex-col justify-between hover:border-white/10 transition-all">
            <div className="flex justify-between items-start">
              <Calendar className="w-5 h-5 text-gaming-blue" />
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">FECHA</span>
            </div>
            <div className="mt-4">
              <p className="font-display font-black text-white text-lg uppercase italic">Sábado 6</p>
              <p className="text-[11px] text-neutral-400 font-mono">Junio, 2026</p>
            </div>
          </div>

          {/* Time Box */}
          <div className="bg-neutral-950 border border-white/5 p-4 rounded-xl flex flex-col justify-between hover:border-white/10 transition-all">
            <div className="flex justify-between items-start">
              <Clock className="w-5 h-5 text-gaming-purple" />
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">HORARIO</span>
            </div>
            <div className="mt-4">
              <p className="font-display font-black text-white text-lg uppercase italic">21:00 HS</p>
              <p className="text-[11px] text-neutral-400 font-mono">Kickoff, pa.</p>
            </div>
          </div>

          {/* Location Box */}
          <div className="bg-neutral-950 border border-white/5 p-4 rounded-xl flex flex-col justify-between hover:border-white/10 transition-all">
            <div className="flex justify-between items-start">
              <MapPin className="w-5 h-5 text-red-550" />
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">LUGAR VIP</span>
            </div>
            <div className="mt-4">
              <p className="font-display font-black text-white text-sm uppercase italic truncate">La Mansión Gamer</p>
              <p className="text-[10px] text-neutral-400 font-mono truncate">Nordelta, BA, ARG</p>
            </div>
          </div>

        </div>

        {/* LOGISTICS & INFO NOTES */}
        <div className="bg-neutral-950/65 border border-white/5 p-4 rounded-xl mb-6">
          <h4 className="font-display font-black text-xs text-white mb-2 uppercase tracking-wide flex items-center gap-1.5 italic">
            <Award className="w-4 h-4 text-amber-500" />
            REQUISITOS DEL EVENTO:
          </h4>
          <ul className="text-neutral-300 text-xs space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
            <li><b>Dress Code:</b> Vestimenta casual gamer o vení con la camiseta de tu club preferido.</li>
            <li><b>Código de entrada:</b> Únicamente QR de listado VIP (confirmando asistencia abajo).</li>
            <li>Habrá asado premium, torneo de FIFA 26 y Valorant, setup de streaming en vivo.</li>
            <li><b>"GG, nos vemos en el cumple"</b>. Traé la play cargada y ganas de ganar.</li>
          </ul>
        </div>

        {/* COUNTDOWN TILES */}
        <div className="mb-6 flex flex-col gap-2 bg-neutral-950/40 p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 text-center font-bold">
            TIEMPO RESTANTE PARA LA PARTIDA:
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Días', val: timeLeft.days },
              { label: 'Hrs', val: timeLeft.hours },
              { label: 'Min', val: timeLeft.minutes },
              { label: 'Seg', val: timeLeft.seconds },
            ].map((col, idx) => (
              <div key={idx} className="bg-neutral-950 border border-white/5 rounded-lg p-2.5 flex flex-col items-center">
                <span className="font-sans text-2xl font-black text-white italic tracking-tighter">
                  {String(col.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-neutral-500 uppercase tracking-tight mt-0.5 font-mono font-bold">{col.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KUN SOUNDBOARD AREA */}
        <div className="flex flex-col gap-2.5 bg-neutral-950/30 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase font-sans italic">
            <Volume2 className="w-4 h-4 text-gaming-purple" />
            SOUNDBOARD DIGITAL KUN (MIDIs)
          </div>
          <p className="text-[10px] text-neutral-400 leading-snug">
            Tocá los botones para reproducir los característicos sonidos y audios rápidos de retro consola del Kun:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {[
              { id: 'vamo', title: 'Vamo\' a jugar', phrase: 'Ascending Arpeggio' },
              { id: 'tecomo', title: 'Mirá que te como', phrase: 'Sweep Down' },
              { id: 'alangulo', title: '¡Al ángulo!', phrase: 'Stadium Whistle' },
              { id: 'gg', title: 'GG', phrase: 'High Beep' }
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => triggerSound(snd.id)}
                id={`snd_btn_${snd.id}`}
                className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 py-2.5 px-2 rounded-xl text-center group transition-all text-xs cursor-pointer active:scale-95"
              >
                <div className="font-display font-medium text-white text-xs truncate">{snd.title}</div>
                <div className="text-[8px] font-mono text-neutral-500 group-hover:text-neutral-400 truncate mt-0.5">{snd.phrase}</div>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
