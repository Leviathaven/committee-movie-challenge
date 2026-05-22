/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calendar, Settings, Trash2 } from 'lucide-react';
import { MovieTopic, RevealAnimationType } from '../types';

interface TopicDetailsModalProps {
  topic: MovieTopic;
  onSave: (updated: Partial<MovieTopic>) => void;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

const ANIMATION_PRESETS: { value: RevealAnimationType; label: string; desc: string }[] = [
  { value: 'scratch', label: '🎟️ Скретч-карта', desc: 'Серебристый защитный слой, который нужно стирать движениями мыши или пальца.' },
  { value: 'ticket', label: '🎫 Разрыв билета', desc: 'Винтажный билет кинотеатра, который разрывается пополам при клике.' },
  { value: 'clapper', label: '🎬 Кинохлопушка', desc: 'Классическая режиссерская хлопушка, которая захлопывается со звуковым эффектом.' },
  { value: 'neon', label: '⚡ Неоновое мерцание', desc: 'Светящаяся неоновая вывеска, которая гудит, мерцает и разгорается.' }
];

export default function TopicDetailsModal({
  topic,
  onSave,
  onClose,
  onDelete,
}: TopicDetailsModalProps) {
  const [title, setTitle] = useState(topic.title);
  const [hint, setHint] = useState(topic.hint || '');
  const [animType, setAnimType] = useState<RevealAnimationType>(topic.revealAnimationType);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [revealTimeStr, setRevealTimeStr] = useState(() => {
    // Formats ISO string into input datetime-local compatible string in local time zone
    const d = new Date(topic.revealAt);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  });

  const handleSave = () => {
    const utcDate = new Date(revealTimeStr);
    onSave({
      title: title.trim(),
      hint: hint.trim(),
      revealAnimationType: animType,
      revealAt: utcDate.toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-4 border-black bg-vibrant-yellow">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-black" />
            <h2 className="text-lg font-display font-black text-black uppercase tracking-tight">
              Настройка темы №{topic.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-vibrant-pink text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-600 cursor-pointer"
            id={`close-modal-slot-${topic.id}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block text-xs font-display font-black text-black mb-1.5 uppercase tracking-wide">
              Текст темы / Задание киночелленджа
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите тему, например: Фильм, действие которого разворачивается на курорте или пляже..."
              className="w-full h-24 p-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-vibrant-blue placeholder-gray-400 resize-none"
              id={`modal-topic-title-${topic.id}`}
            />
          </div>

          <div>
            <label className="block text-xs font-display font-black text-black mb-1.5 uppercase tracking-wide">
              Подсказка к названию темы (будет видна сразу при публикации)
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Введите краткую наводящую подсказку..."
              className="w-full p-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-vibrant-blue placeholder-gray-400"
              id={`modal-topic-hint-${topic.id}`}
            />
          </div>

          <div>
            <label className="block text-xs font-display font-black text-black mb-1.5 uppercase tracking-wide">
              Дата и время автоматического открытия
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={revealTimeStr}
                onChange={(e) => setRevealTimeStr(e.target.value)}
                className="w-full p-2.5 pl-9 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold text-black focus:outline-none focus:bg-vibrant-blue"
                id={`modal-topic-date-${topic.id}`}
              />
              <Calendar className="w-4 h-4 text-black absolute left-3 top-3.5" />
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 font-mono uppercase leading-tight">
              Карточка будет заблокирована до наступления указанного времени.
            </p>
          </div>

          <div>
            <label className="block text-xs font-display font-black text-black mb-1.5 uppercase tracking-wide">
              Интерактивный стиль открытия
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ANIMATION_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setAnimType(p.value)}
                  className={`w-full text-left p-2.5 rounded-xl border-2 flex flex-col transition-all cursor-pointer ${
                    animType === p.value
                      ? 'border-black bg-vibrant-yellow text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-gray-200 bg-white text-black hover:border-black'
                  }`}
                  id={`anim-choice-${p.value}`}
                >
                  <span className="text-xs font-display font-black text-black">{p.label}</span>
                  <span className="text-[10px] text-gray-500 leading-tight mt-0.5 font-semibold">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-5 border-t-2 border-black bg-gray-50">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete) {
                    onDelete(topic.id);
                  } else {
                    setConfirmDelete(true);
                    // Reset safety timer
                    setTimeout(() => setConfirmDelete(false), 4000);
                  }
                }}
                className={`px-4 py-2.5 border-2 border-black rounded-xl text-xs font-display font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer ${
                  confirmDelete
                    ? 'bg-red-650 text-white animate-pulse'
                    : 'bg-red-400 hover:bg-red-500 text-black'
                }`}
                id={`modal-delete-btn-${topic.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? "ТОЧНО УДАЛИТЬ ТЕМУ!?" : "Удалить тему"}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-black hover:underline cursor-pointer"
              id={`modal-cancel-btn-${topic.id}`}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className={`px-5 py-2.5 text-xs font-display font-black uppercase rounded-xl border-2 border-black transition-all cursor-pointer ${
                title.trim()
                  ? 'bg-vibrant-lime text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-lime-400'
                  : 'bg-white text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
              id={`modal-save-btn-${topic.id}`}
            >
              Сохранить тему
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
