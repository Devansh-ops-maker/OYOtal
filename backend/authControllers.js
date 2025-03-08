import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Patient from '../models/patient.js';
import Admin from '../models/admin.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};


export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, gender, bloodGroup } = req.body;

    if (!name || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newPatient = new Patient({
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
      gender,
      bloodGroup
    });

    await newPatient.save();
    const token = signToken(newPatient._id, 'patient');

    res.status(201).json({ 
      status: 'success',
      token,
      data: { patient: newPatient } 
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

    const user = await Patient.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = signToken(user._id, 'user');

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

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = signToken(admin._id, 'admin');

    res.status(200).json({ 
      status: 'success',
      token 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
