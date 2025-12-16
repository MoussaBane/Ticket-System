/**
 * Ticket Service
 * Business logic for ticket management
 */

const Ticket = require('../models/Ticket');
const Counter = require('../models/Counter');
const logger = require('../utils/logger');
const constants = require('../config/constants');

/**
 * Generate bulk tickets
 */
async function generateTickets(count, ticketType = 'UNKNOWN') {
  try {
    // Validate
    if (!count || count < 1 || count > 1000) {
      throw {
        message: 'Count must be between 1 and 1000',
        status: 400,
      };
    }

    if (!Object.values(constants.TICKET_TYPES).includes(ticketType)) {
      throw {
        message: `Invalid ticket type. Must be one of: ${Object.values(constants.TICKET_TYPES).join(', ')}`,
        status: 400,
      };
    }

    logger.info('TicketService', `Generating ${count} tickets of type ${ticketType}`);

    // Check limits for VIP/NORMAL
    let limit = null;
    let remaining = null;
    if (['VIP', 'NORMAL'].includes(ticketType)) {
      const typeCount = await Ticket.countDocuments({ ticketType });
      limit = ticketType === 'VIP' ? 90 : 410;
      remaining = limit - typeCount;

      if (remaining <= 0) {
        throw {
          message: `Quota ${ticketType} fermé: limite ${limit} atteinte`,
          status: 400,
        };
      }

      if (count > remaining) {
        count = remaining;
        logger.warn('TicketService', `Ticket count adjusted to ${count} (limit: ${limit})`);
      }
    }

    // Reset counter if empty
    const totalTickets = await Ticket.countDocuments();
    if (totalTickets === 0) {
      await Counter.findByIdAndUpdate('ticketNo', { seq: 0 }, { upsert: true });
    }

    // Generate in batches
    const BATCH_SIZE = 100;
    const tickets = [];

    for (let batch = 0; batch < Math.ceil(count / BATCH_SIZE); batch++) {
      const batchCount = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE);
      const ticketsToInsert = [];

      for (let i = 0; i < batchCount; i++) {
        const ticketNo = await getNextSequenceNumber('ticketNo');
        ticketsToInsert.push({
          ticketNo,
          code: generateTicketCode(),
          ticketType,
        });
      }

      const batchResult = await Ticket.insertMany(ticketsToInsert);
      tickets.push(...batchResult);
    }

    logger.info('TicketService', `Successfully generated ${tickets.length} tickets`);

    return {
      count: tickets.length,
      ticketType,
      limit,
      remaining: remaining ? remaining - tickets.length : null,
    };
  } catch (error) {
    logger.error('TicketService', 'Failed to generate tickets', error.message);
    throw error;
  }
}

/**
 * Validate a ticket
 */
async function validateTicket(code) {
  try {
    if (!code || code.trim() === '') {
      throw {
        message: 'Ticket code is required',
        status: 400,
      };
    }

    const ticket = await Ticket.findOne({ code });

    if (!ticket) {
      throw {
        message: 'Ticket not found',
        status: 404,
      };
    }

    if (!ticket.isAssigned) {
      throw {
        message: 'Ticket must be assigned before validation',
        status: 400,
      };
    }

    if (ticket.isUsed) {
      return {
        valid: true,
        alreadyUsed: true,
        usedAt: ticket.usedAt,
        message: `Ticket already used on ${ticket.usedAt.toLocaleString()}`,
      };
    }

    // Mark as used
    ticket.isUsed = true;
    ticket.usedAt = new Date();
    await ticket.save();

    logger.info('TicketService', `Ticket ${code} validated successfully`);

    return {
      valid: true,
      alreadyUsed: false,
      ticket: ticket.toObject(),
      message: 'Ticket validated successfully',
    };
  } catch (error) {
    logger.error('TicketService', 'Failed to validate ticket', error.message);
    throw error;
  }
}

/**
 * Assign ticket to user
 */
async function assignTicket(ticketId, ticketType, userName, userId) {
  try {
    if (!ticketId || !ticketType || !userName || !userId) {
      throw {
        message: 'Missing required parameters',
        status: 400,
      };
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw {
        message: 'Ticket not found',
        status: 404,
      };
    }

    // Check limits
    if (['VIP', 'NORMAL'].includes(ticketType)) {
      const typeCount = await Ticket.countDocuments({ ticketType, isAssigned: true });
      const limit = ticketType === 'VIP' ? 90 : 410;

      if (typeCount >= limit) {
        throw {
          message: `Cannot assign ${ticketType} ticket. Limit of ${limit} reached`,
          status: 400,
        };
      }
    }

    ticket.isAssigned = true;
    ticket.assignedTo = userName;
    ticket.assignedBy = userId;
    ticket.assignedAt = new Date();
    ticket.ticketType = ticketType;

    await ticket.save();

    logger.info('TicketService', `Ticket assigned: ${ticketId} to ${userName}`);

    return ticket.toObject();
  } catch (error) {
    logger.error('TicketService', 'Failed to assign ticket', error.message);
    throw error;
  }
}

/**
 * Assign multiple tickets
 */
async function assignTicketsBulk(count, ticketType, userName, userId) {
  try {
    if (count < 1 || count > 100) {
      throw {
        message: 'Count must be between 1 and 100',
        status: 400,
      };
    }

    if (!['VIP', 'NORMAL'].includes(ticketType)) {
      throw {
        message: 'Invalid ticket type',
        status: 400,
      };
    }

    // Check limits
    const typeCount = await Ticket.countDocuments({ ticketType, isAssigned: true });
    const limit = ticketType === 'VIP' ? 90 : 410;
    const remaining = limit - typeCount;

    if (remaining <= 0) {
      throw {
        message: `Cannot assign. ${ticketType} quota exhausted`,
        status: 400,
      };
    }

    const countToAssign = Math.min(count, remaining);

    // Find unassigned tickets
    const unassignedTickets = await Ticket.find({
      isAssigned: false,
      ticketType: 'UNKNOWN',
    }).limit(countToAssign);

    if (unassignedTickets.length === 0) {
      throw {
        message: 'No unassigned tickets available',
        status: 400,
      };
    }

    // Update tickets
    const ticketIds = unassignedTickets.map(t => t._id);
    const result = await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      {
        isAssigned: true,
        assignedTo: userName,
        assignedBy: userId,
        assignedAt: new Date(),
        ticketType,
      }
    );

    logger.info('TicketService', `${result.modifiedCount} tickets assigned in bulk`);

    return {
      assigned: result.modifiedCount,
      ticketType,
      remaining: limit - (typeCount + result.modifiedCount),
    };
  } catch (error) {
    logger.error('TicketService', 'Failed to assign tickets in bulk', error.message);
    throw error;
  }
}

/**
 * Get ticket statistics
 */
async function getTicketStats() {
  try {
    const total = await Ticket.countDocuments();
    const assigned = await Ticket.countDocuments({ isAssigned: true });
    const used = await Ticket.countDocuments({ isUsed: true });
    const vip = await Ticket.countDocuments({ ticketType: 'VIP' });
    const normal = await Ticket.countDocuments({ ticketType: 'NORMAL' });
    const unknown = await Ticket.countDocuments({ ticketType: 'UNKNOWN' });

    return {
      total,
      assigned,
      unassigned: total - assigned,
      used,
      unused: assigned - used,
      byType: {
        vip: { count: vip, limit: 90, available: 90 - vip },
        normal: { count: normal, limit: 410, available: 410 - normal },
        unknown,
      },
    };
  } catch (error) {
    logger.error('TicketService', 'Failed to get ticket stats', error.message);
    throw error;
  }
}

/**
 * Helper: Generate unique ticket code
 */
function generateTicketCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Helper: Get next sequence number
 */
async function getNextSequenceNumber(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

module.exports = {
  generateTickets,
  validateTicket,
  assignTicket,
  assignTicketsBulk,
  getTicketStats,
};
