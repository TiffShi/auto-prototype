import axios from 'axios';

/**
 * Calls the POST /convert endpoint to convert a temperature value.
 *
 * @param {Object} params
 * @param {number} params.value       - The numeric temperature value
 * @param {string} params.fromScale   - Source scale: 'Celsius' | 'Fahrenheit' | 'Kelvin'
 * @param {string} params.toScale     - Target scale: 'Celsius' | 'Fahrenheit' | 'Kelvin'
 * @returns {Promise<Object>}         - Parsed response: { result, from_scale, to_scale, input_value }
 */
export async function convertTemperature({ value, fromScale, toScale }) {
  try {
    const response = await axios.post('/api/convert', {
      value: parseFloat(value),
      from_scale: fromScale,
      to_scale: toScale,
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const detail = err.response.data?.detail;
      if (typeof detail === 'string') {
        throw new Error(detail);
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors come as an array
        const messages = detail.map((d) => d.msg).join('; ');
        throw new Error(messages);
      } else {
        throw new Error('An unexpected server error occurred.');
      }
    } else if (err.request) {
      throw new Error(
        'Unable to reach the server. Please check your connection.'
      );
    } else {
      throw new Error(err.message || 'An unknown error occurred.');
    }
  }
}