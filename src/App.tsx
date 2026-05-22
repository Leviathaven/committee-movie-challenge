/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Film, KanbanSquare, Settings, Play, Award } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ChallengeConfig, MovieTopic } from './types';
import AdminConfig from './components/AdminConfig';
import ChallengeBoard from './components/ChallengeBoard';
import TopicDetailsModal from './components/TopicDetailsModal';
import InteractiveRevealer from './components/InteractiveRevealer';

const LOCAL_STORAGE_KEY = 'summer_movie_challenge_config';

export default function App() {
  const [config, setConfig] = useState<ChallengeConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.topics && Array.isArray(parsed.topics)) {
          // If it's the old 35 topics or English name, we reset to the new default
          if (parsed.challengeTitle === "Ultimate Summer Cinema Challenge" || parsed.topics.length === 35) {
            // Fall through to Russian default
          } else {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("Could not load saved configuration. Restoring defaults.", e);
    }

    return {
      challengeTitle: "5-й Ежегодный Летний Киночеллендж Комитета",
      creatorName: "Комитет",
      topics: [],
    };
  });

  const [mode, setMode] = useState<'board' | 'creator'>('board');
  const [activeRevealTopic, setActiveRevealTopic] = useState<MovieTopic | null>(null);
  const [activeEditTopic, setActiveEditTopic] = useState<MovieTopic | null>(null);

  // Sync state to local storage automatically
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Failed to commit configurations to LocalStorage storage limits.", e);
    }
  }, [config]);

  // Update whole config state
  const handleUpdateConfig = (newConfig: ChallengeConfig) => {
    setConfig(newConfig);
  };

  // Update single topic field values
  const handleUpdateTopic = (topicId: number, updatedFields: Partial<MovieTopic>) => {
    const updatedTopics = config.topics.map((t) => {
      if (t.id === topicId) {
        return { ...t, ...updatedFields };
      }
      return t;
    });
    setConfig({
      ...config,
      topics: updatedTopics,
    });
  };

  // Launch animation trigger
  const handleTriggerReveal = (topic: MovieTopic) => {
    setActiveRevealTopic(topic);
  };

  // Finished scratch / pop animation -> save unlocked state
  const handleRevealComplete = () => {
    if (activeRevealTopic) {
      handleUpdateTopic(activeRevealTopic.id, { isRevealedByUser: true });
      setActiveRevealTopic(null);
    }
  };

  // Click single square edit handler
  const handleEditSlot = (id: number) => {
    const target = config.topics.find((t) => t.id === id);
    if (target) {
      setActiveEditTopic(target);
    }
  };

  // Save single square details modal edit
  const handleSaveDetails = (updatedFields: Partial<MovieTopic>) => {
    if (activeEditTopic) {
      handleUpdateTopic(activeEditTopic.id, updatedFields);
    }
  };

  return (
    <div className="min-h-screen bg-vibrant-yellow text-black font-sans flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Main App Navigation Wrapper */}
      <header className="sticky top-0 z-30 bg-white border-4 border-black rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-7xl w-full mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo / Brand Name */}
        <div className="flex items-center gap-4 select-none">
          <div className="bg-vibrant-pink p-3 rounded-2xl transform -rotate-3 border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xl">🎬</span>
          </div>
          <div>
            <span className="font-display font-black text-xl sm:text-2xl tracking-tighter text-black uppercase block leading-none">
              5-й Летний Киночеллендж Комитета
            </span>
          </div>
        </div>

        {/* Nav controller options selection */}
        <div className="flex items-center bg-white border-2 border-black p-1 rounded-xl gap-1">
          <button
            onClick={() => setMode('board')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-display font-black uppercase transition-all duration-150 cursor-pointer ${
              mode === 'board'
                ? 'bg-vibrant-pink text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-black hover:bg-gray-100'
            }`}
            id="nav-board-mode-btn"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Доска Челленджа</span>
          </button>
          <button
            onClick={() => setMode('creator')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-display font-black uppercase transition-all duration-150 cursor-pointer ${
              mode === 'creator'
                ? 'bg-vibrant-pink text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-black hover:bg-gray-100'
            }`}
            id="nav-creator-mode-btn"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Панель Организатора</span>
          </button>
        </div>

      </header>

      {/* Primary body screen switcher */}
      <main className="flex-1 w-full max-w-7xl mx-auto relative">
        {mode === 'creator' ? (
          <AdminConfig
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onEditSlot={handleEditSlot}
            onViewBoard={() => setMode('board')}
          />
        ) : (
          <ChallengeBoard
            config={config}
            onUpdateTopic={handleUpdateTopic}
            onTriggerReveal={handleTriggerReveal}
            onGoBackToWorkspace={() => setMode('creator')}
          />
        )}
      </main>

      {/* Global Modals Portal Container */}
      <AnimatePresence>
        {/* Modal A: Interactive topic microgames animations */}
        {activeRevealTopic && (
          <InteractiveRevealer
            topic={activeRevealTopic}
            onRevealComplete={handleRevealComplete}
            onClose={() => setActiveRevealTopic(null)}
          />
        )}

        {/* Modal B: Individual topic slot settings editor */}
        {activeEditTopic && (
          <TopicDetailsModal
            topic={activeEditTopic}
            onSave={handleSaveDetails}
            onClose={() => setActiveEditTopic(null)}
            onDelete={(id) => {
              handleUpdateConfig({
                ...config,
                topics: config.topics.filter(t => t.id !== id)
              });
              setActiveEditTopic(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Tiny descriptive subtle footer resembling design theme */}
      <footer className="w-full max-w-7xl mx-auto mt-8 pt-4 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center text-xs font-black uppercase text-black gap-2">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-vibrant-lime border-2 border-black rounded-full"></span>
            <span>Раскрыто тем: {config.topics.filter(t => t.isRevealedByUser).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-white border-2 border-black border-dashed rounded-full"></span>
            <span>Заблокировано тем: {config.topics.filter(t => !t.isRevealedByUser).length}</span>
          </div>
        </div>
        <div>
          СПЕЦИАЛЬНО ДЛЯ ЧЛЕНОВ КОМИТЕТА v5.0
        </div>
      </footer>

    </div>
  );
}
