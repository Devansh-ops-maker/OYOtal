import express from 'express';
import { getAllHospitals, addHospital, updateWaitingPatients } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all hospitals (accessible to all users)
router.get('/hospitals', protect, getAllHospitals);

// Add a new hospital (Admin only)
router.post('/hospitals', protect, restrictTo('admin'), addHospital);

// Update waiting patients count (Admin only)
router.patch('/hospitals/update-waiting', protect, restrictTo('admin'), updateWaitingPatients);

export default router;
