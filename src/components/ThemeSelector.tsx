import React from 'react';
import { Gamepad2, Trophy, Crown } from 'lucide-react';
import { EventTheme } from '../types';

interface ThemeSelectorProps {
  currentTheme: EventTheme;
  onThemeChange: (theme: EventTheme) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes = [
    {
      id: 'independiente' as EventTheme,
      name: 'Clásico Rojo',
      subtitle: 'Atlético Independiente',
      icon: Trophy,
      activeColor: 'bg-red-650 text-black border-red-500 font-bold',
      inactiveColor: 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800',
      description: 'El club de sus amores, botas rojas y el diablo.'
    },
    {
      id: 'gaming' as EventTheme,
      name: 'Kun Streamer',
      subtitle: 'Ambientación Twitch LED',
      icon: Gamepad2,
      activeColor: 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]',
      inactiveColor: 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800',
      description: 'Esports, leds RGB, streamings y joysticks.'
    },
    {
      id: 'mancity' as EventTheme,
      name: 'Ciudad Celeste',
      subtitle: 'Etapa histórica City',
      icon: Crown,
      activeColor: 'bg-sky-400 text-black border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)] font-bold',
      inactiveColor: 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800',
      description: 'Estadía histórica, leyenda 93:20 y gloria.'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-between items-center px-1">
        <h4 className="font-sans font-black text-xs text-neutral-400 tracking-wider uppercase italic">
          ELEGÍ LA DECORACIÓN DEL CUMPLE:
        </h4>
        <span className="text-[10px] bg-red-600 font-sans text-black font-black px-2.5 py-0.5 rounded-none transform -skew-x-12 uppercase">
          {currentTheme} aktif
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = currentTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              id={`theme_btn_${t.id}`}
              className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left group cursor-pointer ${
                isActive ? t.activeColor : t.inactiveColor
              }`}
            >
              <div className="flex justify-between items-center w-full mb-1">
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-black/15' : 'bg-neutral-950 group-hover:bg-neutral-850'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && (
                  <span className={`text-[8px] font-sans font-black px-2 py-0.5 rounded-none transform -skew-x-12 uppercase ${
                    t.id === 'mancity' ? 'bg-neutral-950 text-white' : 'bg-white text-black'
                  }`}>
                    Activo
                  </span>
                )}
              </div>

              <span className="font-sans font-black text-sm uppercase italic tracking-tight mt-15">
                {t.name}
              </span>
              <span className={`text-[9px] font-mono font-bold uppercase ${isActive ? 'opacity-80' : 'text-neutral-500'}`}>
                {t.subtitle}
              </span>
              <p className={`text-[10px] mt-2 leading-snug ${isActive ? 'opacity-90' : 'text-neutral-500'}`}>
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
