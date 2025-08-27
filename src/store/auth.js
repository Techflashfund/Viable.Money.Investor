import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      onboardingstatus: null,
      transactionId: null,
      isLoading: false,

      // Set user data and token
      setAuth: (userData, token, onboardingstatus = null) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          onboardingstatus: onboardingstatus,
          isLoading: false
        });
      },

      // Clear auth data
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          onboardingstatus: null,
          transactionId: null,
          isLoading: false
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Update user data
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Update onboarding status
      updateOnboardingStatus: (status) => {
        set({ onboardingstatus: status });
      },

      // Update transaction ID
      updateTransactionId: (transactionId) => {
        set({ transactionId: transactionId });
      },

      // Get auth headers for API calls
      getAuthHeaders: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      // Check if user session is valid
      isTokenValid: () => {
        const { token } = get();
        if (!token) return false;
        
        try {
          // Decode JWT to check expiry
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          return payload.exp > currentTime;
        } catch (error) {
          return false;
        }
      },

      // Initialize auth state (check token validity on app start)
      initAuth: async () => {
        const { isTokenValid, clearAuth } = get();
        if (!isTokenValid()) {
          clearAuth();
        }
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated,
        onboardingstatus: state.onboardingstatus,
        transactionId: state.transactionId
      })
    }
  )
);

export default useAuthStore;