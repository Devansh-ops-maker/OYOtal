import express from 'express';
import { registerDoctor, registerPatient, registerPharmacist, registerAdmin, login } from '../controllers/authControllers.js';

const router = express.Router();


router.post('/register/doctor', registerDoctor);
router.post('/register/patient', registerPatient);
router.post('/register/pharmacist', registerPharmacist);
router.post('/register/admin', registerAdmin);


router.post('/login', login);

export default router;
