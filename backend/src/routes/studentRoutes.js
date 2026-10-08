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

// All student routes are protected and restricted to ADMIN
router.use(protect);
router.use(authorizeRoles('ADMIN'));

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

export default router;
