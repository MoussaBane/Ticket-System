/**
 * Main Frontend Initialization
 * Sets up API client and services
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize API Client
  window.api = new APIClient();

  // Initialize Services (check if classes exist first)
  if (typeof AuthService !== 'undefined') {
    window.authService = new AuthService(window.api);
  }
  if (typeof TicketService !== 'undefined') {
    window.ticketService = new TicketService(window.api);
  }
  if (typeof UserService !== 'undefined') {
    window.userService = new UserService(window.api);
  }

  // Check authentication (only if authService was initialized)
  if (window.authService) {
    const user = window.authService.getCurrentUser();
    const token = window.authService.getToken();

    // If not authenticated and not on login page, redirect
    if (
      !token &&
      !window.location.pathname.endsWith('index.html') &&
      window.location.pathname !== '/'
    ) {
      window.location.href = '/index.html';
    }

    // Log user info
    if (user) {
      console.log(`👤 User: ${user.email} (${user.role})`);
    }
  }

  // Log initialization
  console.log('✅ Frontend services initialized');
});
