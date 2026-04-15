import { useState, useCallback } from 'react';
import { calculate } from '../services/api';

const MAX_EXPRESSION_LENGTH = 64;

export function useCalculator() {
  const [expression, setExpression] = useState('');
  const [displayResult, setDisplayResult] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);

  /**
   * Append a character to the current expression.
   * If the user just got a result and presses a number, start fresh.
   * If the user just got a result and presses an operator, chain from result.
   */
  const handleInput = useCallback(
    (value) => {
      setIsError(false);

      if (justEvaluated) {
        const isOperator = ['+', '-', '*', '/'].includes(value);
        if (isOperator) {
          // Chain: use the result as the start of the next expression
          setExpression((displayResult !== '' ? displayResult : '0') + ' ' + value + ' ');
          setDisplayResult('');
          setJustEvaluated(false);
          return;
        } else {
          // Start fresh with the new number/decimal
          setExpression(value);
          setDisplayResult('');
          setJustEvaluated(false);
          return;
        }
      }

      setExpression((prev) => {
        if (prev.length >= MAX_EXPRESSION_LENGTH) return prev;

        // Prevent multiple consecutive operators
        const trimmed = prev.trimEnd();
        const lastChar = trimmed.slice(-1);
        const isOperator = ['+', '-', '*', '/'].includes(value);
        const lastIsOperator = ['+', '-', '*', '/'].includes(lastChar);

        if (isOperator && lastIsOperator) {
          // Replace the last operator with the new one
          return trimmed.slice(0, -1).trimEnd() + ' ' + value + ' ';
        }

        // Add spacing around operators for readability
        if (isOperator) {
          return prev.trimEnd() + ' ' + value + ' ';
        }

        return prev + value;
      });
    },
    [justEvaluated, displayResult]
  );

  /**
   * Evaluate the current expression by calling the backend API.
   */
  const handleEquals = useCallback(async () => {
    if (!expression.trim() || isLoading) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const data = await calculate(expression.trim());
      setDisplayResult(String(data.result));
      setJustEvaluated(true);
    } catch (err) {
      setDisplayResult(err.message || 'Error');
      setIsError(true);
      setJustEvaluated(false);
    } finally {
      setIsLoading(false);
    }
  }, [expression, isLoading]);

  /**
   * Clear all state — reset to initial.
   */
  const handleClear = useCallback(() => {
    setExpression('');
    setDisplayResult('');
    setIsError(false);
    setIsLoading(false);
    setJustEvaluated(false);
  }, []);

  /**
   * Delete the last character from the expression.
   */
  const handleBackspace = useCallback(() => {
    if (justEvaluated) {
      handleClear();
      return;
    }
    setIsError(false);
    setExpression((prev) => {
      // Remove trailing space + operator + space (e.g. " + ")
      const trimmed = prev.trimEnd();
      const lastChar = trimmed.slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) {
        return trimmed.slice(0, -1).trimEnd();
      }
      return prev.slice(0, -1);
    });
  }, [justEvaluated, handleClear]);

  return {
    expression,
    displayResult,
    isError,
    isLoading,
    handleInput,
    handleEquals,
    handleClear,
    handleBackspace,
  };
}