/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Ticket, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { MovieTopic } from '../types';

// Helper for synthesizer audio effects using Web Audio API
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playClack() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Wooden clap sound simulation: noise burst + low filter decay
      const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      // Add a low frequency transient impact
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

      oscGain.gain.setValueAtTime(0.9, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.1);
      
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignored if browser blocks audio
    }
  }

  playHum() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Neon spark sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now); // 60Hz hum
      osc.frequency.linearRampToValueAtTime(180, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.0, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + 0.08);
      gain.gain.setValueAtTime(0.0, now + 0.12);
      gain.gain.setValueAtTime(0.2, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  playSwoosh() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.3; // 300ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.3);
    } catch {}
  }
}

const soundManager = new SoundManager();

interface InteractiveRevealerProps {
  topic: MovieTopic;
  onRevealComplete: () => void;
  onClose: () => void;
}

export default function InteractiveRevealer({
  topic,
  onRevealComplete,
  onClose,
}: InteractiveRevealerProps) {
  const [hasRevealed, setHasRevealed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [clapperSnapped, setClapperSnapped] = useState(false);
  const [ticketTorn, setTicketTorn] = useState(false);
  const [neonActivated, setNeonActivated] = useState(false);
  const [neonFlickerStep, setNeonFlickerStep] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchingRef = useRef(false);

  // Toggle audio
  const handleToggleSound = () => {
    soundManager.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // 1. Scratch card canvas setup
  useEffect(() => {
    if (topic.revealAnimationType !== 'scratch' || hasRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratch card surface
    const drawSurface = () => {
      // Metallic silver gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#7f8c8d');
      grad.addColorStop(0.3, '#bdc3c7');
      grad.addColorStop(0.7, '#95a5a6');
      grad.addColorStop(1, '#7f8c8d');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Film reel circular overlay decorative drawings
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      
      // Draw grid patterns or circles mock
      for (let i = 20; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.arc(i, canvas.height / 2, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Fun film logo in the middle
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('СОТРИТЕ ДЛЯ РАСКРЫТИЯ', canvas.width / 2, canvas.height / 2);
    };

    drawSurface();
  }, [topic.revealAnimationType, hasRevealed]);

  // Scratch drawing mechanics
  const handleScratchStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isScratchingRef.current = true;
    soundManager.playSwoosh();
    scratch(e);
  };

  const handleScratchEnd = () => {
    isScratchingRef.current = false;
  };

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Erase circles at pointer location
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check completion
    checkScratchCompletion();
  };

  const checkScratchCompletion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample pixels down to calculate transparent ratio
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let cleared = 0;
    const step = 20; // Sample every 20th pixel to keep it fast

    for (let i = 3; i < pixels.length; i += 4 * step) {
      if (pixels[i] === 0) {
        cleared++;
      }
    }

    const totalSamples = pixels.length / (4 * step);
    const percent = Math.round((cleared / totalSamples) * 100);
    setScratchPercent(percent);

    if (percent > 45 && !hasRevealed) {
      setHasRevealed(true);
      soundManager.playClack();
    }
  };

  // 2. Ticket Tear Mechanics
  const triggerTicketTear = () => {
    if (ticketTorn) return;
    setTicketTorn(true);
    soundManager.playSwoosh();
    setTimeout(() => {
      setHasRevealed(true);
      soundManager.playClack();
    }, 700);
  };

  // 3. Clapper board Mechanics
  const triggerClapperSnap = () => {
    if (clapperSnapped) return;
    setClapperSnapped(true);
    soundManager.playClack();
    
    // Animate to full reveal
    setTimeout(() => {
      setHasRevealed(true);
    }, 700);
  };

  // 4. Neon Flicker Mechanics
  const triggerNeonPop = () => {
    if (neonActivated) return;
    setNeonActivated(true);
    soundManager.playHum();

    // Flicker animation loop
    let ticks = 0;
    const interval = setInterval(() => {
      setNeonFlickerStep((prev) => (prev + 1) % 4);
      ticks++;
      if (ticks > 12) {
        clearInterval(interval);
        setHasRevealed(true);
        soundManager.playClack();
      }
    }, 90);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1d] flex flex-col items-center justify-center p-4 overflow-y-auto">
      {/* Sound controller */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-10 font-sans">
        <button
          onClick={handleToggleSound}
          className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-500 transition cursor-pointer"
          title={soundEnabled ? "Выключить звук" : "Включить звук"}
          id="reveal-sound-toggle"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-orange-500" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-slate-900 border border-slate-700 text-slate-50 hover:bg-slate-800 transition cursor-pointer text-xs font-mono font-medium tracking-wide uppercase"
          id="reveal-close-btn"
        >
          Закрыть
        </button>
      </div>

      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center font-sans text-white">
        {/* Challenge Slot Header */}
        <div className="mb-6 space-y-2 text-center flex flex-col items-center">
          <div className="font-mono text-[10px] tracking-widest text-orange-500 uppercase flex items-center gap-2">
            <Film className="w-3.5 h-3.5 animate-pulse" />
            <span>Тема киночелленджа №{topic.id}</span>
          </div>
          {topic.hint && (
            <div className="max-w-xs text-xs text-slate-300 border border-slate-800/85 px-3 py-1 bg-slate-900/50 rounded-lg">
              Подсказка: <span className="text-amber-400 font-bold">{topic.hint}</span>
            </div>
          )}
        </div>

        {/* Dynamic active display wrapper */}
        <div className="w-full aspect-[4/3] bg-slate-950 border-4 border-black rounded-2xl overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-6 mb-8 group">
          
          <AnimatePresence mode="wait">
            {!hasRevealed ? (
              <motion.div
                key="interactive-shield"
                className="absolute inset-0 z-10 w-full h-full flex flex-col items-center justify-center bg-[#090b14]"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {/* SCRATCH INTERACTION */}
                {topic.revealAnimationType === 'scratch' && (
                  <div className="relative w-full h-full cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleScratchStart}
                      onMouseUp={handleScratchEnd}
                      onMouseLeave={handleScratchEnd}
                      onMouseMove={scratch}
                      onTouchStart={handleScratchStart}
                      onTouchEnd={handleScratchEnd}
                      onTouchMove={scratch}
                      className="absolute inset-0 w-full h-full select-none"
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-1.5 bg-black/80 border border-slate-700 rounded-full text-xs text-white">
                      Стирайте защитную область: {scratchPercent}%
                    </div>
                  </div>
                )}

                {/* TICKET TEAR INTERACTION */}
                {topic.revealAnimationType === 'ticket' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <motion.div
                      onClick={triggerTicketTear}
                      style={{ cursor: 'pointer' }}
                      className="relative w-72 h-36 flex border-2 border-black rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden select-none hover:brightness-105 active:scale-95 transition-all text-center"
                    >
                      {/* Left half ticket */}
                      <motion.div
                        animate={ticketTorn ? { x: -160, rotate: -15, opacity: 0 } : {}}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-2/3 h-full border-r-2 border-dashed border-black/40 relative flex flex-col justify-between p-4 bg-amber-500"
                      >
                        {/* Cutout notch decors */}
                        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#090b14]" />
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[#090b14]" />
                        
                        <div className="text-[10px] tracking-wide text-black/70 font-mono font-medium text-left">БИЛЕТ №{topic.id}</div>
                        <div className="text-lg font-bold uppercase tracking-wide my-1 text-black text-left">КИНОЧЕЛЛЕНДЖ</div>
                        <div className="text-[9px] text-black/60 text-left">НАЖМИТЕ, ЧТОБЫ РАЗОРВАТЬ</div>
                      </motion.div>

                      {/* Right stub half ticket */}
                      <motion.div
                        animate={ticketTorn ? { x: 160, rotate: 15, opacity: 0 } : {}}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-1/3 h-full relative flex flex-col justify-between p-4 bg-orange-500"
                      >
                        {/* Cutout notch decors */}
                        <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#090b14]" />
                        <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#090b14]" />
                        
                        <div className="text-[10px] tracking-wider text-black/70 font-mono text-right font-semibold">#{topic.id}</div>
                        <div className="text-2xl text-black flex justify-end"><Ticket className="w-6 h-6 rotate-45" /></div>
                        <div className="text-[9px] text-black/60 text-right">КОНТРОЛЬ</div>
                      </motion.div>
                    </motion.div>
                    <p className="text-xs text-slate-350 mt-6 font-mono animate-pulse">
                      ▲ Нажмите на билет, чтобы вскрыть тему
                    </p>
                  </div>
                )}

                {/* CLAPPER SLATE INTERACTION */}
                {topic.revealAnimationType === 'clapper' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <button
                      onClick={triggerClapperSnap}
                      className="flex flex-col items-center justify-center p-2 outline-none group cursor-pointer"
                      id="clapper-trigger-btn"
                    >
                      <div className="relative w-60 flex flex-col bg-slate-900 border-4 border-black text-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden font-bold">
                        {/* Top hinged bar */}
                        <motion.div
                          animate={clapperSnapped ? { rotate: 0 } : { rotate: -25, originX: 0, originY: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="h-10 bg-slate-950 border-b-2 border-black flex items-center justify-center overflow-hidden"
                        >
                          <div className="w-full h-full bg-[linear-gradient(45deg,#000_25%,#fff_25%,#fff_50%,#000_50%,#000_75%,#fff_75%)] bg-[length:30px_30px]" />
                        </motion.div>

                        {/* Clapper body board */}
                        <div className="p-4 space-y-2 text-left font-mono text-xs text-white bg-[#101424]">
                          <div className="flex border-b border-slate-700 py-1">
                            <div className="w-1/2 border-r border-slate-700 pr-1">СЦЕНА <span className="text-orange-500 font-bold">ЛЕТО</span></div>
                            <div className="w-1/2 pl-1">ДУБЛЬ <span className="text-orange-500 font-bold">{topic.id}</span></div>
                          </div>
                          <div className="text-[10px] text-slate-400">РЕЖИССЕР: КОМИТЕТ</div>
                          <div className="text-[10px] text-slate-400">ДАТА: КИНОЧЕЛЛЕНДЖ</div>
                          <div className="text-[10px] text-center font-bold text-orange-400 border border-orange-500/30 rounded p-1 mt-2 tracking-wide uppercase">
                            НАЖМИТЕ ДЛЯ СЪЕМКИ!
                          </div>
                        </div>
                      </div>
                    </button>
                    <p className="text-xs text-slate-350 mt-6 font-mono animate-pulse">
                      ▲ Нажмите на хлопушку для старта
                    </p>
                  </div>
                )}

                {/* NEON BULB INTERACTION */}
                {topic.revealAnimationType === 'neon' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <motion.button
                      onClick={triggerNeonPop}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative w-64 p-6 rounded-xl border flex flex-col items-center justify-center transition-all bg-black cursor-pointer overflow-hidden ${
                        neonActivated
                          ? 'border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.4)]'
                          : 'border-slate-800'
                      }`}
                      id="neon-power-trigger"
                    >
                      {/* Glowing decorative neon wires */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/20 via-black to-blue-950/20 opacity-40 animate-pulse" />
                      
                      <div className={`text-[10px] font-mono tracking-widest text-cyan-400 uppercase transition-opacity ${
                        neonActivated && neonFlickerStep % 2 === 0 ? 'opacity-40' : 'opacity-100'
                      }`}>
                        ЗАПУСК ГРИД-СВЯЗИ
                      </div>
                      
                      <div className="my-5 relative z-10">
                        <motion.div
                          animate={neonActivated ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className={`text-xl font-black tracking-tight transition-all uppercase ${
                            neonActivated
                              ? 'text-orange-500 drop-shadow-[0_0_8px_#ff5e36]'
                              : 'text-slate-700'
                          }`}
                        >
                          ВКЛЮЧИТЬ НЕОН
                        </motion.div>
                      </div>

                      <div className={`p-1.5 rounded bg-slate-900 border font-mono text-[9px] ${
                        neonActivated ? 'border-orange-500/40 text-orange-500' : 'border-slate-800 text-slate-500'
                      }`}>
                        {neonActivated ? 'ГЕНЕРАЦИЯ СВЕТА...' : 'НАЖМИТЕ ДЛЯ ИМПУЛЬСА'}
                      </div>
                    </motion.button>
                    <p className="text-xs text-slate-350 mt-6 font-mono animate-pulse">
                      ▲ Нажмите на панель вывески для включения
                    </p>
                  </div>
                )}

              </motion.div>
            ) : (
              /* REVEALED CONTENT DISPLAY PANEL */
              <motion.div
                key="revealed-panel"
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="absolute inset-0 z-20 w-full h-full p-4 flex flex-col justify-between items-center bg-gradient-to-b from-slate-900 to-slate-950 overflow-y-auto"
              >
                {/* Visual sparkles header */}
                <div className="flex items-center gap-1.5 mt-2 text-orange-500 font-mono text-[10px] tracking-widest uppercase">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Летняя тема раскрыта успешно!</span>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                </div>

                <div className="my-auto w-full max-w-sm flex flex-col items-center p-3 space-y-4">
                  {/* Rotating retro movie reel wheel indicator */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border-4 border-orange-500/60 shadow-2xl relative flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
                    <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-slate-850 flex items-center justify-center">
                      <Film className="w-4 h-4 text-orange-500" />
                    </div>
                    {/* Grooves */}
                    <div className="absolute inset-2 border border-slate-700/25 rounded-full" />
                    <div className="absolute inset-4 border border-slate-700/25 rounded-full" />
                    <div className="absolute inset-6 border border-slate-700/25 rounded-full" />
                  </div>

                  {/* Core Prompt */}
                  <div className="space-y-3 text-center">
                    <h3 className="text-lg font-bold text-white px-4 py-3 bg-slate-900 border-2 border-black rounded-xl leading-snug tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      «{topic.title}»
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xs mx-auto">
                      Собирайте команду друзей, запасайтесь попкорном и наслаждайтесь отличным фильмом по этой теме!
                    </p>
                  </div>
                </div>

                {/* Accept and Confirm Board Write */}
                <button
                  onClick={onRevealComplete}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 cursor-pointer rounded-xl font-bold text-white tracking-wide text-sm hover:from-orange-600 hover:to-orange-500 active:scale-95 transition-all mb-2"
                  id="claim-topic-btn"
                >
                  Опубликовать на Кинодоске!
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructive guidance */}
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
          Комитет • Летний Киносинематограф
        </p>
      </div>
    </div>
  );
}
