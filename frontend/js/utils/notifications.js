/**
 * Notification Utility
 * Toast/alert notifications for user feedback
 */

class NotificationManager {
  /**
   * Show success notification
   */
  static success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  /**
   * Show error notification
   */
  static error(message, duration = 5000) {
    this.show(message, 'danger', duration);
  }

  /**
   * Show warning notification
   */
  static warning(message, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  /**
   * Show info notification
   */
  static info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }

  /**
   * Generic show notification
   */
  static show(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.role = 'alert';
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Get or create container
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'position-fixed top-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }

    // Add toast
    container.appendChild(toast);

    // Auto-remove
    if (duration) {
      setTimeout(() => {
        toast.remove();
      }, duration);
    }

    return toast;
  }
}

window.NotificationManager = NotificationManager;
