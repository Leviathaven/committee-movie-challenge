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
}

export default function ChallengeBoard({
  config,
  onUpdateTopic,
  onTriggerReveal,
  onGoBackToWorkspace,
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
      
      {/* Board Masthead banner */}
      <div className="relative text-left p-6 sm:p-8 md:p-10 bg-vibrant-gold border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-full text-xs font-black uppercase tracking-wider text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-4 h-4 text-vibrant-pink fill-current" />
            <span>Летний Киночеллендж Комитета</span>
          </div>

          <h1 className="text-2xl sm:text-3.5xl md:text-4.5xl font-display font-black tracking-tighter text-black uppercase leading-none">
            {config.challengeTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              👤 Организатор: {config.creatorName}
            </span>
            <span className="bg-vibrant-lime border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              🎬 {totalTopics} тем на доске
            </span>
          </div>

          {/* Master Stagger Countdown Timer */}
          {nextTargetTopic && (
            <div className="inline-flex items-center gap-2 p-3 bg-white border-2 border-black rounded-xl text-xs font-mono font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Clock className="w-4 h-4 text-vibrant-pink" />
              <span className="text-gray-500 uppercase">СЛЕДУЮЩЕЕ ОТКРЫТИЕ ЧЕРЕЗ:</span>
              <span className="text-vibrant-pink font-bold tracking-wider animate-pulse">
                {getCountdownString(nextTargetTopic.revealAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress metrics and workspace action row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric A: Revealed ratio */}
        <div className="p-5 rounded-3xl bg-vibrant-blue border-4 border-black flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-3 bg-white rounded-2xl text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Eye className="w-6 h-6 text-vibrant-pink" />
          </div>
          <div>
            <span className="block text-xs text-gray-700 font-extrabold uppercase tracking-wide">Доступные категории</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-display font-black text-black">{revealedCount}</span>
              <span className="text-sm text-gray-700 font-mono font-bold">/ {totalTopics} Открыто</span>
            </div>
          </div>
        </div>

        {/* Metric B: Brief summary of progress */}
        <div className="p-5 rounded-3xl bg-vibrant-lime border-4 border-black flex flex-col justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="block text-xs text-gray-700 font-extrabold uppercase tracking-wide">Прогресс открытий</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-display font-black text-black">
              {totalTopics > 0 ? Math.round((revealedCount / totalTopics) * 100) : 0}%
            </span>
            <span className="text-xs text-black/85 font-mono">
              Раскрыто тем: {revealedCount} из {totalTopics}
            </span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden mt-2 border-2 border-black">
            <div 
              className="h-full bg-vibrant-pink rounded-full transition-all duration-500"
              style={{ width: `${totalTopics > 0 ? (revealedCount / totalTopics) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Action Button: Settings workspace */}
        <div className="p-4 rounded-3xl bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={onGoBackToWorkspace}
            className="w-full py-3.5 bg-vibrant-cyan hover:bg-cyan-200 text-xs font-display font-black tracking-wider uppercase text-black rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            id="board-workspace-back-btn"
          >
            ⚙️ Кабинет Организатора
          </button>
        </div>

      </div>

      {/* Grid of film Frame tickets formatted EXACTLY in 5 columns */}
      <div className="space-y-6">
        <h2 className="text-sm font-display font-black text-black uppercase tracking-wider flex items-center gap-2">
          <Film className="w-5 h-5 text-vibrant-pink" />
          <span>Сетка Киночелленджа (Строки по 5 штук)</span>
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

              // Render according to reveal state status
              // STATUS A: Still locked by schedule timers
              if (!isAvailableLocal && !t.isRevealedByUser) {
                const isShaking = shakingId === t.id;

                return (
                  <motion.div
                    key={t.id}
                    onClick={() => triggerLockedShake(t.id)}
                    animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0], rotate: [-2, 2, -1, 1, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="group relative select-none aspect-square bg-gray-100 border-4 border-black rounded-2xl flex flex-col justify-between p-4 cursor-pointer text-center hover:border-black transition duration-150 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    id={`board-slot-locked-${t.id}`}
                  >
                    <div className="flex items-center justify-between w-full border-b border-dashed border-black/20 pb-1">
                      <span className="font-display font-black text-xs text-gray-500">#{t.id}</span>
                      <div className="flex items-center gap-1 bg-white border border-black px-1.5 rounded py-0.5">
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                        <span className="text-[7px] font-mono tracking-wider font-extrabold uppercase text-gray-500">
                          ПОДСКАЗКА
                        </span>
                      </div>
                    </div>

                    <div className="my-auto py-2 w-full">
                      <p className="text-xs sm:text-sm text-gray-700 font-bold leading-tight text-center line-clamp-3 italic">
                        {t.hint || "Секретная наводка на тему..."}
                      </p>
                    </div>

                    <div className="w-full mt-auto pt-1 flex flex-col items-center">
                      <span className="block text-[8px] font-mono text-gray-400 font-extrabold uppercase mb-1">
                        ОТКРОЕТСЯ ЧЕРЕЗ:
                      </span>
                      <span className="inline-block text-[9px] font-mono font-bold text-vibrant-pink tracking-tight leading-none px-2 py-1 bg-white border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] max-w-full truncate animate-pulse">
                        {getCountdownString(t.revealAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              }

              // STATUS B: Unlocked but NOT YET revealed by the movie user
              if (!t.isRevealedByUser) {
                return (
                  <button
                    key={t.id}
                    onClick={() => onTriggerReveal(t)}
                    className="group relative aspect-square bg-vibrant-gold border-4 border-black rounded-2xl flex flex-col justify-between p-4 cursor-pointer text-center transition-all duration-150 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    id={`board-slot-ready-${t.id}`}
                  >
                    <div className="flex items-center justify-between w-full border-b border-dashed border-black/30 pb-1">
                      <span className="font-display font-black text-xs text-black">#{t.id}</span>
                      <span className="text-[8px] font-mono tracking-wider font-extrabold uppercase bg-white border border-black px-1.5 rounded">
                        ПОДСКАЗКА
                      </span>
                    </div>

                    <div className="my-auto py-2 w-full">
                      <p className="text-xs sm:text-sm text-black font-extrabold leading-tight text-center line-clamp-3">
                        {t.hint || "Секретная наводка на тему..."}
                      </p>
                    </div>

                    <div className="w-full mt-auto pt-1 bg-black text-white rounded-xl py-1.5 text-[9px] font-display font-black uppercase tracking-wider group-hover:bg-vibrant-pink group-hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      Раскрыть тему ▲
                    </div>
                  </button>
                );
              }

              // STATUS C: FULLY REVEALED - EXTREMELY CLEAN VIEW METRIC NO EXTRA MARK BUTTON
              return (
                <div
                  key={t.id}
                  className="flex flex-col justify-between p-4 aspect-square bg-white border-4 border-black rounded-2xl relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-150"
                  id={`board-slot-revealed-${t.id}`}
                >
                  <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-gray-500 font-bold border-b-2 border-dashed border-gray-200 pb-1.5">
                    <span className="font-display font-black text-xs text-vibrant-pink">#{t.id}</span>
                    <span className="uppercase text-[8px] tracking-tight">{t.revealAnimationType}</span>
                  </div>

                  {/* Core Revealed Text */}
                  <div className="relative z-10 my-auto py-2">
                    <p className="text-xs sm:text-sm text-black font-extrabold font-display leading-tight line-clamp-5">
                      {t.title}
                    </p>
                  </div>

                  {/* Bottom static cute card info resembling ticket coupon stub */}
                  <div className="relative z-10 mt-auto pt-2 border-t-2 border-black text-center">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase text-vibrant-pink">
                      <Sparkles className="w-3 h-3 fill-current text-amber-500" />
                      ТЕМА ОТКРЫТА
                    </span>
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
