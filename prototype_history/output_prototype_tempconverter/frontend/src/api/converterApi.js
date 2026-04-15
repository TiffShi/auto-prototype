import axios from "axios";

/**
 * Calls the POST /convert endpoint to convert a temperature value.
 *
 * @param {number} value - The numeric temperature value
 * @param {string} fromScale - Source scale: 'celsius' | 'fahrenheit' | 'kelvin'
 * @param {string} toScale - Target scale: 'celsius' | 'fahrenheit' | 'kelvin'
 * @returns {Promise<Object>} The conversion response object
 */
export async function convertTemperature(value, fromScale, toScale) {
  const response = await axios.post("/convert", {
    value,
    from_scale: fromScale,
    to_scale: toScale,
  });
  return response.data;
}