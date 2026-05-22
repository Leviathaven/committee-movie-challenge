/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Film, KanbanSquare, Settings, Play, Award, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ChallengeConfig, MovieTopic } from './types';
import AdminConfig from './components/AdminConfig';
import ChallengeBoard from './components/ChallengeBoard';
import TopicDetailsModal from './components/TopicDetailsModal';
import InteractiveRevealer from './components/InteractiveRevealer';

import { doc, collection, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './lib/firebase';

const LOCAL_STORAGE_KEY = 'summer_movie_challenge_config';

export default function App() {
  const [challengeDoc, setChallengeDoc] = useState<{ challengeTitle: string; creatorName: string } | null>(null);
  const [topics, setTopics] = useState<MovieTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'board' | 'creator'>('board');
  const [activeRevealTopic, setActiveRevealTopic] = useState<MovieTopic | null>(null);
  const [activeEditTopic, setActiveEditTopic] = useState<MovieTopic | null>(null);

  const seedingInProgress = useRef(false);

  // Sync with Firestore in real-time
  useEffect(() => {
    const unsubChallenge = onSnapshot(
      doc(db, "challenges", "default"),
      async (snapshot) => {
        if (snapshot.exists()) {
          setChallengeDoc(snapshot.data() as { challengeTitle: string; creatorName: string });
          setLoading(false);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "challenges/default");
      }
    );

    const unsubTopics = onSnapshot(
      collection(db, "challenges", "default", "topics"),
      async (snapshot) => {
        const loadedTopics: MovieTopic[] = [];
        snapshot.forEach((docSnap) => {
          loadedTopics.push(docSnap.data() as MovieTopic);
        });

        // Sort topics by id ascending
        loadedTopics.sort((a, b) => a.id - b.id);

        if (loadedTopics.length === 0 && !snapshot.metadata.fromCache && !seedingInProgress.current) {
          seedingInProgress.current = true;
          try {
            // Check for existing localStorage data to migrate
            let topicsToSeed: MovieTopic[] = [];
            let challengeTitleToSeed = "5-й Ежегодный Летний Киночеллендж Комитета";
            let creatorNameToSeed = "Комитет";

            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.topics && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
                topicsToSeed = parsed.topics;
                if (parsed.challengeTitle) challengeTitleToSeed = parsed.challengeTitle;
                if (parsed.creatorName) creatorNameToSeed = parsed.creatorName;
              }
            }

            // Default topics if local storage is empty
            if (topicsToSeed.length === 0) {
              const { generateDefaultTopics } = await import('./data/defaultTopics');
              topicsToSeed = generateDefaultTopics(new Date(), 'immediate');
            }

            // Write base challenge details
            await setDoc(doc(db, "challenges", "default"), {
              challengeTitle: challengeTitleToSeed,
              creatorName: creatorNameToSeed,
            });

            // Write all topics
            for (const t of topicsToSeed) {
              await setDoc(doc(db, "challenges/default/topics", `topic_${t.id}`), t);
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, "challenges/default/topics");
          }
        } else {
          setTopics(loadedTopics);
          setLoading(false);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "challenges/default/topics");
      }
    );

    return () => {
      unsubChallenge();
      unsubTopics();
    };
  }, []);

  // Formulate reactive config object driven entirely by real-time Firestore data
  const config: ChallengeConfig = {
    challengeTitle: challengeDoc?.challengeTitle || "5-й Ежегодный Летний Киночеллендж Комитета",
    creatorName: challengeDoc?.creatorName || "Комитет",
    topics: topics,
  };

  // Update whole config state - syncing delta to Firestore
  const handleUpdateConfig = async (newConfig: ChallengeConfig) => {
    try {
      // 1. Sync metadata
      const docRef = doc(db, "challenges", "default");
      await setDoc(docRef, {
        challengeTitle: newConfig.challengeTitle,
        creatorName: newConfig.creatorName,
      }, { merge: true });

      // 2. Perform delta updates of topics collection to save read/write quotas
      const currentTopicsMap = new Map(topics.map(t => [t.id, t]));
      const newTopicsMap = new Map(newConfig.topics.map(t => [t.id, t]));

      // Delete removed ones
      for (const oldTopic of topics) {
        if (!newTopicsMap.has(oldTopic.id)) {
          await deleteDoc(doc(db, "challenges/default/topics", `topic_${oldTopic.id}`));
        }
      }

      // Add or update new/modified ones
      for (const newTopic of newConfig.topics) {
        const oldTopic = currentTopicsMap.get(newTopic.id);
        if (!oldTopic || JSON.stringify(oldTopic) !== JSON.stringify(newTopic)) {
          await setDoc(doc(db, "challenges/default/topics", `topic_${newTopic.id}`), newTopic);
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "challenges/default");
    }
  };

  // Update single topic fields directly in Firestore
  const handleUpdateTopic = async (topicId: number, updatedFields: Partial<MovieTopic>) => {
    try {
      const topicRef = doc(db, "challenges/default/topics", `topic_${topicId}`);
      await setDoc(topicRef, updatedFields, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `challenges/default/topics/topic_${topicId}`);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-vibrant-yellow text-black font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-white border-4 border-black rounded-3xl p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-vibrant-pink animate-spin" />
          <h2 className="text-xl font-display font-black uppercase text-black leading-tight">СИНХРОНИЗАЦИЯ...</h2>
          <p className="text-xs text-gray-700 font-bold leading-relaxed">
            Подключаемся к базе данных реального времени, чтобы отобразить самые свежие обновления проекта!
          </p>
        </div>
      </div>
    );
  }

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
