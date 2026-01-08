const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/roles');

// ============ EVENT CRUD ROUTES ============

/**
 * POST /events
 * Create a new event
 * Protected: owner, office, manager only
 */
router.post('/', auth, allowRoles('owner', 'office', 'manager'), eventController.createEvent);

/**
 * GET /events
 * Get all events with optional filtering and sorting
 * Query params: status (upcoming/ongoing/completed), sortBy (default: startDate)
 * Protected: any authenticated user
 */
router.get('/', auth, eventController.getAllEvents);

/**
 * GET /events/:id
 * Get event details by ID
 * Protected: any authenticated user
 */
router.get('/:id', auth, eventController.getEventById);

/**
 * PUT /events/:id
 * Update event details
 * Protected: owner, office, manager (can only update own events, unless owner)
 */
router.put('/:id', auth, allowRoles('owner', 'office', 'manager'), eventController.updateEvent);

/**
 * DELETE /events/:id
 * Delete event
 * Protected: owner only
 */
router.delete('/:id', auth, allowRoles('owner'), eventController.deleteEvent);

// ============ EVENT REGISTRATION ROUTES ============

/**
 * POST /events/:id/register
 * Register current user for an event
 * Protected: any authenticated user
 */
router.post('/:id/register', auth, eventController.registerForEvent);

/**
 * DELETE /events/:id/register
 * Unregister current user from an event
 * Protected: any authenticated user
 */
router.delete('/:id/register', auth, eventController.unregisterFromEvent);

/**
 * POST /events/:id/payment
 * Mark payment for event registration (if event has fees)
 * Protected: any authenticated user
 */
router.post('/:id/payment', auth, eventController.markPayment);

// ============ DISCUSSION/FORUM ROUTES ============

/**
 * POST /events/:id/discussions
 * Post a new discussion/comment on event
 * Protected: any authenticated user
 */
router.post('/:id/discussions', auth, eventController.postDiscussion);

/**
 * PUT /events/:id/discussions/:discussionId
 * Edit a discussion/comment
 * Protected: author of discussion or owner/office
 */
router.put('/:id/discussions/:discussionId', auth, eventController.editDiscussion);

/**
 * DELETE /events/:id/discussions/:discussionId
 * Delete a discussion/comment
 * Protected: author of discussion or owner
 */
router.delete('/:id/discussions/:discussionId', auth, eventController.deleteDiscussion);

/**
 * POST /events/:id/discussions/:discussionId/upvote
 * Upvote/downvote a discussion
 * Toggle: if already upvoted, removes upvote; otherwise adds upvote
 * Protected: any authenticated user
 */
router.post('/:id/discussions/:discussionId/upvote', auth, eventController.upvoteDiscussion);

/**
 * PUT /events/:id/discussions/:discussionId/pin
 * Pin/unpin a discussion (toggle)
 * Protected: owner or office only
 */
router.put('/:id/discussions/:discussionId/pin', auth, allowRoles('owner', 'office'), eventController.togglePinDiscussion);

module.exports = router;
