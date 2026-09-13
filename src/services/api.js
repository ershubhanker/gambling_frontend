import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.startsWith('/login')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await axios.post(`${API_URL}/token`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // ----- Wallet -----
  deposit: async (amount, note = null) => {
    const response = await api.post('/me/deposit', { amount, note });
    return response.data;
  },
  withdraw: async (amount, note = null) => {
    const response = await api.post('/me/withdraw', { amount, note });
    return response.data;
  },
  getMyTransactions: async (limit = 50) => {
    const response = await api.get(`/me/transactions?limit=${limit}`);
    return response.data;
  },

  // ----- Settings -----
  updateSettings: async ({ email, currentPassword, newPassword }) => {
    const params = new URLSearchParams();
    if (email !== undefined) params.append('email', email);
    if (currentPassword) params.append('current_password', currentPassword);
    if (newPassword) params.append('new_password', newPassword);
    const response = await api.patch(`/me/settings?${params.toString()}`);
    return response.data;
  },

  // ----- Admin -----
  adminListUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  adminSearchUsers: async (query) => {
    const response = await api.get(
      `/admin/users/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },
  adminCreateUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  adminDeleteUser: async (userId) => {
    await api.delete(`/admin/users/${userId}`);
  },
  adminToggleActive: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/toggle-active`);
    return response.data;
  },
  adminAdjustBalance: async (userId, amount, note = null) => {
    const response = await api.patch(`/admin/users/${userId}/balance`, {
      amount,
      note,
    });
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Cricket API
// Backend router prefix is "/cricket", so all endpoints start with /cricket
// ---------------------------------------------------------------------------
export const cricketAPI = {
  // ----- User Routes -----
  getMatches: async () => {
    const response = await api.get('/cricket/matches');
    return response.data;
  },

  getMatchDetails: async (matchId) => {
    const response = await api.get(`/cricket/matches/${matchId}`);
    return response.data;
  },

  placeBet: async (betData) => {
    const response = await api.post('/cricket/bets', betData);
    return response.data;
  },

  getMyBets: async () => {
    const response = await api.get('/cricket/my-bets');
    return response.data;
  },

  // ----- Admin Routes -----
  adminCreateMatch: async (matchData) => {
    const response = await api.post('/cricket/admin/matches', matchData);
    return response.data;
  },

  adminUpdateMatch: async (matchId, matchData) => {
    const response = await api.patch(
      `/cricket/admin/matches/${matchId}`,
      matchData
    );
    return response.data;
  },

  adminDeleteMatch: async (matchId) => {
    await api.delete(`/cricket/admin/matches/${matchId}`);
  },
};


export const withdrawAPI = {
    // User
    create: async (payload) => {
      const response = await api.post('/withdrawals', payload);
      return response.data;
    },
  
    getMyRequests: async () => {
      const response = await api.get('/withdrawals/my-requests');
      return response.data;
    },
  
    // Admin
    adminList: async (statusFilter = 'Pending') => {
      const response = await api.get(
        `/withdrawals/admin/all?status_filter=${encodeURIComponent(statusFilter)}`
      );
      return response.data;
    },
  
    adminUpdate: async (requestId, status) => {
      const response = await api.patch(`/withdrawals/admin/${requestId}`, { status });
      return response.data;
    },
  };


  // ---------------------------------------------------------------------------
// Fancy Markets API
// ---------------------------------------------------------------------------
export const fancyAPI = {
    // Public
    listByMatch: async (matchId, category = 'ALL') => {
      const url = category && category !== 'ALL'
        ? `/fancy/match/${matchId}?category=${encodeURIComponent(category)}`
        : `/fancy/match/${matchId}`;
      const res = await api.get(url);
      return res.data;
    },
  
    // User
    placeBet: async (payload) => {
      const res = await api.post('/fancy/bets', payload);
      return res.data;
    },
    getMyBets: async () => {
      const res = await api.get('/fancy/my-bets');
      return res.data;
    },
  
    // Admin
    adminCreate: async (payload) => {
      const res = await api.post('/fancy/admin/markets', payload);
      return res.data;
    },
    adminUpdate: async (marketId, payload) => {
      const res = await api.patch(`/fancy/admin/markets/${marketId}`, payload);
      return res.data;
    },
    adminDelete: async (marketId) => {
      await api.delete(`/fancy/admin/markets/${marketId}`);
    },
    adminSettle: async (marketId, result) => {
      const res = await api.patch(`/fancy/admin/markets/${marketId}/settle`, { result });
      return res.data;
    },
  };
export default api;