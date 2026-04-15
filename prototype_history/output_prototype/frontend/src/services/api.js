import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login/`, credentials);
    return response.data;
};

export const signup = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/users/`, userData);
    return response.data;
};

export const logWaterIntake = async (intakeData) => {
    const response = await axios.post(`${API_URL}/water_intake/`, intakeData);
    return response.data;
};

export const fetchWaterIntake = async () => {
    const response = await axios.get(`${API_URL}/water_intake/`);
    return response.data;
};

export const setReminder = async (reminderData) => {
    const response = await axios.post(`${API_URL}/reminders/`, reminderData);
    return response.data;
};