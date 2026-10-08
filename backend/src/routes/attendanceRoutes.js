import express from 'express';
import { markAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Mark attendance (both TEACHER and ADMIN can mark)
router.post('/', authorizeRoles('ADMIN', 'TEACHER'), markAttendance);

// We will add GET routes for history/summary in later phases

export default router;
