/**
 * Counter Service
 * Provides utility functions for managing auto-increment counters
 */

const Counter = require("../models/Counter");

/**
 * Get next sequence number for a given counter
 * @param {string} name - The counter name (e.g., "ticketNo")
 * @returns {Promise<number>} The next sequence number
 */
async function getNextSequence(name) {
  try {
    const counter = await Counter.findByIdAndUpdate(
      name,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  } catch (error) {
    console.error(`Error getting next sequence for ${name}:`, error);
    throw error;
  }
}

/**
 * Set the counter to a specific value
 * @param {string} name - The counter name
 * @param {number} value - The value to set
 */
async function setCounter(name, value) {
  try {
    await Counter.findByIdAndUpdate(
      name,
      { seq: value },
      { upsert: true }
    );
  } catch (error) {
    console.error(`Error setting counter ${name}:`, error);
    throw error;
  }
}

/**
 * Get current counter value
 * @param {string} name - The counter name
 * @returns {Promise<number>} The current value
 */
async function getCounter(name) {
  try {
    const counter = await Counter.findById(name);
    return counter ? counter.seq : 0;
  } catch (error) {
    console.error(`Error getting counter ${name}:`, error);
    throw error;
  }
}

module.exports = {
  getNextSequence,
  setCounter,
  getCounter,
};
