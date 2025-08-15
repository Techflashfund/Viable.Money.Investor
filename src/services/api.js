// API service functions for user authentication

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  // Registration Step 1: Send initial registration data and get OTP
  async register(userData) {
    return this.apiCall('/api/user/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Registration Step 2: Verify OTP
  async verifyOTP(email, otp) {
    return this.apiCall('/api/user/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  }

  // Registration Step 3: Set PIN (completes registration)
  async setPIN(email, pin, confirmPin) {
    return this.apiCall('/api/user/set-pin', {
      method: 'POST',
      body: JSON.stringify({ email, pin, confirmPin })
    });
  }

  // Resend registration OTP
  async resendOTP(email) {
    return this.apiCall('/api/user/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Login Step 1: Request login OTP
  async loginRequest(identifier) {
    return this.apiCall('/api/user/login-request', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  }

  // Login Step 2: Verify login OTP and PIN
  async loginVerify(identifier, otp, pin) {
    return this.apiCall('/api/user/login-verify', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, pin })
    });
  }

  // Resend login OTP
  async resendLoginOTP(identifier) {
    return this.apiCall('/api/user/resend-login-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  }

  // Get user profile
  async getProfile(identifier) {
    return this.apiCall(`/api/user/profile/${identifier}`, {
      method: 'GET'
    });
  }

  // Check username availability
  async checkUsername(username) {
    return this.apiCall(`/api/user/check-username/${username}`, {
      method: 'GET'
    });
  }

  // Admin endpoints (if needed)
  async getAllUsers(params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    return this.apiCall(`/api/user/admin/all?${queryString}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async updateUserStatus(userId, isActive, token) {
    return this.apiCall(`/api/user/admin/status/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isActive })
    });
  }

  async deleteUser(userId, token) {
    return this.apiCall(`/api/user/admin/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async getAnalytics(token) {
    return this.apiCall('/api/user/admin/analytics', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

// Create and export API service instance
// You can set the baseUrl when using the component
const createApiService = (baseUrl) => new ApiService(baseUrl);

export default createApiService;