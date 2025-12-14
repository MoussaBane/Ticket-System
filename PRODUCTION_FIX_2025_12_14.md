# Production Fix - December 14, 2025

## Issues Identified

### 1. **POST /admin/tickets/assign-bulk - 500 Error**
**Root Cause**: 
- The endpoint was fetching ALL unassigned tickets without filtering by `ticketType`
- But then it was updating them with the `ticketType`, causing conflicts
- The logic didn't properly validate that tickets of the requested type were available

**Fix Applied**:
- Modified the query to filter tickets by BOTH `isAssigned: false` AND `ticketType: ticketType`
- Removed setting `ticketType` in the update (it should already be set)
- Improved error message to show how many tickets of that specific type are available

### 2. **Invalid ticketType Values in Database**
**Root Cause**:
- The Ticket model originally had `ticketType` with default value `' '` (space)
- Some tickets in the database may have invalid values (empty string, space, null)
- This breaks filtering and counting logic

**Fixes Applied**:
1. **Model Fix** [models/Ticket.js]:
   - Changed enum from `['VIP', 'NORMAL', ' ']` to `['VIP', 'NORMAL']`
   - Changed default from `' '` to `'NORMAL'`

2. **Migration Script** [scripts/fixTicketTypes.js]:
   - Created to fix all existing tickets with invalid ticketType values
   - Sets all invalid tickets to type 'NORMAL'
   - Run this script in production: `node scripts/fixTicketTypes.js`

### 3. **Stats Loading May Fail**
**Why**: When counting by `ticketType`, if tickets have invalid values, counts are incorrect

**Already Fixed By**:
- Fixing the model default value
- Running the migration script to clean up existing data

## Deployment Steps

1. **Deploy Updated Code**:
   ```bash
   # Push the updated index.js and models/Ticket.js
   git add index.js models/Ticket.js
   git commit -m "Fix: Correct assign-bulk endpoint and ticketType validation"
   git push
   ```

2. **Run Migration Script** (IMPORTANT):
   ```bash
   # Connect to your production environment and run:
   node scripts/fixTicketTypes.js
   ```
   
   This will:
   - Find all tickets with invalid `ticketType` values
   - Update them to `'NORMAL'`
   - Display the count of updated records

3. **Verify in Admin Dashboard**:
   - Check that stats load correctly
   - Try assigning VIP and NORMAL tickets
   - Verify that ticket counts match the stats

## Expected Results After Fix

✅ `/admin/tickets/stats/summary` should return correct counts
✅ `/admin/tickets/assign-bulk` should properly filter and assign tickets by type
✅ VIP ticket limit: 90 (respects limit)
✅ NORMAL ticket limit: 410 (respects limit)
✅ No more 500 errors on assign-bulk endpoint

## Files Modified

- [index.js](index.js#L452-L470) - Fixed assign-bulk endpoint logic
- [models/Ticket.js](models/Ticket.js#L38-L43) - Fixed ticketType default value
- [scripts/fixTicketTypes.js](scripts/fixTicketTypes.js) - New migration script
