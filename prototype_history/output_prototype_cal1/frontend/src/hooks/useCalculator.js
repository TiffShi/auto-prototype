import { useState, useCallback } from 'react';
import { calculateExpression } from '../services/api.js';

const MAX_DISPLAY_LENGTH = 20;

/**
 * Custom hook encapsulating all calculator state and logic.
 */
export function useCalculator() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);

  /**
   * Clear all state — reset to initial.
   */
  const handleClear = useCallback(() => {
    setExpression('');
    setDisplay('0');
    setResult(null);
    setError(null);
    setIsLoading(false);
    setJustEvaluated(false);
  }, []);

  /**
   * Delete the last character from the current expression.
   */
  const handleBackspace = useCallback(() => {
    if (justEvaluated) {
      handleClear();
      return;
    }
    setError(null);
    setExpression((prev) => {
      const next = prev.slice(0, -1);
      setDisplay(next || '0');
      return next;
    });
  }, [justEvaluated, handleClear]);

  /**
   * Determine if a character is an operator symbol.
   */
  const isOperator = (char) => ['+', '-', '*', '/', '%', '^'].includes(char);

  /**
   * Handle digit or decimal point input.
   */
  const handleNumber = useCallback(
    (value) => {
      setError(null);

      // If we just got a result, start fresh with the new number
      if (justEvaluated) {
        setJustEvaluated(false);
        setResult(null);
        setExpression(value);
        setDisplay(value);
        return;
      }

      setExpression((prev) => {
        // Prevent multiple decimals in the current number segment
        if (value === '.') {
          const parts = prev.split(/[\+\-\*\/\%\^]/);
          const currentSegment = parts[parts.length - 1];
          if (currentSegment.includes('.')) return prev;
        }

        // Prevent leading zeros (e.g. "00" → just "0")
        if (value === '0' && (prev === '0' || prev === '')) {
          setDisplay('0');
          return prev;
        }

        const next = prev + value;

        if (next.length > MAX_DISPLAY_LENGTH) return prev;

        setDisplay(next);
        return next;
      });
    },
    [justEvaluated]
  );

  /**
   * Handle operator input (+, -, *, /, %, ^).
   */
  const handleOperator = useCallback(
    (op) => {
      setError(null);

      // If we just evaluated, continue from the result
      if (justEvaluated) {
        setJustEvaluated(false);
        const base = result !== null ? String(result) : expression;
        const next = base + op;
        setExpression(next);
        setDisplay(next);
        return;
      }

      setExpression((prev) => {
        if (prev === '' && op === '-') {
          // Allow leading negative sign
          setDisplay('-');
          return '-';
        }

        if (prev === '') return prev;

        // Replace trailing operator with the new one
        const lastChar = prev[prev.length - 1];
        let next;
        if (isOperator(lastChar)) {
          next = prev.slice(0, -1) + op;
        } else {
          next = prev + op;
        }

        if (next.length > MAX_DISPLAY_LENGTH) return prev;

        setDisplay(next);
        return next;
      });
    },
    [justEvaluated, result, expression]
  );

  /**
   * Handle parenthesis input.
   */
  const handleParenthesis = useCallback(
    (paren) => {
      setError(null);

      if (justEvaluated) {
        setJustEvaluated(false);
        setResult(null);
        setExpression(paren);
        setDisplay(paren);
        return;
      }

      setExpression((prev) => {
        const next = prev + paren;
        if (next.length > MAX_DISPLAY_LENGTH) return prev;
        setDisplay(next);
        return next;
      });
    },
    [justEvaluated]
  );

  /**
   * Toggle the sign of the current number or expression.
   */
  const handleToggleSign = useCallback(() => {
    setError(null);
    setExpression((prev) => {
      if (!prev || prev === '0') return prev;
      let next;
      if (prev.startsWith('-')) {
        next = prev.slice(1);
      } else {
        next = '-' + prev;
      }
      setDisplay(next);
      return next;
    });
  }, []);

  /**
   * Send the current expression to the backend API and display the result.
   */
  const handleEquals = useCallback(async () => {
    if (!expression || expression.trim() === '') return;
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    const { data, error: apiError } = await calculateExpression(expression);

    setIsLoading(false);

    if (apiError) {
      setError(apiError);
      setJustEvaluated(false);
      return;
    }

    if (data) {
      const resultValue = data.result;
      setResult(resultValue);
      setDisplay(String(resultValue));
      setJustEvaluated(true);
    }
  }, [expression, isLoading]);

  /**
   * Handle keyboard input.
   */
  const handleKeyPress = useCallback(
    (key) => {
      if (key >= '0' && key <= '9') {
        handleNumber(key);
      } else if (key === '.') {
        handleNumber('.');
      } else if (['+', '-', '*', '/', '%', '^'].includes(key)) {
        handleOperator(key);
      } else if (key === '(' || key === ')') {
        handleParenthesis(key);
      } else if (key === 'Enter' || key === '=') {
        handleEquals();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleClear();
      }
    },
    [
      handleNumber,
      handleOperator,
      handleParenthesis,
      handleEquals,
      handleBackspace,
      handleClear,
    ]
  );

  return {
    expression,
    display,
    result,
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
  };
}