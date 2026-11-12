import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sliders, Trash2 } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { clearSavedGame } from '../game/saveManager';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [sfxVol, setSfxVol] = useState(soundEngine.sfxVolume);
  const [musicVol, setMusicVol] = useState(soundEngine.musicVolume);
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState(false);

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundEngine.setVolumes(1, val, musicVol);
    soundEngine.playUiClick();
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    soundEngine.setVolumes(1, sfxVol, val);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleClearSave = () => {
    clearSavedGame();
    setConfirmDelete(false);
    setDeletedMsg(true);
    setTimeout(() => setDeletedMsg(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 select-none touch-none">
      <div className="bg-neutral-950 border-2 border-neutral-700/80 rounded-2xl w-full max-w-md p-5 flex flex-col shadow-2xl font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-yellow-400" />
            <h2 className="font-pixel text-xs sm:text-sm text-white">AJUSTES DO JOGO</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800 cursor-pointer transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="flex flex-col gap-4 my-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300">Áudio Geral</span>
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                isMuted ? 'bg-red-950/60 border-red-800 text-red-300' : 'bg-neutral-900 border-neutral-700 text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
              <span>{isMuted ? 'MUDO ATIVADO' : 'SOM ATIVO'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-neutral-300 font-mono">
              <span>Efeitos Sonoros (SFX)</span>
              <span className="font-bold tabular-nums text-white">{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxChange}
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-neutral-300 font-mono">
              <span>Música Ambiente (BGM)</span>
              <span className="font-bold tabular-nums text-white">{Math.round(musicVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVol}
              onChange={handleMusicChange}
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Save Data Management */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col gap-2">
          <span className="text-xs font-bold text-neutral-400 font-mono">DADOS SALVOS NO DISPOSITIVO</span>
          
          {deletedMsg ? (
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-center text-xs font-pixel">
              ✓ Dados do mapa limpos com sucesso!
            </div>
          ) : !confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2 bg-neutral-900 hover:bg-red-950 text-red-400 hover:text-white border border-neutral-800 hover:border-red-800 rounded-xl text-xs font-pixel flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>APAGAR PROGRESSO SALVO</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 p-3 bg-red-950/30 border border-red-800 rounded-xl">
              <span className="text-xs text-red-300 text-center">Tem certeza? Isso apagará seu mundo salvo.</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-1.5 bg-neutral-900 text-neutral-300 rounded-lg text-xs font-pixel cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleClearSave}
                  className="py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-pixel cursor-pointer"
                >
                  SIM, APAGAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
