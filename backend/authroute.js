import express from 'express';
import { registerPatient, loginUser, loginAdmin } from '../controllers/authControllers.js';

const router = express.Router();


router.post('/register/patient', registerPatient);

router.post('/login/user', loginUser);

router.post('/login/admin', loginAdmin);

export default router;
