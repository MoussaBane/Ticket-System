/**
 * Ticket Service
 * Frontend ticket service
 */

class TicketService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Generate tickets
   */
  async generateTickets(count, ticketType = 'UNKNOWN') {
    const response = await this.api.post('/api/tickets/generate', {
      count,
      ticketType,
    });
    return this.formatResponse(response);
  }

  /**
   * Validate ticket
   */
  async validateTicket(code) {
    const response = await this.api.post('/api/tickets/validate', { code });
    return this.formatResponse(response);
  }

  /**
   * Assign ticket
   */
  async assignTicket(ticketId, ticketType) {
    const response = await this.api.post('/api/tickets/assign', {
      ticketId,
      ticketType,
    });
    return this.formatResponse(response);
  }

  /**
   * Assign multiple tickets
   */
  async assignTicketsBulk(count, ticketType) {
    const response = await this.api.post('/api/tickets/assign-bulk', {
      count,
      ticketType,
    });
    return this.formatResponse(response);
  }

  /**
   * Get ticket statistics
   */
  async getStats() {
    const response = await this.api.get('/api/tickets/stats');
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
window.TicketService = TicketService;
