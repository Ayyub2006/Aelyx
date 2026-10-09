import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (teacher) {
        // Query classes where the teacher field matches this teacher's ID
        query.teacher = teacher._id;
      } else {
        return errorResponse(res, 403, 'Teacher profile not found');
      }
    }

    const classes = await Class.find(query).populate('teacher', 'user subject phone').populate({
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
    const { grade, section, teacherId, period } = req.body;

    const classExists = await Class.findOne({ grade, section, period });
    if (classExists) {
      return errorResponse(res, 400, `Class ${grade}-${section} for this period already exists`);
    }

    const newClass = await Class.create({
      grade,
      section,
      teacher: teacherId || null,
      period: period || null,
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

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private/Admin
export const updateClass = async (req, res) => {
  try {
    const { grade, section, teacherId, period } = req.body;
    
    let classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return errorResponse(res, 404, 'Class not found');
    }

    // Check for duplicates
    if (grade && section && (grade !== classObj.grade || section !== classObj.section || period !== classObj.period)) {
      const classExists = await Class.findOne({ grade, section, period });
      if (classExists && classExists._id.toString() !== req.params.id) {
        return errorResponse(res, 400, `Class ${grade}-${section} for this period already exists`);
      }
    }

    // Handle teacher assignment changes
    const oldTeacherId = classObj.teacher ? classObj.teacher.toString() : null;
    const newTeacherId = teacherId || null;

    if (oldTeacherId !== newTeacherId) {
      // Remove from old teacher
      if (oldTeacherId) {
        await Teacher.findByIdAndUpdate(oldTeacherId, { $pull: { assignedClasses: classObj._id } });
      }
      // Add to new teacher
      if (newTeacherId) {
        await Teacher.findByIdAndUpdate(newTeacherId, { $push: { assignedClasses: classObj._id } });
      }
    }

    classObj.grade = grade || classObj.grade;
    classObj.section = section || classObj.section;
    classObj.teacher = newTeacherId;
    classObj.period = period !== undefined ? period : classObj.period;

    await classObj.save();

    return successResponse(res, 200, 'Class updated successfully', { class: classObj });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
export const deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return errorResponse(res, 404, 'Class not found');
    }

    // Check if students exist in this class
    const studentsCount = await Student.countDocuments({ class: classObj._id });
    if (studentsCount > 0) {
      return errorResponse(res, 400, 'Cannot delete class with assigned students. Reassign or delete students first.');
    }

    // Remove from teacher's assignedClasses
    if (classObj.teacher) {
      await Teacher.findByIdAndUpdate(classObj.teacher, { $pull: { assignedClasses: classObj._id } });
    }

    // Optional: Delete related attendance records, or let them be orphaned/handled later
    await Attendance.deleteMany({ class: classObj._id });

    await classObj.deleteOne();

    return successResponse(res, 200, 'Class deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
