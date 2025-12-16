/**
 * User Service
 * Frontend user management service
 */

class UserService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Get all users
   */
  async getAllUsers(role = null) {
    const endpoint = role ? `/api/users?role=${role}` : '/api/users';
    const response = await this.api.get(endpoint);
    return this.formatResponse(response);
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const response = await this.api.get(`/api/users/${id}`);
    return this.formatResponse(response);
  }

  /**
   * Create user
   */
  async createUser(nom, prenom, email, password, role = 'normal') {
    const response = await this.api.post('/api/users', {
      nom,
      prenom,
      email,
      password,
      role,
    });
    return this.formatResponse(response);
  }

  /**
   * Update user
   */
  async updateUser(id, updates) {
    const response = await this.api.put(`/api/users/${id}`, updates);
    return this.formatResponse(response);
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const response = await this.api.delete(`/api/users/${id}`);
    return this.formatResponse(response);
  }

  /**
   * Reset password
   */
  async resetPassword(id, newPassword) {
    const response = await this.api.post(`/api/users/${id}/reset-password`, {
      newPassword,
    });
    return this.formatResponse(response);
  }

  /**
   * Format response
   */
  formatResponse(response) {
    if (response.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }
    return {
      success: false,
      message: response.data.message || 'An error occurred',
      errors: response.data.errors,
    };
  }
}

// Export
window.UserService = UserService;
