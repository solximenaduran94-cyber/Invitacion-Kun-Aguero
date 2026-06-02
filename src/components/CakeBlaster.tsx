import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CakeBlasterProps {
  theme: 'independiente' | 'gaming' | 'mancity';
  onBlowSuccess: () => void;
}

export default function CakeBlaster({ theme, onBlowSuccess }: CakeBlasterProps) {
  const [candlesLit, setCandlesLit] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [blowProgress, setBlowProgress] = useState(0); // 0 to 100
  const [isBlowing, setIsBlowing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Manual blowing build-up
  const handleManualBlow = () => {
    if (!candlesLit) return;
    setIsBlowing(true);
    setBlowProgress((prev) => {
      const next = prev + 15;
      if (next >= 100) {
        triggerBlowSuccess();
        return 100;
      }
      return next;
    });

    setTimeout(() => setIsBlowing(false), 200);
  };

  // Decay manually blow progress
  useEffect(() => {
    if (!candlesLit) return;
    const interval = setInterval(() => {
      setBlowProgress((prev) => {
        if (prev > 0) return Math.max(0, prev - 3);
        return 0;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [candlesLit]);

  // Handle Audio Microphone detection
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      setMicActive(true);
      detectBlow();
    } catch (err) {
      console.warn('Microphone permission denied or not supported:', err);
      alert('No pudimos acceder al micrófono. Usá el modo de soplado manual.');
    }
  };

  const stopMic = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setMicActive(false);
    setMicVolume(0);
  };

  const detectBlow = () => {
    if (!analyserRef.current || !candlesLit) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
    setMicVolume(normalizedVolume);

    // If volume is high (meaning user blows or makes heavy sound)
    if (normalizedVolume > 35) {
      setIsBlowing(true);
      setBlowProgress((prev) => {
        const next = prev + normalizedVolume * 0.15;
        if (next >= 100) {
          triggerBlowSuccess();
          return 100;
        }
        return next;
      });
    } else {
      setIsBlowing(false);
    }

    animationFrameRef.current = requestAnimationFrame(detectBlow);
  };

  const triggerBlowSuccess = () => {
    setCandlesLit(false);
    setBlowProgress(100);
    setShowConfetti(true);
    stopMic();
    onBlowSuccess();

    // Trigger birthday laugh sound effect
    const synthResult = playSynthSuccess();
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
  };

  const playSynthSuccess = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      // Play a happy high-pitch retro game tune
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpeggio C Major
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }, idx * 100);
      });
    } catch {
      // Ignore
    }
  };

  const resetCake = () => {
    setCandlesLit(true);
    setBlowProgress(0);
    setShowConfetti(false);
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  return (
    <div className="relative w-full p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl flex flex-col items-center">
      {/* LED outline ring */}
      <div className={`absolute inset-0 rounded-3xl pointer-events-none border-2 transition-all duration-500 ${
        theme === 'gaming' ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' :
        theme === 'independiente' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
        'border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
      }`} />

      <h3 className="font-sans font-black text-xl text-white flex items-center gap-2 mb-1 uppercase tracking-tighter italic">
        🎂 LA TORTA DEL KUN
      </h3>
      <p className="text-xs text-neutral-400 text-center mb-6 max-w-sm">
        Soplá las velas con tu micrófono o haciendo clicks rápidos para desbloquear la fiesta del Kun!
      </p>

      {/* Confetti canvas animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-40">
          {Array.from({ length: 100 }).map((_, i) => {
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 4;
            const duration = 2 + Math.random() * 3;
            const color = ['#ff007f', '#00f0ff', '#9146ff', '#e30613', '#ffec00'][i % 5];
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  left: `${randomX}%`,
                  top: '-10px',
                  backgroundColor: color,
                }}
                animate={{
                  top: ['-10px', '100%'],
                  x: [0, Math.sin(i) * 30, Math.cos(i) * 20],
                  rotate: [0, 360 * 3]
                }}
                transition={{
                  duration,
                  delay: randomDelay,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            );
          })}
        </div>
      )}

      {/* The Dynamic Interactive Cake Vector */}
      <div className="relative w-64 h-64 flex items-end justify-center mb-6">
        
        {/* Glow behind cake */}
        <div className={`absolute bottom-6 w-48 h-48 rounded-full filter blur-3xl opacity-30 transition-all duration-700 ${
          candlesLit ? 'bg-amber-400' :
          theme === 'gaming' ? 'bg-indigo-600' :
          theme === 'independiente' ? 'bg-red-600' :
          'bg-sky-400'
        }`} />

        {/* 3D-ish Cake Base structure */}
        <div className="relative flex flex-col items-center">
          
          {/* TOP EXTRAS (Joystick + Jersey + Brand logos) */}
          <div className="relative z-20 -mb-2 flex items-end gap-2 justify-center pb-1 h-24">
            
            {/* Argentina Jersey N°10 */}
            <motion.div 
              className="relative w-12 h-14 bg-sky-200 rounded-t-lg border-2 border-white flex flex-col items-center justify-center shadow-lg"
              animate={candlesLit ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute top-0 w-full h-3 bg-white border-b-2 border-sky-300"></div>
              {/* Celeste stripes */}
              <div className="flex w-full h-full justify-around pt-3">
                <div className="w-2.5 h-full bg-sky-400"></div>
                <div className="w-2.5 h-full bg-white"></div>
                <div className="w-2.5 h-full bg-sky-400"></div>
              </div>
              <span className="absolute text-blue-900 font-mono font-bold text-xs mt-1.5 z-10">10</span>
              
              {/* Golden stars */}
              <div className="absolute -top-3 flex gap-0.5 text-[5px] text-yellow-400">⭐⭐⭐</div>
            </motion.div>

            {/* PlayStation/Twitch Joystick on top */}
            <motion.div 
              className="relative w-20 h-12 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center justify-around p-1 shadow-2xl"
              animate={candlesLit ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glowing buttons */}
              <div className="w-3.5 h-3.5 bg-neutral-700 rounded-full flex flex-wrap p-0.5 justify-around items-center">
                <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
              </div>
              
              {/* Twitch logo on controller */}
              <div className="w-5 h-5 bg-gaming-purple rounded-md flex items-center justify-center text-[8px] text-white font-mono font-black border border-white/20">
                T
              </div>

              {/* D-Pad / Knobs */}
              <div className="w-4 h-4 bg-neutral-900 rounded-full border border-neutral-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-gaming-blue rounded-full"></div>
              </div>

              {/* LEDs */}
              <div className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded ${
                candlesLit ? 'bg-gaming-blue animate-pulse' : 'bg-neutral-600'
              }`} />
            </motion.div>

            {/* Club Atlético Independiente emblem */}
            <motion.div 
              className="relative w-10 h-10 bg-red-600 rounded-full border border-white flex items-center justify-center shadow-lg"
              animate={candlesLit ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 1.8, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="text-white font-display font-extrabold text-[10px] tracking-tighter">CAI</div>
            </motion.div>

          </div>

          {/* Candle & Flame */}
          <div className="absolute -top-8 left-12 z-35 flex flex-col items-center">
            {candlesLit && (
              <motion.div 
                animate={{ scale: [1, 1.25, 0.95, 1.1, 1], y: [0, -2, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-4 h-7 bg-amber-400 rounded-full filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] relative -mb-1 origin-bottom flex items-end justify-center"
              >
                <div className="w-2 h-4 bg-red-500 rounded-full animate-pulse opacity-80" />
              </motion.div>
            )}
            <div className="w-2 h-8 bg-gradient-to-t from-orange-400 to-yellow-200 border-x border-orange-500/30 rounded-t" />
          </div>

          {/* SECOND CANDLE */}
          <div className="absolute -top-6 right-12 z-35 flex flex-col items-center">
            {candlesLit && (
              <motion.div 
                animate={{ scale: [1.1, 0.9, 1.2, 1.05, 1.1], y: [0, 1, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: 0.2 }}
                className="w-4 h-7 bg-amber-400 rounded-full filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] relative -mb-1 origin-bottom flex items-end justify-center"
              >
                <div className="w-2 h-4 bg-red-500 rounded-full animate-pulse opacity-80" />
              </motion.div>
            )}
            <div className="w-2 h-8 bg-gradient-to-t from-orange-400 to-yellow-200 border-x border-orange-500/30 rounded-t" />
          </div>

          {/* CAKE BODIES - Modern matte black cake tier with light layers */}
          
          {/* Main Tier */}
          <div className="w-56 h-28 bg-neutral-950 rounded-2xl border-2 border-neutral-800 shadow-[inset_0_4px_10px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden relative">
            
            {/* LED Glow bars across tier */}
            <div className="absolute inset-y-0 w-full flex flex-col justify-around py-4 pointer-events-none">
              
              {/* LED Line 1 (Twitch Violet) */}
              <div className={`w-full h-1.5 transition-all duration-700 ${
                candlesLit 
                  ? 'bg-gaming-purple shadow-[0_0_6px_#9146ff] animate-pulse' 
                  : 'bg-neutral-800'
              }`} />
              
              {/* LED Line 2 (Gamer Electric Blue) */}
              <div className={`w-full h-1.5 transition-all duration-700 ${
                candlesLit 
                  ? 'bg-gaming-blue shadow-[0_0_6px_#00f0ff] animate-pulse delay-500' 
                  : 'bg-neutral-800'
              }`} />

            </div>

            {/* Glowing text details */}
            <div className="m-auto flex flex-col items-center z-10 pointer-events-none">
              <span className="font-sans font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-red-650 via-amber-400 to-blue-500 tracking-tighter uppercase italic">
                KUN
              </span>
              <span className={`font-mono text-[10px] font-bold uppercase tracking-widest transition-colors duration-700 italic ${
                candlesLit ? 'text-[#00f0ff]' : 'text-neutral-500'
              }`}>
                {candlesLit ? 'LEVEL 38' : 'COMPLETADO GG'}
              </span>
            </div>

            {/* Frosting dripping down */}
            <div className="absolute top-0 w-full flex pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-${i % 2 === 0 ? '4' : '6'} rounded-b-xl border-b border-white/5 transition-colors duration-700 ${
                    theme === 'gaming' ? 'bg-gaming-purple shadow-[0_2px_4px_rgba(145,70,255,0.4)]' :
                    theme === 'independiente' ? 'bg-independiente-red shadow-[0_2px_4px_rgba(227,6,19,0.4)]' :
                    'bg-mancity-blue shadow-[0_2px_4px_rgba(108,174,224,0.4)]'
                  }`} 
                />
              ))}
            </div>

            {/* Independent, Twitch and City logo emblems on actual cake body */}
            <div className="absolute bottom-2 inset-x-4 flex justify-between items-center opacity-40">
              <span className="text-[9px] text-white font-semibold">SLAKUN10</span>
              <span className="text-[9px] text-white font-semibold">93:20</span>
            </div>

          </div>

          {/* Stand / Plate base */}
          <div className="w-64 h-3 bg-neutral-800 border-t border-neutral-700 rounded-full shadow-lg -mt-1" />
          <div className="w-32 h-4 bg-neutral-900 border-x border-neutral-800 rounded-b-xl shadow-inner" />

        </div>

        {/* Windy blowing effect particles */}
        <AnimatePresence>
          {isBlowing && candlesLit && (
            <motion.div 
              className="absolute top-1/3 w-full flex justify-around pointer-events-none z-50 px-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.8, 0], scale: 1.1, x: [-20, 20] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-1 bg-white/40 blur-xs rounded-full"></div>
              <div className="w-12 h-1 bg-white/40 blur-xs rounded-full"></div>
              <div className="w-10 h-1 bg-white/40 blur-xs rounded-full"></div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* CONTROLS AREA */}
      <div className="w-full flex flex-col gap-3 justify-center items-center">
        
        {/* Blowing progress bar */}
        {candlesLit && (
          <div className="w-full max-w-sm px-4 flex flex-col items-center gap-1.5">
            <div className="flex justify-between w-full text-xs text-neutral-400">
              <span>Fuerza del Soplo:</span>
              <span className="font-mono">{Math.round(blowProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-150 ease-out bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                style={{ width: `${blowProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center w-full max-w-sm">
          {candlesLit ? (
            <>
              {/* Mic mode toggle */}
              <button
                onClick={micActive ? stopMic : startMic}
                id="btn_mic"
                className={`flex-1 py-3.5 px-4 rounded-none transform -skew-x-12 font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  micActive 
                    ? 'bg-red-600 text-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                    : 'bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-750'
                }`}
              >
                <Mic className={`w-4 h-4 ${micActive ? 'animate-pulse' : ''}`} />
                {micActive ? 'Apagar Mic' : 'Soplar Mic'}
              </button>

              {/* Manual blow button */}
              <button
                onClick={handleManualBlow}
                id="btn_blow_manual"
                className="flex-1 py-3.5 px-4 rounded-none transform -skew-x-12 font-sans font-black text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-xl hover:from-amber-450 hover:to-orange-550 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <Flame className="w-4 h-4 animate-bounce" />
                Soplo Manual
              </button>
            </>
          ) : (
            <button
              onClick={resetCake}
              id="btn_reset_cake"
              className="py-3 px-6 rounded-none transform -skew-x-6 font-sans font-black text-xs bg-red-600 hover:bg-red-500 text-black transition-all flex items-center gap-2 uppercase tracking-wide cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Prender Velas
            </button>
          )}
        </div>

        {/* Real-time mic feedback indicator */}
        {micActive && candlesLit && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
            <Volume2 className="w-3.5 h-3.5 animate-bounce text-gaming-blue" />
            <span>Volumen registrado: <b className="font-mono text-white">{micVolume}</b> / 100</span>
          </div>
        )}

      </div>

    </div>
  );
}
