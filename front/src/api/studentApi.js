import axios from "axios";

const BASE_URL = "http://localhost:8080";

// ============================================
// 🔧 Axios instance — har bir so'rovga token
// ============================================
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${BASE_URL}/api/v1/auth/refresh?refreshToken=${refreshToken}`
          );
          const newToken = res.data?.token || res.data?.access_token || res.data;
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          clearLoginData();
          window.location.href = "/student/login";
        }
      } else {
        clearLoginData();
        window.location.href = "/student/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// 🔐 Token yordamchi funktsiyalar
// ============================================
export const saveLoginData = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("studentId", data.id);
  localStorage.setItem("fullName", data.fullName);
  localStorage.setItem("studentLogin", data.login);
};

export const clearLoginData = () => {
  ["token", "refreshToken", "studentId", "fullName", "studentLogin"].forEach(
    (k) => localStorage.removeItem(k)
  );
};

export const isAuthenticated = () => !!localStorage.getItem("token");

export const getStoredStudentInfo = () => ({
  id: localStorage.getItem("studentId"),
  fullName: localStorage.getItem("fullName"),
  login: localStorage.getItem("studentLogin"),
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
});

// ============================================
// 🎓 STUDENT
// ============================================
export const studentLogin = async (login, password) => {
  const res = await axios.post(`${BASE_URL}/api/v1/students/login`, { login, password });
  return res.data; // { id, fullName, login, token, refreshToken }
};

export const studentRegister = async (data) => {
  // data = { fullName, login, password, passwordConfirm, groupsId? }
  const res = await axios.post(`${BASE_URL}/api/v1/students/register`, data);
  return res.data;
};

export const createStudent = (data) => api.post("/api/v1/students", data);
export const getAllStudents = () => api.get("/api/v1/students");
export const getStudent = (id) => api.get(`/api/v1/students/${id}`);
export const updateStudent = (id, data) => api.put(`/api/v1/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/api/v1/students/${id}`);

// ============================================
// 👥 GROUPS
// ============================================
export const createGroup = (data) => api.post("/api/v1/groups", data);
export const getAllGroups = () => api.get("/api/v1/groups");
export const getGroup = (id) => api.get(`/api/v1/groups/${id}`);
export const updateGroup = (id, data) => api.put(`/api/v1/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/api/v1/groups/${id}`);

// ============================================
// 📚 SUBJECTS
// ============================================
export const createSubject = (data) => api.post("/api/v1/subjects", data);
export const getAllSubjects = () => api.get("/api/v1/subjects");
export const getSubject = (id) => api.get(`/api/v1/subjects/${id}`);
export const updateSubject = (id, data) => api.put(`/api/v1/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/api/v1/subjects/${id}`);

// ============================================
// 📋 CURRICULUM — endpoint: /api/v1/curriculm
// ============================================
export const createCurriculum = (data) => api.post("/api/v1/curriculm", data);
export const getAllCurriculums = () => api.get("/api/v1/curriculm");
export const getCurriculum = (id) => api.get(`/api/v1/curriculm/${id}`);
export const updateCurriculum = (id, data) => api.put(`/api/v1/curriculm/${id}`, data);
export const deleteCurriculum = (id) => api.delete(`/api/v1/curriculm/${id}`);

// ============================================
// 👤 AUTH (Admin)
// ============================================
export const adminLogin = (phone, password, rememberMe = false) =>
  axios.post(`${BASE_URL}/api/v1/auth/login`, { phone, password, rememberMe });
export const refreshAdminToken = (token) =>
  axios.post(`${BASE_URL}/api/v1/auth/refresh?refreshToken=${token}`);
export const decodeToken = () => api.get("/api/v1/auth/decode");
export const changeAdminPassword = (adminId, password) =>
  api.put(`/api/v1/auth/password/${adminId}`, { password });

// ============================================
// 📁 FILE
// ============================================
export const uploadFile = (file, prefix) => {
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("prefix", prefix);
  return api.post("/api/v1/file/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getFileUrl = (id) => `${BASE_URL}/api/v1/file/img/${id}`;
export const downloadFile = (id) => `${BASE_URL}/api/v1/file/getFile/${id}`;

export default api;

