const Event = require('../models/event');
const User = require('../models/user');
const { sanitizeUser } = require('../services/sanitizeUser');

// ============ EVENT CRUD OPERATIONS ============

/**
 * Create a new event
 * Only owner and office can create events
 * POST /events
 */
const createEvent = async (req, res) => {
  try {
    const { name, description, startDate, endDate, location, type, maxParticipants, fees } = req.body;
    const requester = req.user;

    // Validation
    if (!name || !startDate) {
      return res.status(400).json({ message: 'Event name and start date are required' });
    }

    // Check authorization
    if (!['owner', 'office', 'manager'].includes(requester.role)) {
      return res.status(403).json({ message: 'Only owner, office, or manager can create events' });
    }

    // Validate dates
    const start = new Date(startDate);
    if (endDate && new Date(endDate) <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const event = new Event({
      name,
      description,
      startDate: start,
      endDate,
      location,
      type,
      maxParticipants,
      fees,
      createdBy: requester.id
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: sanitizeEvent(event)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all events
 * Any authenticated user can view all events
 * GET /events
 */
const getAllEvents = async (req, res) => {
  try {
    const { status, sortBy = 'startDate' } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .sort({ [sortBy]: 1 })
      .populate('createdBy', 'fullName handle')
      .populate('registeredUsers', 'fullName handle')
      .populate('paidUsers', 'fullName handle')
      .populate('discussions.author', 'fullName handle');

    res.json({
      data: events.map(e => sanitizeEvent(e))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get event by ID
 * Any authenticated user can view event details
 * GET /events/:id
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'fullName handle')
      .populate('registeredUsers', 'fullName handle')
      .populate('paidUsers', 'fullName handle')
      .populate('discussions.author', 'fullName handle');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event retrieved successfully',
      event: sanitizeEvent(event)
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update event
 * Only owner and office can update events
 * PUT /events/:id
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;
    const { name, description, startDate, endDate, location, type, maxParticipants, fees, status } = req.body;

    // Find event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (!['owner', 'office', 'manager'].includes(requester.role)) {
      return res.status(403).json({ message: 'Only owner, office, or manager can update events' });
    }

    // Only owner can update events they didn't create
    if (requester.role !== 'owner' && event.createdBy.toString() !== requester.id) {
      return res.status(403).json({ message: 'You can only update events you created' });
    }

    // Validate dates if provided
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Update allowed fields
    if (name) event.name = name;
    if (description) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (location) event.location = location;
    if (type) event.type = type;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (fees !== undefined) event.fees = fees;
    if (status && ['upcoming', 'ongoing', 'completed'].includes(status)) event.status = status;

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event: sanitizeEvent(event)
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete event
 * Only owner can delete events
 * DELETE /events/:id
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    // Find event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization - only owner can delete
    if (requester.role !== 'owner') {
      return res.status(403).json({ message: 'Only owner can delete events' });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ============ EVENT REGISTRATION ============

/**
 * Register for an event
 * Any authenticated user can register
 * POST /events/:id/register
 */
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user already registered
    if (event.isUserRegistered(userId)) {
      return res.status(409).json({ message: 'You are already registered for this event' });
    }

    // Check if event is full
    if (event.isFull()) {
      return res.status(400).json({ message: 'Event is full. No more registrations available' });
    }

    // Add user to registered users
    event.registeredUsers.push(userId);
    await event.save();

    res.status(200).json({
      message: 'Successfully registered for event',
      event: sanitizeEvent(event)
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Unregister from an event
 * Any authenticated user can unregister
 * DELETE /events/:id/register
 */
const unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered
    if (!event.isUserRegistered(userId)) {
      return res.status(404).json({ message: 'You are not registered for this event' });
    }

    // Remove user from registered users and paid users
    event.registeredUsers = event.registeredUsers.filter(id => id.toString() !== userId);
    event.paidUsers = event.paidUsers.filter(id => id.toString() !== userId);
    await event.save();

    res.json({ message: 'Successfully unregistered from event' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Mark payment for event registration
 * Only for events with fees
 * POST /events/:id/payment
 */
const markPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has fees
    if (!event.fees || event.fees === 0) {
      return res.status(400).json({ message: 'This event has no fees' });
    }

    // Check if user is registered
    if (!event.isUserRegistered(userId)) {
      return res.status(400).json({ message: 'You must be registered to mark payment' });
    }

    // Check if already paid
    if (event.hasUserPaid(userId)) {
      return res.status(409).json({ message: 'You have already marked payment for this event' });
    }

    // Add user to paid users
    event.paidUsers.push(userId);
    await event.save();

    res.json({ message: 'Payment marked successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ============ DISCUSSION/FORUM OPERATIONS ============

/**
 * Post a discussion/comment on an event
 * Any authenticated user can post
 * POST /events/:id/discussions
 */
const postDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Discussion content is required' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create new discussion
    const newDiscussion = {
      author: userId,
      content: content.trim(),
      isPinned: false,
      upvotes: []
    };

    event.discussions.push(newDiscussion);
    await event.save();

    // Populate author info
    await event.populate('discussions.author', 'fullName handle');

    res.status(201).json({
      message: 'Discussion posted successfully',
      discussion: event.discussions[event.discussions.length - 1]
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Edit a discussion/comment
 * Only author or owner/office can edit
 * PUT /events/:id/discussions/:discussionId
 */
const editDiscussion = async (req, res) => {
  try {
    const { id, discussionId } = req.params;
    const { content } = req.body;
    const requester = req.user;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Discussion content is required' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const discussion = event.discussions.id(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check authorization
    if (discussion.author.toString() !== requester.id && !['owner', 'office'].includes(requester.role)) {
      return res.status(403).json({ message: 'You can only edit your own discussions' });
    }

    discussion.content = content.trim();
    discussion.updatedAt = new Date();
    await event.save();

    await event.populate('discussions.author', 'fullName handle');

    res.json({
      message: 'Discussion updated successfully',
      discussion: event.discussions.id(discussionId)
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a discussion/comment
 * Only author or owner can delete
 * DELETE /events/:id/discussions/:discussionId
 */
const deleteDiscussion = async (req, res) => {
  try {
    const { id, discussionId } = req.params;
    const requester = req.user;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const discussion = event.discussions.id(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check authorization
    if (discussion.author.toString() !== requester.id && requester.role !== 'owner') {
      return res.status(403).json({ message: 'You can only delete your own discussions' });
    }

    event.discussions.id(discussionId).deleteOne();
    await event.save();

    res.json({ message: 'Discussion deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Upvote a discussion
 * Any authenticated user can upvote
 * POST /events/:id/discussions/:discussionId/upvote
 */
const upvoteDiscussion = async (req, res) => {
  try {
    const { id, discussionId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const discussion = event.discussions.id(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if already upvoted
    const hasUpvoted = discussion.upvotes.some(id => id.toString() === userId);

    if (hasUpvoted) {
      // Remove upvote
      discussion.upvotes = discussion.upvotes.filter(id => id.toString() !== userId);
    } else {
      // Add upvote
      discussion.upvotes.push(userId);
    }

    await event.save();
    await event.populate('discussions.author', 'fullName handle');

    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Upvote added',
      discussion: event.discussions.id(discussionId),
      upvoteCount: discussion.upvotes.length
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Pin/unpin a discussion
 * Only owner and office can pin discussions
 * PUT /events/:id/discussions/:discussionId/pin
 */
const togglePinDiscussion = async (req, res) => {
  try {
    const { id, discussionId } = req.params;
    const requester = req.user;

    // Check authorization
    if (!['owner', 'office'].includes(requester.role)) {
      return res.status(403).json({ message: 'Only owner/office can pin discussions' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const discussion = event.discussions.id(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.isPinned = !discussion.isPinned;
    await event.save();
    await event.populate('discussions.author', 'fullName handle');

    res.json({
      message: discussion.isPinned ? 'Discussion pinned' : 'Discussion unpinned',
      discussion: event.discussions.id(discussionId)
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ============ HELPER FUNCTIONS ============

/**
 * Sanitize event response
 * Returns event without sensitive internal data
 */
function sanitizeEvent(event) {
  const obj = event.toObject ? event.toObject({ getters: true }) : event;
  delete obj.__v;
  return obj;
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  markPayment,
  postDiscussion,
  editDiscussion,
  deleteDiscussion,
  upvoteDiscussion,
  togglePinDiscussion
};
