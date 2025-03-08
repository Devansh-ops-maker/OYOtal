import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';


process.env.JWT_SECRET = '65ed2a1a80f1c527e4f91badfbe8ba1ed1893461326dae1d45e0614b4aeacdba53928b1cde0bb59e9ec2ac1d10f5fda637eedfe817fed877abad57b8fd39db01';
process.env.JWT_EXPIRES_IN = '24h';

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;

    if (!name || !email || !password || !contactNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const existingPhone = await User.findOne({ contactNumber });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contactNumber
    });

    await newUser.save();
    const token = signToken(newUser._id);

    res.status(201).json({ 
      status: 'success',
      token,
      data: { user: newUser } 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = signToken(user._id);

    res.status(200).json({ 
      status: 'success',
      token 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const admin = await User.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = signToken(admin._id);

    res.status(200).json({ 
      status: 'success',
      token 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
