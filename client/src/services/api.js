import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('evalyze_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('evalyze_token');
      localStorage.removeItem('evalyze_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Classrooms
export const classroomAPI = {
  list: () => api.get('/classrooms'),
  create: (data) => api.post('/classrooms', data),
  get: (id) => api.get(`/classrooms/${id}`),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
  join: (joinCode) => api.post('/classrooms/join', { joinCode }),
};

// Exams
export const examAPI = {
  listByClassroom: (classroomId) => api.get(`/exams/classroom/${classroomId}`),
  get: (id) => api.get(`/exams/${id}`),
  create: (formData) => api.post('/exams', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/exams/${id}`, data),
  updateAnswerKey: (id, formData) => api.patch(`/exams/${id}/answer-key`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Submissions
export const submissionAPI = {
  submit: (formData) => api.post('/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByExam: (examId) => api.get(`/submissions/exam/${examId}`),
  getMy: () => api.get('/submissions/my'),
  get: (id) => api.get(`/submissions/${id}`),
};

// Evaluations
export const evaluationAPI = {
  trigger: (submissionId, force = false) => api.post(`/evaluations/${submissionId}/evaluate`, { force }),
  get: (submissionId) => api.get(`/evaluations/${submissionId}`),
  override: (submissionId, data) => api.put(`/evaluations/${submissionId}/override`, data),
  approve: (submissionId) => api.patch(`/evaluations/${submissionId}/approve`),
  batch: (submissionIds) => api.post('/evaluations/batch', { submissionIds }),
};

// Analytics
export const analyticsAPI = {
  classroom: (classroomId) => api.get(`/analytics/classroom/${classroomId}`),
  exam: (examId) => api.get(`/analytics/exam/${examId}`),
  student: () => api.get('/analytics/student/me'),
};

export default api;
