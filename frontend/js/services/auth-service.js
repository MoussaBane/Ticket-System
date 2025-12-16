/**
 * Auth Service
 * Frontend authentication service
 */

class AuthService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await this.api.post('/api/auth/login', { email, password });
    
    if (response.success && response.data.data) {
      const { token, user } = response.data.data;
      this.api.setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, message: response.data.message };
  }

  /**
   * Register user
   */
  async register(nom, prenom, email, password) {
    const response = await this.api.post('/api/auth/register', {
      nom,
      prenom,
      email,
      password,
    });
    return response.success
      ? { success: true, user: response.data.data }
      : { success: false, message: response.data.message };
  }

  /**
   * Logout user
   */
  logout() {
    this.api.clearAuth();
    localStorage.removeItem('user');
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if logged in
   */
  isLoggedIn() {
    return !!this.api.getToken() && !!this.getCurrentUser();
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  /**
   * Check if user is manager
   */
  isManager() {
    const user = this.getCurrentUser();
    return user && user.role === 'manager';
  }
}

// Export
window.AuthService = AuthService;
