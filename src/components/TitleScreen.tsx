import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, HelpCircle, Volume2, Crown, Sparkles, Maximize, Minimize } from 'lucide-react';
import { hasSavedGame } from '../game/saveManager';
import { soundEngine } from '../game/audio';

interface TitleScreenProps {
  onStartGame: (isNew: boolean) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenSettings,
  onOpenGuide,
}) => {
  const hasSave = hasSavedGame();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleFullscreenToggle = () => {
    soundEngine.playUiClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleLaunchGame = (isNew: boolean) => {
    soundEngine.playLevelUp();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    }
    onStartGame(isNew);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        handleLaunchGame(!hasSave);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasSave, onStartGame]);

  return (
    <div className="fixed inset-0 bg-[#0d0f17] z-50 flex flex-col justify-between items-center p-6 md:p-10 select-none overflow-hidden">
      {/* Background Graphic Preview with Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-35 filter brightness-75 scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('/assets/aistudio/file_000000000ea0820e96ac4dddd5618fdb_d87aa455.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#0d101d]/60 to-[#0a0c14] pointer-events-none" />

      {/* Floating pixel ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-sm animate-pulse opacity-60"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* Top Bar: Version & Sound Status & Fullscreen */}
      <div className="relative z-10 w-full flex justify-between items-center text-xs text-gray-400 font-pixel">
        <span className="text-amber-500/80">v1.2.0 • PIXEL SURVIVAL</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFullscreenToggle}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#151722]/80 hover:bg-[#202334] rounded-lg border border-[#30334a] text-yellow-300 cursor-pointer"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{isFullscreen ? 'JANELA' : 'TELA CHEIA'}</span>
          </button>
          <button
            onClick={() => {
              soundEngine.toggleMute();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#151722]/80 hover:bg-[#202334] rounded-lg border border-[#30334a] text-gray-300 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
            <span>ÁUDIO</span>
          </button>
        </div>
      </div>

      {/* Center: Title Lockup (Matching Reference Image!) */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        {/* Crown Icon */}
        <div className="mb-2">
          <Crown className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] animate-bounce" />
        </div>

        {/* Title Badge with Blood-Red Slash / Grunge Effect */}
        <div className="relative inline-block px-8 py-3 bg-black/80 border-2 border-red-950/80 rounded-2xl shadow-2xl">
          <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl text-white tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
            LOST <span className="text-red-600 drop-shadow-[0_0_14px_rgba(220,38,38,0.8)]">WORLD</span>
          </h1>
          <div className="text-xs md:text-sm font-pixel text-yellow-400 tracking-wider mt-1.5 uppercase">
            SOBREVIVÊNCIA 2D
          </div>
        </div>

        <p className="max-w-md text-xs text-gray-300 mt-4 leading-relaxed font-sans font-medium">
          Explore a natureza selvagem, colete madeira e pedras do zero, fabrique suas ferramentas, construa seu refúgio e sobreviva às noites perigosas.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2.5 w-64 md:w-72 mt-8">
          <button
            data-start="true"
            onClick={() => handleLaunchGame(true)}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-xs rounded-xl shadow-xl shadow-red-950/50 border-2 border-yellow-400 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            NOVO JOGO (DO ZERO)
          </button>

          {hasSave && (
            <button
              onClick={() => handleLaunchGame(false)}
              className="w-full py-3 bg-[#1e2336] hover:bg-[#283049] text-yellow-300 font-pixel text-xs rounded-xl border border-yellow-500/50 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              CONTINUAR JOGO
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={onOpenGuide}
              className="py-2.5 bg-[#141624]/90 hover:bg-[#1f2238] text-gray-300 font-pixel text-[10px] rounded-lg border border-[#3b3e59] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              CONTROLES
            </button>

            <button
              onClick={onOpenSettings}
              className="py-2.5 bg-[#141624]/90 hover:bg-[#1f2238] text-gray-300 font-pixel text-[10px] rounded-lg border border-[#3b3e59] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              AJUSTES
            </button>
          </div>
        </div>
      </div>

      {/* Flat Bottom Control Hint Line (Per ultra mode game guidelines) */}
      <div className="relative z-10 text-[11px] text-gray-400 font-medium text-center bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
        WASD Mover · Espaço / Clique Ação · Shift Correr · 1-8 Barra Rápida · E Mochila · C Fabricar · B Construir · M Mapa · Esc Pausar
      </div>
    </div>
  );
};
