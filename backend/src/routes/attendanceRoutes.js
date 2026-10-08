import express from 'express';
import { 
  markAttendance, 
  getClassAttendanceByDate, 
  updateClassAttendance 
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('ADMIN', 'TEACHER'), markAttendance);
router.get('/class/:classId', authorizeRoles('ADMIN', 'TEACHER'), getClassAttendanceByDate);
router.put('/class/:classId', authorizeRoles('ADMIN', 'TEACHER'), updateClassAttendance);

export default router;
