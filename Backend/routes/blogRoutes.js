const express = require('express');
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getProblems,
  getProblemById
} = require('../controllers/blogController');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/roles');

/**
 * Blog Routes
 * 
 * POST   /blogs            -> createArticle (managers only)
 * GET    /blogs            -> getArticles (all authenticated users)
 * GET    /blogs/:id        -> getArticleById (all authenticated users)
 * PUT    /blogs/:id        -> updateArticle (author/owner only)
 * DELETE /blogs/:id        -> deleteArticle (author/owner only)
 * GET    /problems         -> getProblems (all authenticated users, with tag filter)
 * GET    /problems/:id     -> getProblemById (all authenticated users)
 */

// Articles
// Create article (managers only)
router.post('/', auth, allowRoles('manager'), createArticle);

// Problems (must come before /:id to avoid route conflicts)
// Get all problems with optional tag filter (authenticated users)
router.get('/problems', auth, getProblems);

// Get problem by ID (authenticated users)
router.get('/problems/:id', auth, getProblemById);

// Get all articles (authenticated users)
router.get('/', auth, getArticles);

// Get article by ID (authenticated users)
router.get('/:id', auth, getArticleById);

// Update article (author or owner)
router.put('/:id', auth, allowRoles('manager', 'owner'), updateArticle);

// Delete article (author or owner)
router.delete('/:id', auth, allowRoles('manager', 'owner'), deleteArticle);

module.exports = router;
