const Article = require('../models/article');
const User = require('../models/user');
const Problem = require('../models/problem');
const Event = require('../models/event');
const sanitizeUser = require('../services/sanitizeUser');
const mongoose = require('mongoose');

/**
 * Create Article
 * Only managers can create articles
 * Author is automatically set to current user
 */
const createArticle = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    const { title, content, tags, problem, event } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        data: null,
        error: 'Title and content are required'
      });
    }

    // Validate optional references
    if (problem && !mongoose.Types.ObjectId.isValid(problem)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid problem ID format'
      });
    }

    if (event && !mongoose.Types.ObjectId.isValid(event)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid event ID format'
      });
    }

    // Create article with author as current user
    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      author: user.id,
      tags: tags || [],
      problem: problem || null,
      event: event || null
    });

    await article.save();

    // Populate references for response
    await article.populate('author');
    if (problem) await article.populate('problem');
    if (event) await article.populate('event');

    // Sanitize response
    const response = {
      _id: article._id,
      title: article.title,
      content: article.content,
      author: sanitizeUser(article.author),
      tags: article.tags,
      problem: article.problem,
      event: article.event,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };

    res.status(201).json({
      data: response,
      error: null
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message
    });
  }
};

/**
 * Get all articles with optional filters
 */
const getArticles = async (req, res) => {
  try {
    const { tag, event, problem } = req.query;

    // Build filter object
    const filter = {};
    if (tag) filter.tags = tag;
    if (event && mongoose.Types.ObjectId.isValid(event)) filter.event = event;
    if (problem && mongoose.Types.ObjectId.isValid(problem)) filter.problem = problem;

    const articles = await Article.find(filter)
      .populate('author')
      .populate('problem')
      .populate('event')
      .sort({ createdAt: -1 });

    // Sanitize responses
    const sanitizedArticles = articles.map(article => ({
      _id: article._id,
      title: article.title,
      content: article.content,
      author: sanitizeUser(article.author),
      tags: article.tags,
      problem: article.problem,
      event: article.event,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    }));

    res.status(200).json({
      data: sanitizedArticles,
      error: null
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message
    });
  }
};

/**
 * Get single article by ID
 */
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid article ID format'
      });
    }

    const article = await Article.findById(id)
      .populate('author')
      .populate('problem')
      .populate('event');

    if (!article) {
      return res.status(404).json({
        data: null,
        error: 'Article not found'
      });
    }

    // Sanitize response
    const response = {
      _id: article._id,
      title: article.title,
      content: article.content,
      author: sanitizeUser(article.author),
      tags: article.tags,
      problem: article.problem,
      event: article.event,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };

    res.status(200).json({
      data: response,
      error: null
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message
    });
  }
};

/**
 * Update article
 * Only author (manager) or owner can update
 */
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { title, content, tags, problem, event } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid article ID format'
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        data: null,
        error: 'Article not found'
      });
    }

    // Authorization: only author or owner can update
    if (article.author.toString() !== user.id && user.role !== 'owner') {
      return res.status(403).json({
        data: null,
        error: 'You can only update your own articles'
      });
    }

    // Validate optional references
    if (problem && !mongoose.Types.ObjectId.isValid(problem)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid problem ID format'
      });
    }

    if (event && !mongoose.Types.ObjectId.isValid(event)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid event ID format'
      });
    }

    // Update fields
    if (title) article.title = title.trim();
    if (content) article.content = content.trim();
    if (tags) article.tags = tags;
    if (problem !== undefined) article.problem = problem || null;
    if (event !== undefined) article.event = event || null;

    article.updatedAt = new Date();

    await article.save();

    // Populate references for response
    await article.populate('author');
    if (article.problem) await article.populate('problem');
    if (article.event) await article.populate('event');

    // Sanitize response
    const response = {
      _id: article._id,
      title: article.title,
      content: article.content,
      author: sanitizeUser(article.author),
      tags: article.tags,
      problem: article.problem,
      event: article.event,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };

    res.status(200).json({
      data: response,
      error: null
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message
    });
  }
};

/**
 * Delete article
 * Only author (manager) or owner can delete
 */
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid article ID format'
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        data: null,
        error: 'Article not found'
      });
    }

    // Authorization: only author or owner can delete
    if (article.author.toString() !== user.id && user.role !== 'owner') {
      return res.status(403).json({
        data: null,
        error: 'You can only delete your own articles'
      });
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({
      data: { message: 'Article deleted successfully' },
      error: null
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message
    });
  }
};

/**
 * Get all problems with optional tag filtering
 */
const getProblems = async (req, res) => {
  try {
    const { tag } = req.query;

    // Build filter object
    const filter = {};
    if (tag) filter.tags = tag;

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: problems,
      error: null
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message
    });
  }
};

/**
 * Get single problem by ID
 */
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        data: null,
        error: 'Invalid problem ID format'
      });
    }

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        data: null,
        error: 'Problem not found'
      });
    }

    res.status(200).json({
      data: problem,
      error: null
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: err.message
    });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getProblems,
  getProblemById
};
