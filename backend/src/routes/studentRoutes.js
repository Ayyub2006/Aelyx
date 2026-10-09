import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('ADMIN', 'TEACHER'), getStudents);
router.post('/', authorizeRoles('ADMIN'), createStudent);

router.get('/:id', authorizeRoles('ADMIN', 'TEACHER'), getStudentById);
router.put('/:id', authorizeRoles('ADMIN'), updateStudent);
router.delete('/:id', authorizeRoles('ADMIN'), deleteStudent);

export default router;
