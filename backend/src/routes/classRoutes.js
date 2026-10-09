import express from 'express';
import { getClasses, createClass, updateClass, deleteClass } from '../controllers/classController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Teachers can view classes they are assigned to, or maybe all classes to see assignments.
// Let's allow both roles to GET, but only ADMIN to POST/PUT/DELETE
router.get('/', authorizeRoles('ADMIN', 'TEACHER'), getClasses);
router.post('/', authorizeRoles('ADMIN'), createClass);

router.put('/:id', authorizeRoles('ADMIN'), updateClass);
router.delete('/:id', authorizeRoles('ADMIN'), deleteClass);

export default router;
