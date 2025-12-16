/**
 * API Client
 * Centralized HTTP client for all API calls
 * Handles authentication, error handling, and request/response formatting
 */

class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL || window.location.origin;
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get authentication token
   */
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get request headers with auth
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: this.getHeaders(),
      ...options,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      // Check if token expired (401)
      if (response.status === 401) {
        this.clearAuth();
        window.location.href = '/index.html'; // Redirect to login
      }

      // Return response (let caller handle success/error)
      return {
        success: response.ok,
        status: response.status,
        data: result,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        status: 0,
        data: {
          success: false,
          message: 'Network error: ' + error.message,
        },
      };
    }
  }

  /**
   * GET request
   */
  get(endpoint, options) {
    return this.request('GET', endpoint, null, options);
  }

  /**
   * POST request
   */
  post(endpoint, data, options) {
    return this.request('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  put(endpoint, data, options) {
    return this.request('PUT', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  delete(endpoint, options) {
    return this.request('DELETE', endpoint, null, options);
  }
}

// Export for use
window.APIClient = APIClient;
