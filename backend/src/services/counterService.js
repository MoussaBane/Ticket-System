/**
 * Counter Service
 * Manages auto-increment counters in database
 */

const Counter = require('../models/Counter');
const logger = require('../utils/logger');

/**
 * Get next sequence number for a counter
 */
async function getNextSequence(name) {
  try {
    if (!name) {
      throw new Error('Counter name is required');
    }

    const counter = await Counter.findByIdAndUpdate(
      name,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    return counter.seq;
  } catch (error) {
    logger.error('CounterService', `Failed to get next sequence for ${name}`, error.message);
    throw error;
  }
}

/**
 * Set counter to specific value
 */
async function setCounter(name, value) {
  try {
    if (!name || value === undefined) {
      throw new Error('Counter name and value are required');
    }

    await Counter.findByIdAndUpdate(
      name,
      { seq: value },
      { upsert: true }
    );

    logger.info('CounterService', `Counter ${name} set to ${value}`);
  } catch (error) {
    logger.error('CounterService', `Failed to set counter ${name}`, error.message);
    throw error;
  }
}

/**
 * Get current counter value
 */
async function getCounter(name) {
  try {
    if (!name) {
      throw new Error('Counter name is required');
    }

    const counter = await Counter.findById(name);
    return counter ? counter.seq : 0;
  } catch (error) {
    logger.error('CounterService', `Failed to get counter ${name}`, error.message);
    throw error;
  }
}

/**
 * Reset counter to 0
 */
async function resetCounter(name) {
  try {
    if (!name) {
      throw new Error('Counter name is required');
    }

    await Counter.findByIdAndUpdate(
      name,
      { seq: 0 },
      { upsert: true }
    );

    logger.info('CounterService', `Counter ${name} reset to 0`);
  } catch (error) {
    logger.error('CounterService', `Failed to reset counter ${name}`, error.message);
    throw error;
  }
}

module.exports = {
  getNextSequence,
  setCounter,
  getCounter,
  resetCounter,
};
