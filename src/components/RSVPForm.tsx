import React, { useState } from 'react';
import { Send, Smile, Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RSVP } from '../types';

interface RSVPFormProps {
  onRsvpSuccess: (newRsvp: RSVP) => void;
}

export default function RSVPForm({ onRsvpSuccess }: RSVPFormProps) {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState(true);
  const [foodChoice, setFoodChoice] = useState<'asado' | 'burger' | 'veggie' | 'none'>('asado');
  const [customMessage, setCustomMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Latest generated feedback from Kun AI
  const [latestReplyText, setLatestReplyText] = useState<string | null>(null);
  const [latestReplyAudio, setLatestReplyAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const handleAttendingChange = (status: boolean) => {
    setAttending(status);
    if (!status) {
      setFoodChoice('none');
    } else {
      setFoodChoice('asado');
    }
  };

  const handlePlayAudio = (base64Data: string) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
      }

      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      setCurrentAudio(audio);
      setIsPlaying(true);
      
      audio.play().catch(e => {
        console.error('Audio play blocked or failed:', e);
        setIsPlaying(false);
      });
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    } catch (err) {
      console.error('Error playing generated base64 speech audio:', err);
      setIsPlaying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingresá tu nombre para anotarte en la lista VIP.');
      return;
    }

    setError(null);
    setLoading(true);
    setLatestReplyText(null);
    setLatestReplyAudio(null);

    try {
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          attending,
          foodChoice,
          customMessage: customMessage.trim()
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo procesar la confirmación. Probá de nuevo.');
      }

      const newRsvp: RSVP = await response.json();
      
      // Post success trigger back to app layout
      onRsvpSuccess(newRsvp);

      // Save reaction details
      if (newRsvp.kunReplyText) {
        setLatestReplyText(newRsvp.kunReplyText);
      }
      if (newRsvp.kunReplyAudio) {
        setLatestReplyAudio(newRsvp.kunReplyAudio);
        // Play vocal audio automatically to surprise guests!
        setTimeout(() => {
          handlePlayAudio(newRsvp.kunReplyAudio!);
        }, 600);
      }

      // Reset fields but keep name for visual review
      setCustomMessage('');

    } catch (err: any) {
      setError(err?.message || 'Error de conexión con el stream server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Background neon stream scanlines */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gaming-purple/5 rounded-full filter blur-3xl pointer-events-none" />

      <h3 className="font-display font-black text-lg sm:text-xl text-white mb-1 uppercase tracking-tighter flex items-center gap-2 italic">
        <img src="https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/svg/2728.svg" className="w-5 h-5 animate-pulse" alt="sparkle" />
        CONFIRMÁ TU ASISTENCIA VIP IN SITU
      </h3>
      <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
        Completá los datos y enviá tu mensaje directo al stream server. ¡El Kun AI te va a contestar en directo con su propia voz!
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Guest full name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold tracking-wider text-neutral-400">¿CÓMO FIGURÁS EN EL CHAT? (NOMBRE/TWITCH USER)</label>
          <input
            type="text"
            placeholder="Ej: Scaloni_VIP o Tu Nombre"
            maxLength={35}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="bg-neutral-950 border border-white/5 focus:border-red-600 outline-none p-3 rounded-xl text-xs text-white placeholder-neutral-600 transition-colors font-mono"
          />
        </div>

        {/* Attendance Toggle Switches */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold tracking-wider text-neutral-400">¿ENTRÁS A LA PARTIDA DEL KUN?</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="confirm_yes"
              onClick={() => handleAttendingChange(true)}
              className={`py-3 px-3.5 rounded-none transform -skew-x-12 font-display font-black text-xs border transition-all cursor-pointer ${
                attending 
                  ? 'bg-emerald-600 text-black border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  : 'bg-neutral-950 border-neutral-850 text-neutral-550 hover:text-neutral-400 hover:bg-neutral-900/50'
              }`}
            >
              🎮 ¡ADENTRO COPO! (SÍ, VOY)
            </button>
            <button
              type="button"
              id="confirm_no"
              onClick={() => handleAttendingChange(false)}
              className={`py-3 px-3.5 rounded-none transform -skew-x-12 font-display font-black text-xs border transition-all cursor-pointer ${
                !attending 
                  ? 'bg-rose-600 text-black border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                  : 'bg-neutral-950 border-neutral-850 text-neutral-550 hover:text-neutral-400 hover:bg-neutral-900/50'
              }`}
            >
              ❌ OFF-LINE (NO PUEDO)
            </button>
          </div>
        </div>

        {/* Dynamic Food Selection */}
        <AnimatePresence>
          {attending && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-1.5 overflow-hidden"
            >
              <label className="text-xs font-mono font-bold tracking-wider text-neutral-400">ELEGÍ TU RECARGA DE ENERGÍA (COMIDA)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'asado', emoji: '🥩', label: 'Asadito' },
                  { id: 'burger', emoji: '🍔', label: 'Hamburguesa' },
                  { id: 'veggie', emoji: '🥗', label: 'Saludable/Veg' }
                ].map((fd) => (
                  <button
                    key={fd.id}
                    type="button"
                    onClick={() => setFoodChoice(fd.id as any)}
                    className={`py-2.5 px-2 rounded-none transform -skew-x-12 font-display text-[11px] border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      foodChoice === fd.id
                        ? 'bg-amber-500 text-black border-amber-500 font-black'
                        : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-900/50'
                    }`}
                  >
                    <span className="text-lg">{fd.emoji}</span>
                    <span className="font-bold tracking-tight uppercase italic">{fd.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message for Sergio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold tracking-wider text-neutral-400">ESCRIBÍ TU MENSAJE DE FELICITACIONES AL KUN AI</label>
          <textarea
            rows={2}
            maxLength={180}
            placeholder={attending ? "Escribí tus felicitaciones del cumple..." : "Explicaciones del ban, contale por qué no podés ir..."}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            disabled={loading}
            className="bg-neutral-950 border border-white/5 focus:border-red-650 outline-none p-3 rounded-xl text-xs text-white placeholder-neutral-600 transition-colors resize-none font-sans"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="btn_submit_rsvp"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-none transform -skew-x-6 font-display font-black text-xs text-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
            loading 
              ? 'bg-neutral-750 text-neutral-500 opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-650 via-amber-400 to-gaming-blue hover:opacity-95 active:scale-98 shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              CONECTANDO CON EL KUN AI...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              ENVIAR RSVP DIRECTO ⚡
            </>
          )}
        </button>

      </form>

      {/* AUDIO RESPONSE OVERLAY DIALOG - DYNAMIC FEEDBACK */}
      <AnimatePresence>
        {latestReplyText && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 20 }}
            className="mt-6 p-4 rounded-xl bg-neutral-950 border-2 border-red-600 shadow-2xl flex flex-col gap-3 relative"
          >
            {/* Glowing active header stream panel overlay */}
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-mono text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                • KUN AI REACCIONA EN DIRECTO:
              </span>
              <Smile className="w-3.5 h-3.5 text-gaming-blue animate-bounce" />
            </div>

            {/* AI Text Bubble */}
            <div className="relative p-3.5 rounded-lg bg-neutral-900 border border-white/5 text-xs text-neutral-200 leading-relaxed italic pr-8">
              " {latestReplyText} "
              <div className="absolute top-1 right-2 font-display text-2xl text-neutral-800 font-extrabold select-none">”</div>
            </div>

            {/* Audio Voice feedback player controller container */}
            {latestReplyAudio && (
              <div className="flex items-center justify-between gap-3 bg-neutral-900/60 p-2 rounded-xl border border-white/5 font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gaming-purple/20 border border-gaming-purple/40 flex items-center justify-center shrink-0">
                    <Volume2 className={`w-4 h-4 text-gaming-purple ${isPlaying ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-neutral-300 font-bold leading-none">AUDIO GREETING VOICEOVER</span>
                    <span className="text-[8px] font-mono text-neutral-500 mt-0.5">{isPlaying ? 'Sintonizando audio en vivo' : 'Voz sintetizada de Sergio'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn_replay_voice"
                  onClick={() => handlePlayAudio(latestReplyAudio)}
                  className="py-1.5 px-3.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] font-mono font-bold text-gaming-blue hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <LoaderWave />
                      Reproduciendo...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      ESCUCHAR DE NUEVO
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Micro voice line visualizer animation during replay
function LoaderWave() {
  return (
    <div className="flex gap-0.5 items-end h-3.5 mr-0.5">
      <div className="w-0.5 h-1 bg-gaming-blue rounded-full animate-[bar-pulse_0.6s_infinite_alternate]" />
      <div className="w-0.5 h-3 bg-gaming-blue rounded-full animate-[bar-pulse_0.6s_infinite_alternate_0.2s]" />
      <div className="w-0.5 h-1.5 bg-gaming-blue rounded-full animate-[bar-pulse_0.6s_infinite_alternate_0.1s]" />
    </div>
  );
}
