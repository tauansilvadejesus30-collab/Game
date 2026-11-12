import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, HelpCircle, Volume2, Crown, Sparkles, Maximize, Minimize, Settings, Gift, Trophy, BarChart3, Shirt, ShoppingBag, LogOut, ChevronRight } from 'lucide-react';
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
  const [activeNotice, setActiveNotice] = useState(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [infoModal, setInfoModal] = useState<string | null>(null);

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

  const handleClaimReward = () => {
    if (!dailyRewardClaimed) {
      soundEngine.playCollect();
      setDailyRewardClaimed(true);
      setInfoModal('🎁 Recompensa Diária Coletada! Você ganhou +5 Poções de Cura e +10 Madeira no início da sua jornada!');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#07080d] z-50 flex flex-col justify-between items-center py-2 px-3 sm:py-3 sm:px-6 select-none overflow-hidden touch-none font-sans">
      {/* Background Graphic Preview matching user screenshot */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out pointer-events-none scale-100"
        style={{ 
          backgroundImage: menuState === 'initial'
            ? `url('/assets/aistudio/file_00000000d774820ea8a4a4d9181ff54a_3bdf4c8d.png')`
            : `url('/assets/aistudio/file_000000009d20820ea79fcc817114a6a1_235ecd36.png')`,
        }}
      />
      {/* Dynamic atmospheric vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/75 pointer-events-none" />

      {/* Floating pixel ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-400 rounded-xs animate-pulse opacity-70"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 21) % 100}%`,
              animationDelay: `${(i * 0.25) % 2.5}s`,
            }}
          />
        ))}
      </div>

      {/* ========================================================= */}
      {/* TOP HEADER BAR (Matching user UI screenshot) */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full flex justify-between items-start text-[10px] sm:text-xs text-gray-300 font-pixel shrink-0 pt-1">
        {/* Left: Title brand & News badge */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            <span className="text-yellow-400 font-bold tracking-wider text-xs sm:text-sm">LOST WORLD v2.0</span>
            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          </div>

          {/* Novidades Badge */}
          <button 
            onClick={() => setActiveNotice(!activeNotice)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-black/75 hover:bg-black/90 rounded-lg border border-neutral-700/80 shadow-md text-left cursor-pointer transition-transform active:scale-95 max-w-[200px] sm:max-w-xs"
          >
            <span className="text-yellow-400 text-[10px]">⭐</span>
            <div className="flex flex-col">
              <span className="text-yellow-300 font-bold text-[8px] sm:text-[9px] leading-tight">Novidades!</span>
              <span className="text-gray-300 text-[7px] sm:text-[8px] leading-tight line-clamp-1">Cavernas subterrâneas e novos minérios!</span>
            </div>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0 ml-auto" />
          </button>
        </div>

        {/* Right: Quick Settings Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleFullscreenToggle}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-black/80 hover:bg-neutral-900 rounded-lg border border-neutral-700 text-yellow-300 cursor-pointer text-[8px] sm:text-[9px] font-pixel shadow-md active:scale-95 transition-all"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3 text-yellow-400" />}
            <span>JANELA</span>
          </button>
          <button
            onClick={() => soundEngine.toggleMute()}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-black/80 hover:bg-neutral-900 rounded-lg border border-neutral-700 text-gray-200 cursor-pointer text-[8px] sm:text-[9px] font-pixel shadow-md active:scale-95 transition-all"
            title="Alternar Áudio"
          >
            <Volume2 className="w-3 h-3 text-yellow-400" />
            <span>ÁUDIO</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenSettings();
            }}
            className="p-1.5 bg-black/80 hover:bg-neutral-900 rounded-lg border border-neutral-700 text-gray-200 cursor-pointer shadow-md active:scale-95 transition-all"
            title="Configurações"
          >
            <Settings className="w-3.5 h-3.5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Floating Daily Rewards Badge (Right Side) */}
      {menuState === 'initial' && (
        <div className="absolute right-3 sm:right-6 top-16 sm:top-20 z-10 pointer-events-auto">
          <button
            onClick={handleClaimReward}
            className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${
              dailyRewardClaimed 
                ? 'bg-black/60 border-neutral-700 opacity-70' 
                : 'bg-black/85 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
            }`}
          >
            <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 fill-amber-400/20" />
            <span className="font-pixel text-[8px] sm:text-[9px] text-yellow-300 font-bold mt-1 tracking-tight">
              {dailyRewardClaimed ? 'COLETADO!' : 'RECOMPENSAS'}
            </span>
            <span className="font-pixel text-[7px] text-white">DIÁRIAS!</span>
            <span className="text-[8px] text-gray-400 mt-0.5 font-mono">⏱️ 23h 59m</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* CENTER: Main Title & Action Buttons */}
      {/* ========================================================= */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-1 max-w-md w-full">
        {/* Crown Icon with Glow */}
        <div className="mb-0.5">
          <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)] animate-bounce" />
        </div>

        {/* Title Banner */}
        <div className="relative inline-block px-5 py-2 sm:px-8 sm:py-3 bg-black/90 border-2 border-red-700/80 rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.4)]">
          <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-white tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
            LOST <span className="text-red-600 drop-shadow-[0_0_16px_rgba(220,38,38,0.9)]">WORLD</span>
          </h1>
          <div className="text-[10px] sm:text-xs font-pixel text-yellow-400 tracking-widest mt-1 uppercase flex items-center justify-center gap-1.5">
            <span className="text-red-500">❖</span> SOBREVIVÊNCIA 2.0 <span className="text-red-500">❖</span>
          </div>
        </div>

        <p className="text-[10px] sm:text-xs text-gray-200 mt-2 sm:mt-3 leading-snug font-sans font-medium max-w-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          Construa, explore cavernas subterrâneas, enfrente desastres e sobreviva na selva.
        </p>

        {/* Action Menu (Step 1 vs Step 2) */}
        <div className="w-full max-w-[260px] sm:max-w-[290px] mt-3 sm:mt-5 flex flex-col gap-2.5">
          {menuState === 'initial' ? (
            /* STEP 1: Main "COMEÇAR" Button matching reference screenshot */
            <div className="flex flex-col gap-2 animate-fadeIn">
              <button
                data-start="true"
                onClick={() => {
                  soundEngine.playUiClick();
                  setMenuState('play_options');
                }}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-red-700 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-pixel text-sm sm:text-base rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.6)] border-2 border-yellow-400 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 group animate-pulse"
              >
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>COMEÇAR</span>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-0.5">
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    onOpenSettings();
                  }}
                  className="py-2 bg-black/85 hover:bg-neutral-900 text-gray-200 font-pixel text-[9px] sm:text-[10px] rounded-xl border border-neutral-700 shadow-lg cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Settings className="w-3.5 h-3.5 text-yellow-400" />
                  AJUSTES
                </button>
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    onOpenGuide();
                  }}
                  className="py-2 bg-black/85 hover:bg-neutral-900 text-gray-200 font-pixel text-[9px] sm:text-[10px] rounded-xl border border-neutral-700 shadow-lg cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  GUIA
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Play Options matching screenshot 2 */
            <div className="flex flex-col gap-2 animate-fadeIn">
              {hasSave ? (
                <button
                  onClick={() => handleLaunchGame(false)}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-pixel text-xs sm:text-sm rounded-xl border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  CONTINUAR JOGO
                </button>
              ) : (
                <div className="py-2 bg-black/60 text-gray-500 font-pixel text-[9px] rounded-xl border border-neutral-800 text-center">
                  (NENHUM JOGO SALVO ANTERIORMENTE)
                </div>
              )}

              <button
                data-newgame="true"
                onClick={() => handleLaunchGame(true)}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-pixel text-xs sm:text-sm rounded-xl border-2 border-yellow-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                CRIAR NOVO MAPA
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onOpenSettings();
                }}
                className="w-full py-2 bg-black/85 hover:bg-neutral-900 text-yellow-300 font-pixel text-[10px] rounded-xl border border-neutral-700 shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                CONFIGURAÇÕES
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setMenuState('initial');
                }}
                className="w-full py-1.5 bg-black/50 hover:bg-black/75 text-gray-300 font-pixel text-[9px] rounded-lg border border-white/10 cursor-pointer active:scale-95 transition-all"
              >
                &gt;&gt; VOLTAR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM MOBILE SURVIVAL QUICK BAR (100% Mobile focused) */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-lg flex items-center justify-around bg-black/90 px-3 py-1.5 sm:py-2 rounded-2xl border border-neutral-800 shadow-2xl shrink-0">
        <button 
          onClick={() => setInfoModal('🏆 Conquistas do Sobrevivente: Colete recursos, forje armas e explore as cavernas para desbloquear troféus!')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-yellow-400 active:scale-95 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span className="font-pixel text-[7px] sm:text-[8px]">CONQUISTAS</span>
        </button>

        <button 
          onClick={() => setInfoModal('📊 Ranking Global: Sobreviva ao maior número de dias e derrote chefes para subir de posição!')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-amber-400 active:scale-95 transition-all cursor-pointer"
        >
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <span className="font-pixel text-[7px] sm:text-[8px]">RANKING</span>
        </button>

        <button 
          onClick={() => setInfoModal('👕 Skins & Customização: Desbloqueie capas, elmos e visuais exclusivos completando missões!')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-cyan-400 active:scale-95 transition-all cursor-pointer"
        >
          <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          <span className="font-pixel text-[7px] sm:text-[8px]">SKINS</span>
        </button>

        <button 
          onClick={() => onOpenGuide()}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          <span className="font-pixel text-[7px] sm:text-[8px]">GUIA/LOJA</span>
        </button>
      </div>

      {/* Info modal popup for mobile buttons */}
      {infoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border-2 border-neutral-700 p-5 rounded-2xl max-w-sm text-center shadow-2xl animate-fadeIn">
            <p className="text-gray-200 text-xs sm:text-sm font-sans mb-4 leading-relaxed">{infoModal}</p>
            <button
              onClick={() => setInfoModal(null)}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs rounded-xl cursor-pointer"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
