/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, Film, Trash2, Sliders, Calendar, CheckCircle, AlertTriangle, Play, Lock, ShieldCheck
} from 'lucide-react';
import { ChallengeConfig, MovieTopic, RevealAnimationType } from '../types';

interface AdminConfigProps {
  config: ChallengeConfig;
  onUpdateConfig: (newConfig: ChallengeConfig) => void;
  onEditSlot: (id: number) => void;
  onViewBoard: () => void;
  onExitAdminAccess?: () => void;
}

const ADMIN_PASSWORD = '381838194889418914AND@';

export default function AdminConfig({
  config,
  onUpdateConfig,
  onEditSlot,
  onViewBoard,
  onExitAdminAccess,
}: AdminConfigProps) {
  // Admin Authorization check
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(() => {
    return sessionStorage.getItem("is_devilmustpray_auth") === "true";
  });
  const [typedPassword, setTypedPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [challengeTitle, setChallengeTitle] = useState(config.challengeTitle);
  const [creatorName, setCreatorName] = useState(config.creatorName);
  const [staggerBaseDate, setStaggerBaseDate] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0); // Default to today at 9:00 AM
    const tzOffset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // iFrame-safe custom confirm states
  const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);
  const [isWipingBoard, setIsWipingBoard] = useState(false);

  // Authenticate Admin
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedPassword === ADMIN_PASSWORD) {
      setIsAdminAuthorized(true);
      sessionStorage.setItem("is_devilmustpray_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Доступ заблокирован. Неверный пароль организатора.");
    }
  };

  // Exit Admin Workspace
  const handleExitAdminMode = () => {
    setIsAdminAuthorized(false);
    sessionStorage.removeItem("is_devilmustpray_auth");
    if (onExitAdminAccess) {
      onExitAdminAccess();
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Save base board configs
  const handleSaveMetadata = () => {
    onUpdateConfig({
      ...config,
      challengeTitle: challengeTitle.trim() || "5-й Ежегодный Летний Киночеллендж Комитета",
      creatorName: creatorName.trim() || "Комитет",
    });
    showSuccess("Информация о челлендже успешно обновлена!");
  };

  // Add new topic from absolute scratch
  const handleAddNewTopic = () => {
    const nextId = config.topics.length === 0 ? 1 : Math.max(...config.topics.map(t => t.id)) + 1;
    const newTopic: MovieTopic = {
      id: nextId,
      title: `Новая летняя тема №${nextId} — Кликните для настройки`,
      hint: `Подсказка темы №${nextId}`,
      revealAt: "",
      isRevealedByUser: false,
      revealAnimationType: 'ticket',
      isCompleted: false,
    };

    onUpdateConfig({
      ...config,
      topics: [...config.topics, newTopic]
    });
    showSuccess(`Создана новая пустая карточка темы №${nextId}!`);
  };

  // Delete dynamic topic card
  const handleDeleteTopic = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open modal editor
    if (deletingTopicId === id) {
      onUpdateConfig({
        ...config,
        topics: config.topics.filter(t => t.id !== id)
      });
      setDeletingTopicId(null);
      showSuccess(`Тема №${id} успешно удалена с доски.`);
    } else {
      setDeletingTopicId(id);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => {
        setDeletingTopicId(prev => (prev === id ? null : prev));
      }, 3500);
    }
  };

  // Clear all topics to start from absolute scratch (0 rows)
  const handleClearAll = () => {
    if (isWipingBoard) {
      onUpdateConfig({
        ...config,
        topics: [],
      });
      setIsWipingBoard(false);
      showSuccess("Доска полностью очищена. Вы можете создавать новые карточки с нуля!");
    } else {
      setIsWipingBoard(true);
      setTimeout(() => {
        setIsWipingBoard(false);
      }, 4000);
    }
  };

  // Setup schedule offsets in bulk for existing custom card topics
  const handleBulkSchedule = (type: 'immediate' | 'daily') => {
    const baseDate = new Date(staggerBaseDate);
    const updatedTopics = config.topics.map((t, idx) => {
      let revealAtDate = new Date(baseDate);
      if (type === 'daily') {
        revealAtDate.setDate(baseDate.getDate() + idx);
        revealAtDate.setHours(9, 0, 0, 0);
      } else {
        // Immediate - slightly in the past
        revealAtDate.setMinutes(revealAtDate.getMinutes() - 15);
      }
      return {
        ...t,
        revealAt: revealAtDate.toISOString(),
      };
    });

    onUpdateConfig({
      ...config,
      topics: updatedTopics,
    });
    showSuccess(`Расписание обновлено для всех ${config.topics.length} тем: тип "${type === 'daily' ? 'Ежедневно' : 'Открыть сейчас'}" с ${new Date(baseDate).toLocaleDateString()}`);
  };

  // LOCK SCREEN IF UNAUTHORIZED
  if (!isAdminAuthorized) {
    return (
      <div className="w-full max-w-md mx-auto my-12 p-8 bg-white border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black font-sans">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="bg-vibrant-pink p-4 rounded-2xl border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Lock className="w-10 h-10 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-black uppercase">
              Вход во вкладку Организатора
            </h2>
            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
              Редактирование параметров челленджа защищено паролем. Пожалуйста, введите ключ доступа.
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="w-full space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-display font-black text-black uppercase tracking-wider">
                Секретный пароль
              </label>
              <input
                type="password"
                value={typedPassword}
                onChange={(e) => setTypedPassword(e.target.value)}
                placeholder="Вставьте защитный код..."
                required
                className="w-full p-3 bg-white border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:bg-vibrant-blue"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-100 border-2 border-black rounded-xl text-red-700 font-extrabold text-[10px] uppercase tracking-tight text-center">
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-vibrant-lime hover:bg-lime-400 text-black border-2 border-black rounded-xl text-xs font-display font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              Подтвердить доступ
            </button>
          </form>
        </div>
      </div>
    );
  }

  // CORE WORKSPACE LAYOUT
  return (
    <div className="w-full space-y-8 animate-fade-in font-sans text-black">
      
      {/* Overview admin stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-vibrant-gold border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700 animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase bg-emerald-100 border border-emerald-500 px-2 py-0.5 rounded-md">Авторизован Администратор</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tighter text-black uppercase mt-1">
            РАБОЧАЯ ОБЛАСТЬ ОРГАНИЗАТОРА
          </h2>
          <p className="text-sm text-gray-800 font-bold max-w-2xl mt-2 leading-snug">
            Создавайте карточки кинопремьер с нуля, убирайте / добавляйте темы, настраивайте последовательное время автоматического вскрытия таймерами и делитесь кино-паками.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExitAdminMode}
            className="px-4 py-2 hover:bg-gray-100 bg-white text-gray-700 rounded-xl font-bold border-2 border-black text-xs uppercase transition-all cursor-pointer"
          >
            Выйти
          </button>
          <button
            onClick={onViewBoard}
            className="flex items-center gap-2 px-6 py-3 bg-vibrant-pink hover:bg-pink-400 rounded-2xl font-display font-black text-white border-2 border-black text-xs tracking-wider uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            id="workspace-board-btn"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Запустить Кинодоску</span>
          </button>
        </div>
      </div>

      {/* Workspace columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Settings Panel */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Metadata settings */}
          <div className="p-6 rounded-3xl bg-white border-4 border-black space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
            <h3 className="text-sm font-display font-black text-vibrant-pink tracking-wider uppercase flex items-center gap-2">
              <Award className="w-5 h-5 text-black" />
              <span>Параметры челленджа</span>
            </h3>
            
            <div>
              <label className="block text-xs font-display font-black text-black mb-1.5 uppercase tracking-wide">
                Название киночелленджа
              </label>
              <input
                type="text"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder="5-й Ежегодный Летний Киночеллендж"
                className="w-full p-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-vibrant-blue placeholder-gray-400"
                id="workspace-config-title"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-black text-black mb-1.5 uppercase tracking-wide">
                Организатор / Клуб
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Комитет"
                className="w-full p-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-vibrant-blue placeholder-gray-400"
                id="workspace-config-creator"
              />
            </div>

            <button
              onClick={handleSaveMetadata}
              className="w-full py-3 bg-vibrant-lime border-2 border-black rounded-xl text-xs font-display font-black text-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 hover:bg-lime-300 transition-all cursor-pointer"
              id="workspace-save-details-btn"
            >
              Сохранить информацию
            </button>

            <button
              onClick={handleClearAll}
              className={`w-full py-2.5 border-2 border-black rounded-xl text-xs font-display font-black tracking-wide uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5 ${
                isWipingBoard
                  ? 'bg-red-650 text-white animate-pulse'
                  : 'bg-red-400 hover:bg-red-500 text-black'
              }`}
              id="wipe-board-btn"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isWipingBoard ? "ДА, ТОЧНО СТЕРЕТЬ ВСЕ ТЕМЫ!? КЛИКНИТЕ СНОВА" : "Очистить доску челленджа"}</span>
            </button>
          </div>

        </div>

        {/* Center/Right: Setup dynamic card grids */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Notifications */}
          {successMessage && (
            <div className="p-3 bg-vibrant-lime border-2 border-black rounded-xl text-black font-extrabold text-xs flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-red-400 border-2 border-black rounded-xl text-black font-extrabold text-xs flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Grids slot view */}
          <div className="p-6 rounded-3xl bg-white border-4 border-black space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-3 gap-2">
              <h3 className="text-sm font-display font-black text-black tracking-wider uppercase flex items-center gap-2">
                <Film className="w-5 h-5 text-vibrant-pink animate-spin-slow" />
                <span>Карточки летних тем на доске</span>
              </h3>
              <button
                onClick={handleAddNewTopic}
                className="px-4 py-2 bg-vibrant-lime text-black font-display font-black text-xs uppercase border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                ➕ Добавить тему с нуля
              </button>
            </div>

            {config.topics.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-semibold text-xs uppercase leading-relaxed">
                Нет созданных тем. Нажмите на зелёную кнопку выше, чтобы добавить первую карточку кинооткрытия с нуля!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {config.topics.map((t) => {
                  const now = new Date();
                  const isLocked = !t.revealAt || new Date(t.revealAt) > now;

                  return (
                    <div
                      key={t.id}
                      onClick={() => onEditSlot(t.id)}
                      className="group relative flex flex-col justify-between p-3 aspect-square bg-white border-2 border-black rounded-2xl text-left cursor-pointer hover:bg-vibrant-yellow transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 border-black/90 p-3"
                    >
                      <div>
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-vibrant-pink font-display font-black text-xs">
                            #{t.id}
                          </span>
                          <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-extrabold font-mono">
                            {t.revealAnimationType}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-black font-extrabold leading-normal mt-1.5 line-clamp-2">
                          {t.title}
                        </p>
                        {t.hint && (
                          <p className="text-[9px] text-gray-500 font-semibold leading-tight line-clamp-1 italic mt-1">
                            Подсказка: {t.hint}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-300 pt-1.5">
                        <button
                          onClick={(e) => handleDeleteTopic(t.id, e)}
                          className={`p-1 px-1.5 rounded transition-all flex items-center gap-1 border cursor-pointer ${
                            deletingTopicId === t.id
                              ? 'bg-red-600 text-white font-display font-black text-[9px] uppercase border-black animate-pulse'
                              : 'bg-red-100 hover:bg-red-400 text-red-700 border-red-500/30'
                          }`}
                          title="Удалить тему"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deletingTopicId === t.id && <span>Удалить?</span>}
                        </button>

                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border rounded-md uppercase tracking-tight ${
                          isLocked
                            ? 'bg-gray-100 border-gray-300 text-gray-500'
                            : 'bg-vibrant-lime border-black text-black'
                        }`}>
                          {isLocked ? 'Блок' : 'Открыта'}
                        </span>
                      </div>

                      {/* Quick hover label click indicator */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150 rounded-2xl pointer-events-none">
                        <span className="bg-vibrant-pink text-white border-2 border-black font-display text-[9px] font-black uppercase px-2 py-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          ✏️ НАСТРОИТЬ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
