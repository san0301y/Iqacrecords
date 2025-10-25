import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Faculty API calls
// In your api.js - Add these to facultyAPI
export const facultyAPI = {
  getAll: () => api.get('/faculty'),
  getById: (id) => api.get(`/faculty/${id}`),
  add: (facultyData) => api.post('/faculty', facultyData),
  update: (id, facultyData) => api.put(`/faculty/${id}`, facultyData),
  delete: (id) => api.delete(`/faculty/${id}`),
};

// IQAC API calls
export const iqacAPI = {
  getAll: () => api.get('/iqac'),
  getByFaculty: (facultyId) => api.get(`/iqac/faculty/${facultyId}`),
  add: (iqacData) => api.post('/iqac', iqacData),
  delete: (recordId, facultyId = '') => api.delete(`/iqac/${recordId}?faculty_id=${facultyId}`),
};

// CRITERIA API calls - ADD THIS SECTION
export const criteriaAPI = {
  getAll: () => api.get('/criteria'),
  getById: (id) => api.get(`/criteria/${id}`),
  create: (data) => api.post('/criteria', data),
  update: (id, data) => api.put(`/criteria/${id}`, data),
  delete: (id) => api.delete(`/criteria/${id}`),
};

// Additional APIs
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
};

export const facultySummaryAPI = {
  get: (facultyId) => api.get(`/faculty/${facultyId}/summary`),
};

export default api;