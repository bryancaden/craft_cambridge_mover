import React from 'react';
import { CharacterConfig, CharacterGender } from '../types/game';
import { soundFx } from '../utils/soundEffects';

interface CharacterCustomizerProps {
  config: CharacterConfig;
  onChangeConfig: (newConfig: CharacterConfig) => void;
  onClose: () => void;
}

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  config,
  onChangeConfig,
  onClose,
}) => {
  const shirtColors = [
    { label: 'Cobalt Blue', value: '#2563eb' },
    { label: 'Emerald Green', value: '#16a34a' },
    { label: 'Crimson Red', value: '#dc2626' },
    { label: 'Sunflower Yellow', value: '#eab308' },
    { label: 'Purple Violet', value: '#9333ea' },
    { label: 'Deep Slate', value: '#1e293b' },
  ];

  const hairColors = [
    { label: 'Chestnut Brown', value: '#5c3a21' },
    { label: 'Golden Blonde', value: '#d97706' },
    { label: 'Raven Black', value: '#18181b' },
    { label: 'Ginger Orange', value: '#ea580c' },
  ];

  const pantsColors = [
    { label: 'Jeans Blue', value: '#1d4ed8' },
    { label: 'Charcoal', value: '#334155' },
    { label: 'Khaki Olive', value: '#4d7c0f' },
    { label: 'Cyan Teal', value: '#0891b2' },
  ];

  const skinTones = [
    { label: 'Fair', value: '#fed7aa' },
    { label: 'Warm Beige', value: '#fcd34d' },
    { label: 'Caramel', value: '#b45309' },
    { label: 'Espresso', value: '#78350f' },
  ];

  const accessories: { key: CharacterConfig['accessory']; label: string; icon: string }[] = [
    { key: 'none', label: 'None', icon: '👤' },
    { key: 'miner_helmet', label: 'Miner Hat', icon: '⛏️' },
    { key: 'crown', label: 'Golden Crown', icon: '👑' },
    { key: 'flower_crown', label: 'Red Flower', icon: '🌺' },
  ];

  const handleGenderSelect = (gender: CharacterGender) => {
    soundFx.playClick();
    onChangeConfig({
      ...config,
      gender,
      name: gender === 'boy' ? (config.name === 'Mia' ? 'Leo' : config.name) : (config.name === 'Leo' ? 'Mia' : config.name),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-2xl">
              🧑‍🚀
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Choose Your 3D Explorer</h2>
              <p className="text-xs text-indigo-300">Customize your Cambridge Movers hero character</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Gender Selection */}
        <div className="mt-5">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Character Style</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              onClick={() => handleGenderSelect('boy')}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                config.gender === 'boy'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="text-3xl">👦</span>
              <div className="text-left">
                <div className="font-bold text-white text-base">Boy Explorer</div>
                <div className="text-xs text-blue-300">Adventurous & energetic</div>
              </div>
            </button>

            <button
              onClick={() => handleGenderSelect('girl')}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                config.gender === 'girl'
                  ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="text-3xl">👧</span>
              <div className="text-left">
                <div className="font-bold text-white text-base">Girl Explorer</div>
                <div className="text-xs text-rose-300">Curious & creative</div>
              </div>
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div className="mt-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Explorer Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => onChangeConfig({ ...config, name: e.target.value })}
            className="w-full mt-1.5 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500"
            maxLength={16}
          />
        </div>

        {/* Shirt Color */}
        <div className="mt-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Shirt Color</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {shirtColors.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  soundFx.playClick();
                  onChangeConfig({ ...config, shirtColor: item.value });
                }}
                className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                  config.shirtColor === item.value ? 'scale-110 border-white shadow-lg' : 'border-black/30'
                }`}
                style={{ backgroundColor: item.value }}
                title={item.label}
              />
            ))}
          </div>
        </div>

        {/* Hair Color */}
        <div className="mt-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Hair Color</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {hairColors.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  soundFx.playClick();
                  onChangeConfig({ ...config, hairColor: item.value });
                }}
                className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                  config.hairColor === item.value ? 'scale-110 border-white shadow-lg' : 'border-black/30'
                }`}
                style={{ backgroundColor: item.value }}
                title={item.label}
              />
            ))}
          </div>
        </div>

        {/* Skin Tone */}
        <div className="mt-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Skin Tone</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {skinTones.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  soundFx.playClick();
                  onChangeConfig({ ...config, skinColor: item.value });
                }}
                className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                  config.skinColor === item.value ? 'scale-110 border-white shadow-lg' : 'border-black/30'
                }`}
                style={{ backgroundColor: item.value }}
                title={item.label}
              />
            ))}
          </div>
        </div>

        {/* Pants Color */}
        <div className="mt-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Pants Color</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {pantsColors.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  soundFx.playClick();
                  onChangeConfig({ ...config, pantsColor: item.value });
                }}
                className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                  config.pantsColor === item.value ? 'scale-110 border-white shadow-lg' : 'border-black/30'
                }`}
                style={{ backgroundColor: item.value }}
                title={item.label}
              />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="mt-4">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Hat / Accessory</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {accessories.map((acc) => (
              <button
                key={acc.key}
                onClick={() => {
                  soundFx.playClick();
                  onChangeConfig({ ...config, accessory: acc.key });
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                  config.accessory === acc.key
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span>{acc.icon}</span>
                <span>{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30"
          >
            Ready to Build & Learn!
          </button>
        </div>
      </div>
    </div>
  );
};
