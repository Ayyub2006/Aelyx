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

router.get('/me', authorizeRoles('STUDENT'), async (req, res) => {
  try {
    const student = await import('../models/Student.js').then(m => m.default.findOne({ user: req.user._id }).populate('class', 'grade section'));
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    res.status(200).json({ success: true, data: { student } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.get('/', authorizeRoles('ADMIN', 'TEACHER'), getStudents);
router.post('/', authorizeRoles('ADMIN'), createStudent);

router.get('/:id', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getStudentById);
router.put('/:id', authorizeRoles('ADMIN'), updateStudent);
router.delete('/:id', authorizeRoles('ADMIN'), deleteStudent);

export default router;
