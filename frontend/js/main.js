/**
 * Main Frontend Initialization
 * Sets up API client and services
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize API Client
  window.api = new APIClient();

  // Initialize Services
  window.authService = new AuthService(window.api);
  window.ticketService = new TicketService(window.api);
  window.userService = new UserService(window.api);

  // Check authentication
  const user = window.authService.getCurrentUser();
  const token = window.authService.getToken();

  // If not authenticated and not on login page, redirect
  if (!token && !window.location.pathname.endsWith('index.html')) {
    window.location.href = '/index.html';
  }

  // Log initialization
  console.log('✅ Frontend services initialized');
  if (user) {
    console.log(`👤 User: ${user.email} (${user.role})`);
  }
});
