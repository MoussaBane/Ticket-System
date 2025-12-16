/**
 * Storage Utility
 * Wrapper for localStorage with JSON support
 */

class StorageManager {
  /**
   * Set item
   */
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage Error:', error);
    }
  }

  /**
   * Get item
   */
  static getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage Error:', error);
      return null;
    }
  }

  /**
   * Remove item
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage Error:', error);
    }
  }

  /**
   * Clear all
   */
  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage Error:', error);
    }
  }

  /**
   * Check if key exists
   */
  static hasItem(key) {
    return localStorage.getItem(key) !== null;
  }
}

window.StorageManager = StorageManager;
