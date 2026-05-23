/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calendar, Settings, Trash2 } from 'lucide-react';
import { MovieTopic, RevealAnimationType } from '../types';
import Uploader from './Uploader';

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
  const [author, setAuthor] = useState(topic.author || '');
  const [hintImage, setHintImage] = useState(topic.hintImage || '');
  const [hintImageName, setHintImageName] = useState(topic.hintImageName || '');
  const [revealImage, setRevealImage] = useState(topic.image || '');
  const [revealImageName, setRevealImageName] = useState(topic.imageName || '');

  const [hintImgMode, setHintImgMode] = useState<'file' | 'url'>(() => {
    if (topic.hintImage && (topic.hintImage.startsWith('http://') || topic.hintImage.startsWith('https://'))) {
      return 'url';
    }
    return 'file';
  });

  const [revealImgMode, setRevealImgMode] = useState<'file' | 'url'>(() => {
    if (topic.image && (topic.image.startsWith('http://') || topic.image.startsWith('https://'))) {
      return 'url';
    }
    return 'file';
  });

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
      author: author.trim(),
      hintImage: hintImage.trim(),
      hintImageName: hintImageName.trim(),
      image: revealImage.trim(),
      imageName: revealImageName.trim(),
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

          {/* Author of the topic */}
          <div>
            <label className="block text-xs font-display font-black text-black mb-1.5 uppercase tracking-wide">
              👤 Автор темы (кто предложил)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Укажите автора темы..."
              className="w-full p-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-vibrant-blue placeholder-gray-400"
              id={`modal-topic-author-${topic.id}`}
            />
          </div>

          {/* Image source selector for Hint */}
          <div className="space-y-3 p-4 bg-gray-50 border-2 border-black rounded-2xl">
            <span className="block text-xs font-display font-black text-black uppercase tracking-wide">
              🖼️ Картинка-подсказка (до вскрытия)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHintImgMode('file')}
                className={`flex-1 py-1.5 border-2 border-black text-[10px] font-black uppercase rounded-lg transition-all ${
                  hintImgMode === 'file' ? 'bg-vibrant-cyan text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'
                }`}
              >
                Загрузить файлом
              </button>
              <button
                type="button"
                onClick={() => setHintImgMode('url')}
                className={`flex-1 py-1.5 border-2 border-black text-[10px] font-black uppercase rounded-lg transition-all ${
                  hintImgMode === 'url' ? 'bg-vibrant-cyan text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'
                }`}
              >
                Вставить ссылку
              </button>
            </div>

            {hintImgMode === 'file' ? (
              <Uploader
                id="hint-img-uploader"
                onImageSelected={(base64, name) => {
                  setHintImage(base64);
                  setHintImageName(name);
                }}
                currentImage={hintImage}
                onClearImage={() => {
                  setHintImage('');
                  setHintImageName('');
                }}
              />
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={hintImage}
                  onChange={(e) => {
                    setHintImage(e.target.value);
                    setHintImageName('External URL');
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-2 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold text-black focus:outline-none focus:bg-vibrant-blue"
                />
                {hintImage && (
                  <div className="border-2 border-black rounded-xl overflow-hidden aspect-[4/3] bg-white max-h-36 flex items-center justify-center">
                    <img src={hintImage} alt="Hint Preview" className="object-cover w-full h-full" onError={(e)=>{ (e.target as any).src='' }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image source selector for Reveal Image */}
          <div className="space-y-3 p-4 bg-gray-50 border-2 border-black rounded-2xl">
            <span className="block text-xs font-display font-black text-black uppercase tracking-wide">
              🎬 Изображение темы (после вскрытия)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRevealImgMode('file')}
                className={`flex-1 py-1.5 border-2 border-black text-[10px] font-black uppercase rounded-lg transition-all ${
                  revealImgMode === 'file' ? 'bg-vibrant-pink text-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'
                }`}
              >
                Загрузить файлом
              </button>
              <button
                type="button"
                onClick={() => setRevealImgMode('url')}
                className={`flex-1 py-1.5 border-2 border-black text-[10px] font-black uppercase rounded-lg transition-all ${
                  revealImgMode === 'url' ? 'bg-vibrant-pink text-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'
                }`}
              >
                Вставить ссылку
              </button>
            </div>

            {revealImgMode === 'file' ? (
              <Uploader
                id="reveal-img-uploader"
                onImageSelected={(base64, name) => {
                  setRevealImage(base64);
                  setRevealImageName(name);
                }}
                currentImage={revealImage}
                onClearImage={() => {
                  setRevealImage('');
                  setRevealImageName('');
                }}
              />
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={revealImage}
                  onChange={(e) => {
                    setRevealImage(e.target.value);
                    setRevealImageName('External URL');
                  }}
                  placeholder="https://example.com/topic-image.jpg"
                  className="w-full p-2 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold text-black focus:outline-none focus:bg-vibrant-blue"
                />
                {revealImage && (
                  <div className="border-2 border-black rounded-xl overflow-hidden aspect-[4/3] bg-white max-h-36 flex items-center justify-center">
                    <img src={revealImage} alt="Reveal Preview" className="object-cover w-full h-full" onError={(e)=>{ (e.target as any).src='' }} />
                  </div>
                )}
              </div>
            )}
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
