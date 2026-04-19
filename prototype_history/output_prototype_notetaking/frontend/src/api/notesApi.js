import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export const notesApi = {
  /**
   * Fetch all notes, optionally filtered by a search query.
   * @param {string} [search] - Optional search term
   * @returns {Promise<Array>}
   */
  getAll: async (search = "") => {
    const params = search.trim() ? { search: search.trim() } : {};
    const response = await apiClient.get("/notes", { params });
    return response.data;
  },

  /**
   * Fetch a single note by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data;
  },

  /**
   * Create a new note.
   * @param {{ title: string, content: string }} payload
   * @returns {Promise<Object>}
   */
  create: async (payload) => {
    const response = await apiClient.post("/notes", payload);
    return response.data;
  },

  /**
   * Update an existing note.
   * @param {string} id
   * @param {{ title?: string, content?: string }} payload
   * @returns {Promise<Object>}
   */
  update: async (id, payload) => {
    const response = await apiClient.put(`/notes/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a note by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await apiClient.delete(`/notes/${id}`);
  },
};