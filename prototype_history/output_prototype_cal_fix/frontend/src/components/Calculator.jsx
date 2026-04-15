import React, { useEffect, useCallback } from 'react';
import Display from './Display';
import Button from './Button';
import { useCalculator } from '../hooks/useCalculator';

const BUTTON_LAYOUT = [
  { label: 'C',   variant: 'action',   action: 'clear' },
  { label: '⌫',   variant: 'action',   action: 'backspace' },
  { label: '(',   variant: 'operator', action: 'input', value: '(' },
  { label: ')',   variant: 'operator', action: 'input', value: ')' },

  { label: '7',   variant: 'number',   action: 'input', value: '7' },
  { label: '8',   variant: 'number',   action: 'input', value: '8' },
  { label: '9',   variant: 'number',   action: 'input', value: '9' },
  { label: '÷',   variant: 'operator', action: 'input', value: '/' },

  { label: '4',   variant: 'number',   action: 'input', value: '4' },
  { label: '5',   variant: 'number',   action: 'input', value: '5' },
  { label: '6',   variant: 'number',   action: 'input', value: '6' },
  { label: '×',   variant: 'operator', action: 'input', value: '*' },

  { label: '1',   variant: 'number',   action: 'input', value: '1' },
  { label: '2',   variant: 'number',   action: 'input', value: '2' },
  { label: '3',   variant: 'number',   action: 'input', value: '3' },
  { label: '−',   variant: 'operator', action: 'input', value: '-' },

  { label: '0',   variant: 'zero',     action: 'input', value: '0' },
  { label: '.',   variant: 'number',   action: 'input', value: '.' },
  { label: '=',   variant: 'equals',   action: 'equals' },
  { label: '+',   variant: 'operator', action: 'input', value: '+' },
];

function Calculator() {
  const {
    expression,
    displayResult,
    isError,
    isLoading,
    handleInput,
    handleEquals,
    handleClear,
    handleBackspace,
  } = useCalculator();

  // Keyboard support
  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key;

      if (key >= '0' && key <= '9') { handleInput(key); return; }
      if (key === '.') { handleInput('.'); return; }
      if (key === '+') { handleInput('+'); return; }
      if (key === '-') { handleInput('-'); return; }
      if (key === '*') { handleInput('*'); return; }
      if (key === '/') { e.preventDefault(); handleInput('/'); return; }
      if (key === '(') { handleInput('('); return; }
      if (key === ')') { handleInput(')'); return; }
      if (key === 'Enter' || key === '=') { e.preventDefault(); handleEquals(); return; }
      if (key === 'Backspace') { handleBackspace(); return; }
      if (key === 'Escape' || key === 'c' || key === 'C') { handleClear(); return; }
    },
    [handleInput, handleEquals, handleClear, handleBackspace]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleButtonClick = (btn) => {
    if (btn.action === 'clear') { handleClear(); return; }
    if (btn.action === 'backspace') { handleBackspace(); return; }
    if (btn.action === 'equals') { handleEquals(); return; }
    if (btn.action === 'input') { handleInput(btn.value); return; }
  };

  return (
    <div className="calculator" role="application" aria-label="Calculator">
      <div className="calculator__header">
        <span className="calculator__title">Calculator</span>
      </div>

      <Display
        expression={expression}
        result={displayResult}
        isError={isError}
        isLoading={isLoading}
      />

      <div className="calculator__grid">
        {BUTTON_LAYOUT.map((btn, idx) => (
          <Button
            key={idx}
            label={btn.label}
            variant={btn.variant}
            disabled={isLoading}
            onClick={() => handleButtonClick(btn)}
          />
        ))}
      </div>

      <div className="calculator__footer">
        <span>Keyboard supported · Powered by FastAPI</span>
      </div>
    </div>
  );
}

export default Calculator;