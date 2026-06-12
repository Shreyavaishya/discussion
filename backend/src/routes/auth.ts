import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();

// 1. SIGNUP ROUTE
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user record
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 2. LOGIN ROUTE
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a secure JWT token containing the user's ID
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Return token along with helpful user info
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        totalCredits: user.totalCredits
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;