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
  const [menuState, setMenuState] = useState<'initial' | 'play_options'>('initial');

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
        if (menuState === 'initial') {
          soundEngine.playUiClick();
          setMenuState('play_options');
        } else {
          handleLaunchGame(!hasSave);
        }
      } else if (e.code === 'Escape' && menuState === 'play_options') {
        soundEngine.playUiClick();
        setMenuState('initial');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasSave, menuState]);

  return (
    <div className="fixed inset-0 bg-[#0a0c14] z-50 flex flex-col justify-between items-center py-2 px-3 sm:py-4 sm:px-6 select-none overflow-y-auto">
      {/* Background Graphic Preview with Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 filter brightness-75 scale-105 pointer-events-none"
        style={{ backgroundImage: `url('/assets/aistudio/file_000000000ea0820e96ac4dddd5618fdb_d87aa455.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b12] via-[#0d101d]/75 to-[#090b12] pointer-events-none" />

      {/* Floating pixel ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-sm animate-pulse opacity-60"
            style={{
              left: `${(i * 19) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* Top Bar: Version & Sound Status & Fullscreen */}
      <div className="relative z-10 w-full flex justify-between items-center text-[10px] sm:text-xs text-gray-400 font-pixel shrink-0">
        <span className="text-amber-400/90 tracking-wider">LOST WORLD v2.0</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleFullscreenToggle}
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#151722]/90 hover:bg-[#202334] rounded-lg border border-[#30334a] text-yellow-300 cursor-pointer text-[9px] sm:text-[10px]"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
            <span>{isFullscreen ? 'JANELA' : 'TELA CHEIA'}</span>
          </button>
          <button
            onClick={() => soundEngine.toggleMute()}
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#151722]/90 hover:bg-[#202334] rounded-lg border border-[#30334a] text-gray-300 cursor-pointer text-[9px] sm:text-[10px]"
          >
            <Volume2 className="w-3 h-3 text-yellow-400" />
            <span>ÁUDIO</span>
          </button>
        </div>
      </div>

      {/* Center: Title Lockup & Action Menu */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-1 max-w-sm w-full">
        {/* Crown Icon */}
        <div className="mb-0.5">
          <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)] animate-bounce" />
        </div>

        {/* Title Badge with Blood-Red Slash */}
        <div className="relative inline-block px-4 py-1.5 sm:px-6 sm:py-2.5 bg-black/85 border-2 border-red-950/80 rounded-2xl shadow-2xl">
          <h1 className="font-pixel text-xl sm:text-3xl md:text-4xl text-white tracking-widest drop-shadow-[0_3px_6px_rgba(0,0,0,1)]">
            LOST <span className="text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]">WORLD</span>
          </h1>
          <div className="text-[9px] sm:text-[11px] font-pixel text-yellow-400 tracking-wider mt-0.5 uppercase">
            SOBREVIVÊNCIA 2.0
          </div>
        </div>

        <p className="text-[10px] sm:text-xs text-gray-300 mt-1.5 sm:mt-2.5 leading-snug font-sans font-medium line-clamp-2">
          Construa, explore cavernas subterrâneas, enfrente desastres e sobreviva na selva.
        </p>

        {/* Dynamic Menu Actions */}
        <div className="w-full max-w-[240px] sm:max-w-[260px] mt-2.5 sm:mt-4 flex flex-col gap-2">
          {menuState === 'initial' ? (
            /* STEP 1: Main "COMEÇAR" Button */
            <>
              <button
                data-start="true"
                onClick={() => {
                  soundEngine.playUiClick();
                  setMenuState('play_options');
                }}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-pixel text-xs sm:text-sm rounded-xl shadow-xl shadow-red-950/60 border-2 border-yellow-400 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 group animate-pulse"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>COMEÇAR</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    onOpenSettings();
                  }}
                  className="py-1.5 bg-[#141624]/90 hover:bg-[#1f2238] text-gray-300 font-pixel text-[9px] sm:text-[10px] rounded-lg border border-[#3b3e59] cursor-pointer flex items-center justify-center gap-1"
                >
                  <Volume2 className="w-3 h-3 text-yellow-400" />
                  AJUSTES
                </button>
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    onOpenGuide();
                  }}
                  className="py-1.5 bg-[#141624]/90 hover:bg-[#1f2238] text-gray-300 font-pixel text-[9px] sm:text-[10px] rounded-lg border border-[#3b3e59] cursor-pointer flex items-center justify-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-emerald-400" />
                  GUIA
                </button>
              </div>
            </>
          ) : (
            /* STEP 2: Play Options (Continuar, Criar Novo Mapa, Configurações, Voltar) */
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              {hasSave ? (
                <button
                  onClick={() => handleLaunchGame(false)}
                  className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-pixel text-[11px] sm:text-xs rounded-xl border border-emerald-400 shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  CONTINUAR JOGO
                </button>
              ) : (
                <div className="py-1.5 bg-gray-900/50 text-gray-500 font-pixel text-[9px] rounded-lg border border-gray-800 text-center">
                  (NENHUM MAPA SALVO)
                </div>
              )}

              <button
                data-newgame="true"
                onClick={() => handleLaunchGame(true)}
                className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-[11px] sm:text-xs rounded-xl border border-yellow-400 shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                CRIAR NOVO MAPA
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onOpenSettings();
                }}
                className="w-full py-1.5 sm:py-2 bg-[#1b1f30] hover:bg-[#252a42] text-yellow-300 font-pixel text-[10px] rounded-lg border border-[#3a4060] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3 h-3 text-yellow-400" />
                CONFIGURAÇÕES
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setMenuState('initial');
                }}
                className="w-full py-1 bg-transparent hover:bg-white/5 text-gray-400 font-pixel text-[9px] rounded-lg cursor-pointer transition-colors"
              >
                ← VOLTAR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Flat Bottom Control Hint Line */}
      <div className="relative z-10 text-[8px] sm:text-[10px] text-gray-400 font-medium text-center bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 shrink-0">
        WASD Mover · Espaço Ação · Shift Correr · 1-8 Barra · E Mochila · C Fabricar · B Construir · M Mapa
      </div>
    </div>
  );
};
