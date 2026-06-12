import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/Auth.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { CreditConfig } from '../models/CreditConfig.js';

const router = Router();

// 1. CREATE A POST (THREAD)
router.post('/posts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, body } = req.body;
    const newPost = new Post({ 
      title, 
      body, 
      author: req.user?.id 
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 2. FETCH ALL POSTS (NEWEST FIRST)
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username totalCredits')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 3. FETCH A SINGLE POST and ALL OF ITS COMMENTS
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Fetch all comments linked to this post sorted by times
    const comments = await Comment.find({ postId: req.params.id })
      .populate('author', 'username')
      .sort({ createdAt: 1 });

    res.json({ post, comments });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 4. CREATE NESTED COMMENT & REWARD OP DYNAMICALLY
router.post('/comments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { postId, body, parentCommentId } = req.body;
    let computedDepth = 1;

    // If it's a sub-comment, check the parent comment's depth to calculate the new depth
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) return res.status(404).json({ message: 'Parent comment not found' });
      computedDepth = parentComment.depth + 1;
    }

    const newComment = new Comment({
      postId,
      body,
      author: req.user?.id,
      parentCommentId,
      depth: computedDepth
    });
    await newComment.save();

    // --- ARITHMETIC PROGRESSION CREDIT ENGINE ---
    // Fetch the formula configuration from DB (or use fallback defaults)
    const config = await CreditConfig.findOne() || { baseCredit: 1, commonDifference: 2 };
    
    // Formula: Credits = a + (n - 1) * d
    const earnedCredits = config.baseCredit + (computedDepth - 1) * config.commonDifference;

    // Find the original thread creator (OP) and add the credits to their profile balance
    const targetPost = await Post.findById(postId);
    if (targetPost) {
      await User.findByIdAndUpdate(targetPost.author, { $inc: { totalCredits: earnedCredits } });
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 5. PRODUCTION-GRADE SOFT DELETE (CLAW BACK OP CREDITS)
router.delete('/comments/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    // Authorization check
    if (comment.author.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ message: 'Comment is already deleted' });
    }

    // Soft Delete: Do NOT remove from DB; alter fields instead to protect child nesting paths
    comment.isDeleted = true;
    comment.body = "This comment was deleted by the user";
    await comment.save();

    // --- CREDIT DEDUCTION SYSTEM ---
    const config = await CreditConfig.findOne() || { baseCredit: 1, commonDifference: 2 };
    const deductionCredits = config.baseCredit + (comment.depth - 1) * config.commonDifference;

    // Decrement the exact amount from the OP
    const targetPost = await Post.findById(comment.postId);
    if (targetPost) {
      await User.findByIdAndUpdate(targetPost.author, { $inc: { totalCredits: -deductionCredits } });
    }

    res.json({ message: 'Comment successfully soft-deleted', comment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;