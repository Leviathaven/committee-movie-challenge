/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Film, Lock, Sparkles, Clock, Eye } from 'lucide-react';
import { ChallengeConfig, MovieTopic } from '../types';

interface ChallengeBoardProps {
  config: ChallengeConfig;
  onUpdateTopic: (topicId: number, updated: Partial<MovieTopic>) => void;
  onTriggerReveal: (topic: MovieTopic) => void;
  onGoBackToWorkspace: () => void;
  showAdminAccess?: boolean;
}

export default function ChallengeBoard({
  config,
  onUpdateTopic,
  onTriggerReveal,
  onGoBackToWorkspace,
  showAdminAccess = false,
}: ChallengeBoardProps) {
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [shakingId, setShakingId] = useState<number | null>(null);

  // Tick the clock to update countdown countdowns in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalTopics = config.topics.length;
  const revealedCount = config.topics.filter(t => t.isRevealedByUser).length;

  // Find the next upcoming reveal topic
  const nextTargetTopic = config.topics
    .filter(t => new Date(t.revealAt).getTime() > nowTime)
    .sort((a, b) => new Date(a.revealAt).getTime() - new Date(b.revealAt).getTime())[0];

  // Helper to format countdown string in Russian
  const getCountdownString = (revealAtStr: string) => {
    const diff = new Date(revealAtStr).getTime() - nowTime;
    if (diff <= 0) return 'Готов к открытию!';

    const secs = Math.floor((diff / 1000) % 60);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}дн`);
    if (hours > 0) parts.push(`${hours}ч`);
    if (mins > 0) parts.push(`${mins}мин`);
    parts.push(`${secs}сек`);

    return parts.join(' ');
  };

  const triggerLockedShake = (id: number) => {
    setShakingId(id);
    setTimeout(() => setShakingId(null), 500);
  };

  return (
    <div className="w-full space-y-8 pb-16 font-sans">
      
      {/* Progress metrics and workspace action row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Zone 1: Total Topics Card */}
        <div className="p-5 rounded-3xl bg-vibrant-blue border-4 border-black flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-3 bg-white rounded-2xl text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-2xl">
            🎬
          </div>
          <div>
            <span className="block text-xs text-black/90 font-mono font-black uppercase tracking-wide">Всего тем на доске</span>
            <span className="text-3xl font-display font-black text-black">{totalTopics}</span>
          </div>
        </div>

        {/* Zone 2: Reveal Progress Card */}
        <div className="p-5 rounded-3xl bg-vibrant-lime border-4 border-black flex flex-col justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="block text-xs text-black/90 font-mono font-black uppercase tracking-wide">Прогресс открытий</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-display font-black text-black">
              {totalTopics > 0 ? Math.round((revealedCount / totalTopics) * 100) : 0}%
            </span>
            <span className="text-xs text-black/85 font-mono font-bold">
              {revealedCount} из {totalTopics}
            </span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden mt-1.5 border-2 border-black">
            <div 
              className="h-full bg-vibrant-pink rounded-full transition-all duration-500"
              style={{ width: `${totalTopics > 0 ? (revealedCount / totalTopics) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Zone 3: Countdown to Nearest Reveal */}
        <div className="p-5 rounded-3xl bg-vibrant-gold border-4 border-black flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-3 bg-white rounded-2xl text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-2xl">
            ⏳
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs text-black/90 font-mono font-black uppercase tracking-wide">Ближайшее раскрытие</span>
            {nextTargetTopic ? (
              <span className="text-lg sm:text-xl font-mono font-black text-black tracking-tight block truncate animate-pulse mt-0.5" title={getCountdownString(nextTargetTopic.revealAt)}>
                {getCountdownString(nextTargetTopic.revealAt)}
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-display font-black text-black mt-0.5 block">Все темы раскрыты!</span>
            )}
          </div>
        </div>

      </div>

      {/* Action Button: Settings workspace if admin is allowed */}
      {showAdminAccess && (
        <div className="p-4 rounded-3xl bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={onGoBackToWorkspace}
            className="w-full py-3.5 bg-vibrant-cyan hover:bg-cyan-200 text-xs font-display font-black tracking-wider uppercase text-black rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            id="board-workspace-back-btn"
          >
            ⚙️ Кабинет Организатора
          </button>
        </div>
      )}

      {/* Grid of film Frame tickets */}
      <div className="space-y-6">
        <h2 className="text-sm font-display font-black text-black uppercase tracking-wider flex items-center gap-2">
          <Film className="w-5 h-5 text-vibrant-pink" />
          <span>Сетка Киночелленджа</span>
        </h2>

        {totalTopics === 0 ? (
          <div className="p-12 text-center bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-3xl block mb-2">🎈</span>
            <h3 className="text-base font-black uppercase text-black">Доска челленджа пуста</h3>
            <p className="text-xs text-gray-600 font-bold mt-1">
              Перейдите в "Кабинет Организатора" выше, чтобы добавить карточки тем или загрузить готовый пак!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {config.topics.map((t) => {
              const unlockTimestamp = new Date(t.revealAt).getTime();
              const isAvailableLocal = nowTime >= unlockTimestamp;

              // RENDER STATUS A: Still locked by schedule timers
              if (!isAvailableLocal && !t.isRevealedByUser) {
                const isShaking = shakingId === t.id;

                return (
                  <motion.div
                    key={t.id}
                    onClick={() => triggerLockedShake(t.id)}
                    animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0], rotate: [-2, 2, -1, 1, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="group relative select-none min-h-[250px] bg-gray-100 border-4 border-black rounded-2xl flex flex-col justify-between p-4 cursor-pointer text-center hover:border-black transition duration-150 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    id={`board-slot-locked-${t.id}`}
                  >
                    <div className="flex items-center justify-between w-full border-b border-dashed border-black/20 pb-1.5 flex-shrink-0">
                      <span className="font-display font-black text-xs text-gray-500">#{t.id}</span>
                      <div className="flex items-center gap-1 bg-white border border-black px-1.5 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                        <span className="text-[7px] font-mono tracking-wider font-extrabold uppercase text-gray-500">
                          БЛОК
                        </span>
                      </div>
                    </div>

                    {/* Hint Image (Locked State) */}
                    {t.hintImage && (
                      <div className="w-full h-20 rounded-xl overflow-hidden border-2 border-black/30 bg-white my-1.5 flex-shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                        <img 
                          src={t.hintImage} 
                          alt="Hint preview" 
                          className="w-full h-full object-cover grayscale opacity-60" 
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as any).style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div className="my-auto py-1 w-full flex-grow flex items-center justify-center">
                      <p className="text-xs sm:text-xs text-gray-600 font-bold leading-tight text-center line-clamp-4 italic">
                        {t.hint ? `Подсказка: ${t.hint}` : "Секретная наводка на тему..."}
                      </p>
                    </div>

                    <div className="w-full mt-auto pt-2 border-t border-dashed border-black/10 flex flex-col items-center flex-shrink-0">
                      <span className="block text-[7px] font-mono text-gray-400 font-extrabold uppercase mb-0.5">
                        ОТКРОЕТСЯ ЧЕРЕЗ:
                      </span>
                      <span className="inline-block text-[9px] font-mono font-bold text-vibrant-pink tracking-tight leading-none px-2 py-1 bg-white border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] max-w-full truncate animate-pulse">
                        {getCountdownString(t.revealAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              }

              // RENDER STATUS B: Unlocked but NOT YET revealed by the movie user
              if (!t.isRevealedByUser) {
                return (
                  <button
                    key={t.id}
                    onClick={() => onTriggerReveal(t)}
                    className="group relative select-none min-h-[250px] bg-vibrant-gold border-4 border-black rounded-2xl flex flex-col justify-between p-4 cursor-pointer text-center transition-all duration-155 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    id={`board-slot-ready-${t.id}`}
                  >
                    <div className="flex items-center justify-between w-full border-b border-dashed border-black/30 pb-1.5 flex-shrink-0">
                      <span className="font-display font-black text-xs text-black">#{t.id}</span>
                      <span className="text-[8px] font-mono tracking-wider font-extrabold uppercase bg-white border border-black px-1.5 py-0.5 rounded">
                        ГОТОВО
                      </span>
                    </div>

                    {/* Hint Image (Standby Reveal State) */}
                    {t.hintImage && (
                      <div className="w-full h-20 rounded-xl overflow-hidden border-2 border-black bg-white my-1.5 flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <img 
                          src={t.hintImage} 
                          alt="Hint preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as any).style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div className="my-auto py-1 w-full flex-grow flex items-center justify-center">
                      <p className="text-xs sm:text-xs text-black font-extrabold leading-tight text-center line-clamp-4">
                        {t.hint ? `Подсказка: ${t.hint}` : "Секретная наводка на тему..."}
                      </p>
                    </div>

                    <div className="w-full mt-auto pt-1 flex-shrink-0">
                      <div className="w-full bg-black text-white rounded-full py-1.5 text-[9px] font-display font-black uppercase tracking-wider group-hover:bg-vibrant-pink group-hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5">
                        <span>Раскрыть тему ▲</span>
                      </div>
                    </div>
                  </button>
                );
              }

              // RENDER STATUS C: FULLY REVEALED
              return (
                <div
                  key={t.id}
                  className="flex flex-col justify-between p-4 min-h-[250px] bg-white border-4 border-black rounded-2xl relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-150"
                  id={`board-slot-revealed-${t.id}`}
                >
                  <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-gray-500 font-bold border-b border-dashed border-gray-200 pb-1.5 flex-shrink-0">
                    <span className="font-display font-black text-xs text-vibrant-pink">#{t.id}</span>
                    <span className="uppercase text-[7px] tracking-tight">{t.revealAnimationType}</span>
                  </div>

                  {/* Topic Core Image (Revealed State) */}
                  {t.image && (
                    <div className="w-full h-20 rounded-xl overflow-hidden border-2 border-black bg-gray-50 my-1.5 flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <img 
                        src={t.image} 
                        alt={t.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Core Revealed Text */}
                  <div className="relative z-10 my-auto py-1 flex-grow flex items-center justify-center">
                    <p className="text-xs sm:text-xs text-black font-extrabold font-display leading-tight text-center line-clamp-5">
                      {t.title}
                    </p>
                  </div>

                  {/* Bottom custom black author pill matching requested style */}
                  <div className="relative z-10 mt-auto pt-1.5 border-t border-dashed border-gray-200 flex-shrink-0">
                    {t.author ? (
                      <div 
                        className="w-full bg-black text-white text-center rounded-full py-1.5 px-3 text-[9px] font-display font-black uppercase tracking-wider leading-none truncate shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,0.15)] hover:bg-vibrant-pink hover:text-black transition-colors cursor-help"
                        title={`Эту классную тему предложил: ${t.author}`}
                      >
                        АВТОР: {t.author} ▲
                      </div>
                    ) : (
                      <div className="w-full bg-vibrant-lime text-black border-2 border-black text-center rounded-full py-1 text-[8px] font-display font-black uppercase tracking-wider leading-none">
                        ОТКРЫТО 🎉 ▲
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
