import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
export const getTeachers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await Teacher.countDocuments();

    const teachers = await Teacher.find()
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name email role')
      .populate('assignedClasses', 'grade section');

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, 200, 'Teachers retrieved successfully', { teachers, pagination });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private/Admin
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user', 'name email').populate('assignedClasses', 'grade section');
    if (!teacher) {
      return errorResponse(res, 404, 'Teacher not found');
    }
    return successResponse(res, 200, 'Teacher retrieved successfully', { teacher });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private/Admin
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, subject } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 400, 'User with this email already exists');
    }

    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      role: 'TEACHER',
    });

    // Create teacher profile
    const teacher = await Teacher.create({
      user: user._id,
      phone,
      subject,
    });

    const populatedTeacher = await Teacher.findById(teacher._id).populate('user', 'name email');

    return successResponse(res, 201, 'Teacher created successfully', { teacher: populatedTeacher });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
export const updateTeacher = async (req, res) => {
  try {
    const { name, phone, subject } = req.body;

    let teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return errorResponse(res, 404, 'Teacher not found');
    }

    // Update teacher info
    teacher.phone = phone || teacher.phone;
    teacher.subject = subject || teacher.subject;
    await teacher.save();

    // Update user info
    if (name) {
      await User.findByIdAndUpdate(teacher.user, { name });
    }

    const updatedTeacher = await Teacher.findById(req.params.id).populate('user', 'name email');

    return successResponse(res, 200, 'Teacher updated successfully', { teacher: updatedTeacher });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return errorResponse(res, 404, 'Teacher not found');
    }

    const userId = teacher.user;
    
    // Delete teacher profile
    await Teacher.findByIdAndDelete(req.params.id);
    
    // Delete user account
    await User.findByIdAndDelete(userId);

    return successResponse(res, 200, 'Teacher deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
