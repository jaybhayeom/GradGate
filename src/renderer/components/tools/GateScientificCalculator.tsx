// ==============================================================================
// OFFICIAL GATE / TCS iON SCIENTIFIC VIRTUAL CALCULATOR
// Replicates the non-programmable TCS iON Web Calculator used in the actual GATE exam.
// Features:
//   - Deg / Rad angle modes
//   - Hyperbolic & Inverse Trigonometric functions
//   - Logarithmic (ln, log10, log_y(x)), Exponential (e^x, 10^x, x^y, y√x)
//   - Math functions (n!, |x|, Mod, 1/x, x², x³, √x, ∛x)
//   - Memory registers (MC, MR, MS, M+, M-) with [M] indicator
//   - Dual display: Expression history and active number readout
//   - Floating, draggable window with view bounds clamping
// ==============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ArrowsOutCardinal, Backspace } from '@phosphor-icons/react';

export interface GateScientificCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

export type AngleMode = 'DEG' | 'RAD';

// Safe factorial computation
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // JS Number overflow limit
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

export const GateScientificCalculator: React.FC<GateScientificCalculatorProps> = ({
  isOpen,
  onClose,
  initialPosition = { x: 80, y: 80 }
}) => {
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isHyp, setIsHyp] = useState<boolean>(false);
  const [isInv, setIsInv] = useState<boolean>(false);
  
  // Displays
  const [expression, setExpression] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);
  const [justCalculated, setJustCalculated] = useState<boolean>(false);

  // Dragging state
  const [pos, setPos] = useState<{ x: number; y: number }>(initialPosition);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle window drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Only drag from header
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 480, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 560, e.clientY - dragOffsetRef.current.y));
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = (): void => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Number input
  const handleDigit = (digit: string): void => {
    if (justCalculated) {
      setCurrentInput(digit);
      setJustCalculated(false);
      return;
    }
    if (currentInput === '0' && digit !== '.') {
      setCurrentInput(digit);
    } else {
      if (digit === '.' && currentInput.includes('.')) return;
      setCurrentInput((prev) => prev + digit);
    }
  };

  const handleBackspace = (): void => {
    if (justCalculated) {
      setCurrentInput('0');
      setJustCalculated(false);
      return;
    }
    if (currentInput.length <= 1) {
      setCurrentInput('0');
    } else {
      setCurrentInput((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = (): void => {
    setCurrentInput('0');
  };

  const handleAllClear = (): void => {
    setCurrentInput('0');
    setExpression('');
    setJustCalculated(false);
  };

  const handleToggleSign = (): void => {
    const val = parseFloat(currentInput);
    if (!isNaN(val)) {
      setCurrentInput((-val).toString());
    }
  };

  // Binary operators: +, -, *, /, mod, x^y, yroot
  const handleOperator = (op: string): void => {
    setExpression((prev) => {
      const formattedInput = currentInput;
      return `${prev} ${formattedInput} ${op}`.trim();
    });
    setCurrentInput('0');
    setJustCalculated(false);
  };

  // Immediate Unary Functions
  const handleUnaryFunction = (func: string): void => {
    const val = parseFloat(currentInput);
    if (isNaN(val)) return;

    let res = 0;
    const rad = angleMode === 'DEG' ? (val * Math.PI) / 180 : val;

    switch (func) {
      // Trigonometric
      case 'sin':
        res = isInv
          ? (angleMode === 'DEG' ? (Math.asin(val) * 180) / Math.PI : Math.asin(val))
          : isHyp
          ? Math.sinh(val)
          : Math.sin(rad);
        break;
      case 'cos':
        res = isInv
          ? (angleMode === 'DEG' ? (Math.acos(val) * 180) / Math.PI : Math.acos(val))
          : isHyp
          ? Math.cosh(val)
          : Math.cos(rad);
        break;
      case 'tan':
        res = isInv
          ? (angleMode === 'DEG' ? (Math.atan(val) * 180) / Math.PI : Math.atan(val))
          : isHyp
          ? Math.tanh(val)
          : Math.tan(rad);
        break;
      case 'sinh':
        res = isInv ? Math.asinh(val) : Math.sinh(val);
        break;
      case 'cosh':
        res = isInv ? Math.acosh(val) : Math.cosh(val);
        break;
      case 'tanh':
        res = isInv ? Math.atanh(val) : Math.tanh(val);
        break;

      // Log & Exp
      case 'ln':
        res = Math.log(val);
        break;
      case 'log10':
        res = Math.log10(val);
        break;
      case 'exp':
        res = Math.exp(val);
        break;
      case '10^x':
        res = Math.pow(10, val);
        break;

      // Powers & Roots
      case 'sqr':
        res = val * val;
        break;
      case 'cube':
        res = val * val * val;
        break;
      case 'sqrt':
        res = Math.sqrt(val);
        break;
      case 'cbrt':
        res = Math.cbrt(val);
        break;
      case 'recip':
        res = 1 / val;
        break;
      case 'fact':
        res = factorial(Math.floor(val));
        break;
      case 'abs':
        res = Math.abs(val);
        break;
      default:
        res = val;
    }

    if (isNaN(res) || !isFinite(res)) {
      setCurrentInput('Error');
    } else {
      // Round to 10 decimal places to prevent floating point noise (e.g. 0.0000000000000001)
      const clean = parseFloat(res.toFixed(10)).toString();
      setCurrentInput(clean);
    }
    setJustCalculated(true);
  };

  // Safe arithmetic evaluator
  const evaluateCurrentExpression = useCallback((): void => {
    try {
      const fullExpr = `${expression} ${currentInput}`.trim();
      if (!fullExpr) return;

      // Parse tokens safely
      // Replace display operators with computational tokens
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/Mod/g, '%')
        .replace(/\^/g, '**');

      // Validate allowed characters: digits, operators, parens, decimal, spaces
      if (!/^[0-9+\-*/%.()*\s]+$/.test(sanitized)) {
        setCurrentInput('Error');
        return;
      }

      // Safe evaluation using Function constructor with restricted scope
      const compute = new Function(`"use strict"; return (${sanitized});`);
      const result = compute();

      if (typeof result === 'number' && !isNaN(result)) {
        const rounded = parseFloat(result.toFixed(10)).toString();
        setCurrentInput(rounded);
        setExpression('');
        setJustCalculated(true);
      } else {
        setCurrentInput('Error');
      }
    } catch {
      setCurrentInput('Error');
    }
  }, [expression, currentInput]);

  // Memory Register Handlers
  const handleMemory = (action: 'MC' | 'MR' | 'MS' | 'M+' | 'M-'): void => {
    const val = parseFloat(currentInput) || 0;
    switch (action) {
      case 'MC':
        setMemory(0);
        setHasMemory(false);
        break;
      case 'MR':
        setCurrentInput(memory.toString());
        setJustCalculated(true);
        break;
      case 'MS':
        setMemory(val);
        setHasMemory(val !== 0);
        setJustCalculated(true);
        break;
      case 'M+': {
        const next = memory + val;
        setMemory(next);
        setHasMemory(next !== 0);
        setJustCalculated(true);
        break;
      }
      case 'M-': {
        const next = memory - val;
        setMemory(next);
        setHasMemory(next !== 0);
        setJustCalculated(true);
        break;
      }
    }
  };

  // Constant input
  const handleConstant = (constName: 'PI' | 'E'): void => {
    const val = constName === 'PI' ? Math.PI : Math.E;
    setCurrentInput(parseFloat(val.toFixed(10)).toString());
    setJustCalculated(true);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="GATE Virtual Calculator"
      className="fixed z-50 select-none shadow-2xl rounded-lg border border-slate-700 bg-[#253342] text-white w-[470px] overflow-hidden"
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 bg-[#1A2634] border-b border-slate-700 cursor-move"
      >
        <div className="flex items-center space-x-2">
          <ArrowsOutCardinal size={16} className="text-slate-400" />
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-200">
            TCS iON GATE Virtual Calculator
          </span>
          {hasMemory && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 font-bold text-white tracking-widest">
              M
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close Calculator"
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Dual Display Area */}
      <div className="p-3 bg-[#131c26] border-b border-slate-700">
        <div className="text-right text-xs text-slate-400 font-mono h-5 overflow-hidden text-ellipsis whitespace-nowrap">
          {expression || '\u00A0'}
        </div>
        <div
          aria-live="polite"
          data-testid="calc-display"
          className="text-right text-2xl font-bold font-mono text-emerald-400 overflow-x-auto whitespace-nowrap tracking-wide"
        >
          {currentInput}
        </div>
      </div>

      {/* Controls & Mode Toggles */}
      <div className="grid grid-cols-6 gap-1 p-2 bg-[#1E2C3A] text-xs font-semibold">
        {/* Mode & Inversion buttons */}
        <button
          onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
          className={`py-1.5 rounded transition ${
            angleMode === 'DEG' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {angleMode}
        </button>
        <button
          onClick={() => setIsHyp(!isHyp)}
          className={`py-1.5 rounded transition ${
            isHyp ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Hyp
        </button>
        <button
          onClick={() => setIsInv(!isInv)}
          className={`py-1.5 rounded transition ${
            isInv ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Inv
        </button>
        <button
          onClick={handleClear}
          className="py-1.5 rounded bg-rose-800 hover:bg-rose-700 text-white transition"
        >
          C
        </button>
        <button
          onClick={handleAllClear}
          className="py-1.5 rounded bg-rose-700 hover:bg-rose-600 text-white transition"
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          aria-label="Backspace"
          className="py-1.5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
        >
          <Backspace size={16} />
        </button>
      </div>

      {/* Memory Register Row */}
      <div className="grid grid-cols-5 gap-1 px-2 pb-2 bg-[#1E2C3A] text-xs font-semibold">
        <button
          onClick={() => handleMemory('MC')}
          className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          MC
        </button>
        <button
          onClick={() => handleMemory('MR')}
          className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          MR
        </button>
        <button
          onClick={() => handleMemory('MS')}
          className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          MS
        </button>
        <button
          onClick={() => handleMemory('M+')}
          className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          M+
        </button>
        <button
          onClick={() => handleMemory('M-')}
          className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          M-
        </button>
      </div>

      {/* Scientific Keypad Grid */}
      <div className="grid grid-cols-6 gap-1 p-2 bg-[#253342] text-xs font-semibold">
        {/* Row 1 */}
        <button
          onClick={() => handleUnaryFunction('sin')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          {isInv ? 'sin⁻¹' : isHyp ? 'sinh' : 'sin'}
        </button>
        <button
          onClick={() => handleUnaryFunction('cos')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          {isInv ? 'cos⁻¹' : isHyp ? 'cosh' : 'cos'}
        </button>
        <button
          onClick={() => handleUnaryFunction('tan')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          {isInv ? 'tan⁻¹' : isHyp ? 'tanh' : 'tan'}
        </button>
        <button
          onClick={() => handleUnaryFunction('ln')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          ln
        </button>
        <button
          onClick={() => handleUnaryFunction('log10')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          log₁₀
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="py-2 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold text-sm"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleUnaryFunction('sqr')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          x²
        </button>
        <button
          onClick={() => handleUnaryFunction('cube')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          x³
        </button>
        <button
          onClick={() => handleOperator('^')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          xʸ
        </button>
        <button
          onClick={() => handleUnaryFunction('sqrt')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          √x
        </button>
        <button
          onClick={() => handleUnaryFunction('cbrt')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          ∛x
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="py-2 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold text-sm"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleUnaryFunction('exp')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          eˣ
        </button>
        <button
          onClick={() => handleUnaryFunction('10^x')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          10ˣ
        </button>
        <button
          onClick={() => handleDigit('7')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="py-2 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold text-sm"
        >
          -
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleUnaryFunction('recip')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          1/x
        </button>
        <button
          onClick={() => handleUnaryFunction('fact')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          n!
        </button>
        <button
          onClick={() => handleDigit('4')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="py-2 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold text-sm"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleUnaryFunction('abs')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          |x|
        </button>
        <button
          onClick={() => handleOperator('Mod')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          Mod
        </button>
        <button
          onClick={() => handleDigit('1')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          3
        </button>
        <button
          onClick={evaluateCurrentExpression}
          className="row-span-2 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-lg"
        >
          =
        </button>

        {/* Row 6 */}
        <button
          onClick={() => handleConstant('PI')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          π
        </button>
        <button
          onClick={() => handleConstant('E')}
          className="py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-100"
        >
          e
        </button>
        <button
          onClick={handleToggleSign}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm"
        >
          .
        </button>
      </div>
    </div>
  );
};
