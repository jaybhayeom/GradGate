// ==============================================================================
// TRANSPARENT MATH SCRATCHPAD OVERLAY
// Toggleable anytime via Ctrl+D or header pen button.
// Features: Canvas freehand drawing, stroke widths, eraser, undo/redo, math grid.
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  PencilSimple,
  Eraser,
  ArrowCounterClockwise,
  ArrowClockwise,
  Trash,
  GridFour,
  X
} from '@phosphor-icons/react';

export interface ScratchpadOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
  isEraser: boolean;
}

export const ScratchpadOverlay: React.FC<ScratchpadOverlayProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [color, setColor] = useState<string>('#FBBF24'); // Yellow math chalk default
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Global Ctrl+D shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isOpen, onClose]);

  // Resize canvas to window dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      redraw(strokes);
    }
  }, [isOpen]);

  const redraw = (allStrokes: Stroke[]): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of allStrokes) {
      if (stroke.points.length === 0) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStroke: Stroke = {
      points: [{ x, y }],
      color,
      width: isEraser ? 24 : strokeWidth,
      isEraser
    };

    setCurrentStroke(newStroke);
    setRedoStack([]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!currentStroke) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updated = {
      ...currentStroke,
      points: [...currentStroke.points, { x, y }]
    };

    setCurrentStroke(updated);
    redraw([...strokes, updated]);
  };

  const handlePointerUp = (): void => {
    if (currentStroke) {
      const nextStrokes = [...strokes, currentStroke];
      setStrokes(nextStrokes);
      setCurrentStroke(null);
      redraw(nextStrokes);
    }
  };

  const handleUndo = (): void => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    const remaining = strokes.slice(0, -1);
    setStrokes(remaining);
    setRedoStack((prev) => [...prev, last]);
    redraw(remaining);
  };

  const handleRedo = (): void => {
    if (redoStack.length === 0) return;
    const toRestore = redoStack[redoStack.length - 1];
    const nextStrokes = [...strokes, toRestore];
    setStrokes(nextStrokes);
    setRedoStack((prev) => prev.slice(0, -1));
    redraw(nextStrokes);
  };

  const handleClear = (): void => {
    setStrokes([]);
    setRedoStack([]);
    redraw([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Grid Canvas Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, #94A3B8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      )}

      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair touch-none"
      />

      {/* Floating Toolbar (Non-draggable, Clickable) */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-auto rounded-3xl bg-slate-900/95 border border-slate-700/80 p-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2">
        {/* Pen mode */}
        <button
          type="button"
          onClick={() => setIsEraser(false)}
          className={`p-2 rounded-2xl transition ${
            !isEraser
              ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Pen"
        >
          <PencilSimple size={18} weight="fill" />
        </button>

        {/* Eraser mode */}
        <button
          type="button"
          onClick={() => setIsEraser(true)}
          className={`p-2 rounded-2xl transition ${
            isEraser
              ? 'bg-rose-500 text-white shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Eraser"
        >
          <Eraser size={18} weight="fill" />
        </button>

        <div className="w-[1px] h-6 bg-slate-800 mx-1" />

        {/* Color Palette */}
        {['#FBBF24', '#FFFFFF', '#10B981', '#38BDF8', '#F43F5E'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              setIsEraser(false);
            }}
            className={`w-5 h-5 rounded-full transition-transform ${
              color === c && !isEraser ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}

        <div className="w-[1px] h-6 bg-slate-800 mx-1" />

        {/* Stroke Widths */}
        {[2, 4, 8].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setStrokeWidth(w)}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold ${
              strokeWidth === w && !isEraser
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {w === 2 ? 'Thin' : w === 4 ? 'Med' : 'Thick'}
          </button>
        ))}

        <div className="w-[1px] h-6 bg-slate-800 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="p-2 rounded-2xl text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
          title="Undo"
        >
          <ArrowCounterClockwise size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className="p-2 rounded-2xl text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
          title="Redo"
        >
          <ArrowClockwise size={16} weight="bold" />
        </button>

        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          className="p-2 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition"
          title="Clear Scratchpad"
        >
          <Trash size={16} weight="bold" />
        </button>

        {/* Grid toggle */}
        <button
          type="button"
          onClick={() => setShowGrid((g) => !g)}
          className={`p-2 rounded-2xl transition ${
            showGrid ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Math Grid"
        >
          <GridFour size={16} weight="bold" />
        </button>

        <div className="w-[1px] h-6 bg-slate-800 mx-1" />

        {/* Close Button with Ctrl+D badge */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
        >
          <X size={14} weight="bold" />
          <span>Close</span>
          <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+D</kbd>
        </button>
      </div>
    </div>
  );
};
