import React, { useEffect } from 'react';
import Display from './Display.jsx';
import Button from './Button.jsx';
import { useCalculator } from '../hooks/useCalculator.js';

/**
 * Main Calculator component — renders the full calculator UI.
 */
function Calculator() {
  const {
    expression,
    display,
    error,
    isLoading,
    justEvaluated,
    handleNumber,
    handleOperator,
    handleParenthesis,
    handleToggleSign,
    handleEquals,
    handleClear,
    handleBackspace,
    handleKeyPress,
  } = useCalculator();

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      // Prevent default for keys we handle (avoid browser shortcuts)
      if (
        ['Enter', 'Backspace', 'Escape', '=', '+', '-', '*', '/', '%'].includes(e.key)
      ) {
        e.preventDefault();
      }
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress]);

  const buttonLayout = [
    // Row 1: Clear, Backspace, Parentheses, Divide
    [
      { label: 'C', variant: 'clear', action: handleClear, ariaLabel: 'Clear' },
      { label: '⌫', variant: 'action', action: handleBackspace, ariaLabel: 'Backspace' },
      { label: '( )', variant: 'action', action: () => handleParenthesis('('), ariaLabel: 'Open parenthesis' },
      { label: '÷', variant: 'operator', action: () => handleOperator('/'), ariaLabel: 'Divide' },
    ],
    // Row 2: 7, 8, 9, Multiply
    [
      { label: '7', variant: 'number', action: () => handleNumber('7') },
      { label: '8', variant: 'number', action: () => handleNumber('8') },
      { label: '9', variant: 'number', action: () => handleNumber('9') },
      { label: '×', variant: 'operator', action: () => handleOperator('*'), ariaLabel: 'Multiply' },
    ],
    // Row 3: 4, 5, 6, Subtract
    [
      { label: '4', variant: 'number', action: () => handleNumber('4') },
      { label: '5', variant: 'number', action: () => handleNumber('5') },
      { label: '6', variant: 'number', action: () => handleNumber('6') },
      { label: '−', variant: 'operator', action: () => handleOperator('-'), ariaLabel: 'Subtract' },
    ],
    // Row 4: 1, 2, 3, Add
    [
      { label: '1', variant: 'number', action: () => handleNumber('1') },
      { label: '2', variant: 'number', action: () => handleNumber('2') },
      { label: '3', variant: 'number', action: () => handleNumber('3') },
      { label: '+', variant: 'operator', action: () => handleOperator('+'), ariaLabel: 'Add' },
    ],
    // Row 5: +/-, 0, Decimal, Equals
    [
      { label: '+/−', variant: 'action', action: handleToggleSign, ariaLabel: 'Toggle sign' },
      { label: '0', variant: 'number', action: () => handleNumber('0') },
      { label: '.', variant: 'number', action: () => handleNumber('.'), ariaLabel: 'Decimal point' },
      {
        label: '=',
        variant: 'equals',
        action: handleEquals,
        ariaLabel: 'Equals',
        disabled: isLoading,
      },
    ],
  ];

  return (
    <div className="calculator" role="main" aria-label="Calculator">
      {/* Header */}
      <div className="calculator__header">
        <span className="calculator__title">Calculator</span>
        <span className="calculator__status">
          {isLoading && (
            <span className="calculator__loading-dot" aria-label="Calculating">
              ●
            </span>
          )}
        </span>
      </div>

      {/* Display */}
      <Display
        expression={expression}
        display={display}
        error={error}
        isLoading={isLoading}
        justEvaluated={justEvaluated}
      />

      {/* Extra operators row */}
      <div className="calculator__extra-row">
        <Button
          label="%"
          variant="action"
          onClick={() => handleOperator('%')}
          ariaLabel="Modulo"
        />
        <Button
          label="^"
          variant="action"
          onClick={() => handleOperator('^')}
          ariaLabel="Power"
        />
        <Button
          label="("
          variant="action"
          onClick={() => handleParenthesis('(')}
          ariaLabel="Open parenthesis"
        />
        <Button
          label=")"
          variant="action"
          onClick={() => handleParenthesis(')')}
          ariaLabel="Close parenthesis"
        />
      </div>

      {/* Main button grid */}
      <div className="calculator__grid">
        {buttonLayout.map((row, rowIdx) =>
          row.map((btn, colIdx) => (
            <Button
              key={`${rowIdx}-${colIdx}`}
              label={btn.label}
              variant={btn.variant}
              onClick={btn.action}
              ariaLabel={btn.ariaLabel}
              disabled={btn.disabled || false}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="calculator__footer">
        <span>Keyboard supported · Powered by FastAPI</span>
      </div>
    </div>
  );
}

export default Calculator;