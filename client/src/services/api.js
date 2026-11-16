import axios from 'axios';
import { getClientId } from './clientId';

// Same-origin '/api' by default (Vite proxy in dev, or the Express server hosting the build).
// Set VITE_API_URL (e.g. https://api.example.com/api) when the API is deployed on another host.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 45000 // 45s timeout for AI image analysis
});

// Identify this browser anonymously: private scan history, delete-only-my-own sightings
API.interceptors.request.use((config) => {
  config.headers['X-Client-Id'] = getClientId();
  return config;
});

// Detection API
export const detectSnake = async (formData, onUploadProgress) => {
  const response = await API.post('/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
  return response.data;
};

// History API
export const getHistory = async (page = 1, limit = 20) => {
  const response = await API.get(`/history?page=${page}&limit=${limit}`);
  return response.data;
};

export const getHistoryDetail = async (id) => {
  const response = await API.get(`/history/${id}`);
  return response.data;
};

export const deleteHistoryItem = async (id) => {
  const response = await API.delete(`/history/${id}`);
  return response.data;
};

// Snake Encyclopedia API
export const getSnakes = async (params = {}) => {
  const response = await API.get('/snakes', { params });
  return response.data;
};

export const getSnakeDetail = async (id) => {
  const response = await API.get(`/snakes/${id}`);
  return response.data;
};

// Community Sightings API
export const getSightings = async () => {
  const response = await API.get('/sightings');
  return response.data;
};

export const createSighting = async (sightingData) => {
  const response = await API.post('/sightings', sightingData);
  return response.data;
};

export const deleteSighting = async (id) => {
  const response = await API.delete(`/sightings/${id}`);
  return response.data;
};

// Hospitals & Antivenom Locator API
export const getHospitals = async (params = {}) => {
  const response = await API.get('/hospitals', { params });
  return response.data;
};

// AI Chatbot (SerpentBot) API
export const sendChatMessage = async (message, conversationHistory = []) => {
  const response = await API.post('/chat', { message, conversationHistory });
  return response.data;
};

export default API;
