import express from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from '../controllers/teacherController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All teacher routes are protected and restricted to ADMIN
router.use(protect);
router.use(authorizeRoles('ADMIN'));

router.route('/')
  .get(getTeachers)
  .post(createTeacher);

router.route('/:id')
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

export default router;
