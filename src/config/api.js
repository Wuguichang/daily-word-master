const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3003';

// 添加通用请求配置
export const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors',
  credentials: 'include'
};

export const API_URLS = {
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  forgotPassword: `${API_BASE_URL}/api/forgot-password`,
  userStats: `${API_BASE_URL}/api/user/stats`,
};

export default API_URLS; 