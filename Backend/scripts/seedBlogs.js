/**
 * Seed Blogs Database Script
 * 
 * This script populates the database with sample articles for testing blog endpoints.
 * 
 * Usage:
 *   node Backend/scripts/seedBlogs.js
 * 
 * This will create:
 * - 1 sample problem
 * - 3-5 sample articles linked to manager users
 * - Optional references to events
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/article');
const Problem = require('../models/problem');
const User = require('../models/user');
const Event = require('../models/event');
const connectDB = require('../config/db');

const seedBlogs = async () => {
  try {
    await connectDB();
    console.log('📊 Connected to MongoDB');

    // Get existing users
    const owner = await User.findOne({ role: 'owner' });
    const manager = await User.findOne({ role: 'manager' });
    const events = await Event.find().limit(2);

    if (!owner) {
      console.error('❌ Owner user not found. Run the server first to seed owner.');
      process.exit(1);
    }

    if (!manager) {
      console.error('❌ Manager user not found. Create a manager user first.');
      process.exit(1);
    }

    // Clear existing articles and problems
    await Article.deleteMany({});
    await Problem.deleteMany({});
    console.log('🗑️  Cleared existing articles and problems');

    // Create sample problem
    const problem = new Problem({
      title: 'Two Sum',
      timeLimit: 1000, // 1 second
      memoryLimit: 256, // 256 MB
      statement: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]'
        }
      ],
      tags: ['two-pointers', 'hash-map', 'array', 'easy']
    });

    await problem.save();
    console.log('✅ Created sample problem:', problem._id);

    // Create sample articles
    const articlesData = [
      {
        title: 'Mastering Two Pointers Technique',
        content: `The two pointers technique is a fundamental approach in competitive programming. In this article, we'll explore how to solve the "Two Sum" problem using an efficient approach.

**Key Concepts:**
1. Hash map approach - O(n) time, O(n) space
2. Sorting approach - O(n log n) time, O(1) space
3. When to use each method

The hash map approach is preferred for interview problems because it achieves linear time complexity.`,
        problem: problem._id,
        event: events[0] ? events[0]._id : null,
        tags: ['algorithms', 'hash-map', 'array']
      },
      {
        title: 'Contest Preparation: Problem Solving Strategies',
        content: `Preparing for programming contests requires a structured approach. Here are the key strategies used by top competitors:

**Pre-Contest Planning:**
- Study data structures thoroughly
- Practice problems of varying difficulty
- Participate in virtual contests
- Analyze editorial solutions

**During Contest:**
- Read problems carefully
- Start with easier problems
- Manage time effectively
- Debug systematically

Practice makes perfect. Make sure to solve problems from multiple platforms.`,
        problem: null,
        event: events[1] ? events[1]._id : null,
        tags: ['contest', 'strategy', 'preparation']
      },
      {
        title: 'Understanding Time Complexity in Competitive Programming',
        content: `Time complexity is crucial in competitive programming. Let's understand Big O notation:

**Common Complexities:**
- O(1) - Constant: Always preferred
- O(log n) - Logarithmic: Binary search, balanced trees
- O(n) - Linear: Single loop iteration
- O(n log n) - Linearithmic: Merge sort, quicksort
- O(n²) - Quadratic: Nested loops, bubble sort
- O(2ⁿ) - Exponential: Backtracking problems

**Rule of Thumb:**
- 10⁶ to 10⁷ operations per second on modern judges
- For n = 10⁵, aim for O(n log n) or better
- Never exceed 10⁸ operations

Understanding these limits helps you choose the right algorithm before coding.`,
        problem: null,
        event: null,
        tags: ['algorithms', 'complexity', 'analysis']
      },
      {
        title: 'Dynamic Programming Essentials for Beginners',
        content: `Dynamic Programming (DP) is an advanced technique that solves optimization problems by breaking them into overlapping subproblems.

**Core Principles:**
1. Optimal substructure - Optimal solution built from optimal subproblems
2. Overlapping subproblems - Same subproblems solved multiple times
3. Memoization - Store results of expensive function calls

**Classic DP Problems:**
- Fibonacci sequence
- Longest common subsequence
- Knapsack problem
- Coin change

Start with simple recursive solutions, then optimize using memoization.`,
        problem: null,
        event: events[0] ? events[0]._id : null,
        tags: ['dynamic-programming', 'optimization']
      },
      {
        title: 'Graph Algorithms: BFS and DFS Explained',
        content: `Graph traversal is fundamental in many coding problems. Let's compare BFS and DFS:

**Depth-First Search (DFS):**
- Uses a stack (or recursion)
- Explores as far as possible along each branch
- Good for detecting cycles, topological sorting
- Time: O(V + E), Space: O(V)

**Breadth-First Search (BFS):**
- Uses a queue
- Explores level by level
- Good for shortest path in unweighted graphs
- Time: O(V + E), Space: O(V)

Choose based on your problem requirements. Both are essential in a competitive programmer's toolkit.`,
        problem: null,
        event: null,
        tags: ['graphs', 'traversal', 'bfs', 'dfs']
      }
    ];

    const articles = [];
    for (const data of articlesData) {
      const article = new Article({
        ...data,
        author: manager._id
      });
      await article.save();
      articles.push(article);
    }

    console.log(`✅ Created ${articles.length} sample articles`);

    // Populate and display summary
    await Article.populate(articles, {
      path: 'author',
      select: 'fullName handle role'
    });

    console.log('\n📝 Created Articles:\n');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   ID: ${article._id}`);
      console.log(`   Author: ${article.author.fullName} (${article.author.handle})`);
      console.log(`   Tags: ${article.tags.join(', ')}`);
      if (article.problem) console.log(`   Problem: ${article.problem}`);
      if (article.event) console.log(`   Event: ${article.event}`);
      console.log();
    });

    console.log('\n📚 Sample Problem:\n');
    console.log(`Title: ${problem.title}`);
    console.log(`ID: ${problem._id}`);
    console.log(`Time Limit: ${problem.timeLimit}ms`);
    console.log(`Memory Limit: ${problem.memoryLimit}MB`);
    console.log(`Examples: ${problem.examples.length}`);
    console.log(`Tags: ${problem.tags.join(', ')}`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('🚀 Start the server and use the blog endpoints to test!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error.message);
    process.exit(1);
  }
};

seedBlogs();
