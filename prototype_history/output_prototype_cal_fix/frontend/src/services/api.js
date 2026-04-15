const BASE_URL = '/api';

/**
 * Send an arithmetic expression to the backend for evaluation.
 * @param {string} expression - The math expression string.
 * @returns {Promise<{ result: number, expression: string }>}
 */
export async function calculate(expression) {
  const response = await fetch(`${BASE_URL}/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expression }),
  });

  const data = await response.json();

  if (!response.ok) {
    // FastAPI returns { detail: "..." } on 400
    throw new Error(data.detail || 'An unexpected error occurred.');
  }

  return data;
}