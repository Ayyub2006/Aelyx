import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'user subject phone').populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name email' }
    });
    return successResponse(res, 200, 'Classes retrieved successfully', { classes });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Create a class
// @route   POST /api/classes
// @access  Private/Admin
export const createClass = async (req, res) => {
  try {
    const { grade, section, teacherId } = req.body;

    const classExists = await Class.findOne({ grade, section });
    if (classExists) {
      return errorResponse(res, 400, `Class ${grade}-${section} already exists`);
    }

    const newClass = await Class.create({
      grade,
      section,
      teacher: teacherId || null,
    });

    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, { $push: { assignedClasses: newClass._id } });
    }

    return successResponse(res, 201, 'Class created successfully', { class: newClass });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
