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

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundEngine.setVolumes(1, val, musicVol);
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
    if (confirm('Tem certeza que deseja apagar todo o progresso salvo?')) {
      clearSavedGame();
      alert('Progresso salvo apagado com sucesso.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
      <div className="bg-[#171926] border-2 border-[#4b4e6d] rounded-2xl w-full max-w-md p-6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2b2e42]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-yellow-400" />
            <h2 className="font-pixel text-sm md:text-base text-yellow-400">AJUSTES DO JOGO</h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#25283b] hover:bg-rose-900/60 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="flex flex-col gap-4 my-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Som Mudo (Mute)</span>
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-lg border flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                isMuted ? 'bg-rose-950 border-rose-700 text-rose-300' : 'bg-[#202436] border-[#3b3f5c] text-emerald-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'MUDO ATIVADO' : 'SOM ATIVO'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Efeitos Sonoros (SFX)</span>
              <span className="font-bold tabular-nums">{Math.round(sfxVol * 100)}%</span>
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
            <div className="flex justify-between text-xs text-gray-300">
              <span>Música Chiptune</span>
              <span className="font-bold tabular-nums">{Math.round(musicVol * 100)}%</span>
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

        {/* Clear Data */}
        <div className="pt-4 border-t border-[#2b2e42] flex justify-between items-center">
          <span className="text-[11px] text-gray-400">Apagar Dados Salvos</span>
          <button
            onClick={handleClearSave}
            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Salvo
          </button>
        </div>
      </div>
    </div>
  );
};
