import Student from '../models/Student.js';
import Class from '../models/Class.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin/Teacher)
export const getStudents = async (req, res) => {
  try {
    const { classId } = req.query;
    let query = {};
    
    if (req.user.role === 'TEACHER') {
      const teacher = await import('../models/Teacher.js').then(m => m.default.findOne({ user: req.user._id }));
      if (!teacher) return errorResponse(res, 403, 'Teacher profile not found');
      
      // Teacher can only see classes where they are the assigned teacher
      const myClasses = await Class.find({ teacher: teacher._id }).select('_id');
      const myClassIds = myClasses.map(c => c._id.toString());
      
      if (classId) {
        if (!myClassIds.includes(classId.toString())) {
          return errorResponse(res, 403, 'Not assigned to this class');
        }
        
        const selectedClass = await Class.findById(classId);
        if (selectedClass) {
          const equivalentClasses = await Class.find({ grade: selectedClass.grade, section: selectedClass.section }).select('_id');
          query.class = { $in: equivalentClasses.map(c => c._id) };
        }
      } else {
        query.class = { $in: myClassIds };
      }
    } else {
      if (classId) {
        const selectedClass = await Class.findById(classId);
        if (selectedClass) {
          const equivalentClasses = await Class.find({ grade: selectedClass.grade, section: selectedClass.section }).select('_id');
          query.class = { $in: equivalentClasses.map(c => c._id) };
        }
      }
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await Student.countDocuments(query);

    const students = await Student.find(query)
      .skip(startIndex)
      .limit(limit)
      .populate('class', 'grade section')
      .populate('user', 'email');
      
    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, 200, 'Students retrieved successfully', { students, pagination });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class', 'grade section teacher').populate('user', 'email');
    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }

    if (req.user.role === 'TEACHER') {
      const teacher = await import('../models/Teacher.js').then(m => m.default.findOne({ user: req.user._id }));
      if (!teacher) return errorResponse(res, 403, 'Teacher profile not found');
      
      const studentClass = await Class.findById(student.class._id);
      if (!studentClass || studentClass.teacher?.toString() !== teacher._id.toString()) {
        return errorResponse(res, 403, 'Not authorized to view this student');
      }
    } else if (req.user.role === 'STUDENT') {
      if (student.user?.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Not authorized to view this student');
      }
    }

    return successResponse(res, 200, 'Student retrieved successfully', { student });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private/Admin
export const createStudent = async (req, res) => {
  try {
    const { name, rollNumber, classId, guardianContact, email, password } = req.body;

    // Check if roll number exists in this class
    const studentExists = await Student.findOne({ rollNumber, class: classId });
    if (studentExists) {
      return errorResponse(res, 400, 'Student with this roll number already exists in this class');
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return errorResponse(res, 404, 'Class not found');
    }

    let userId = null;
    if (email || password) {
      if (!email || !password) {
        return errorResponse(res, 400, 'Both email and password are required to create a student login account');
      }
      if (password.length < 6) {
        return errorResponse(res, 400, 'Password must be at least 6 characters');
      }
      
      const userExists = await User.findOne({ email });
      if (userExists) {
        return errorResponse(res, 400, 'User with this email already exists');
      }
      const user = await User.create({
        name,
        email,
        password,
        role: 'STUDENT'
      });
      userId = user._id;
    }

    const student = await Student.create({
      name,
      rollNumber,
      class: classId,
      section: classExists.section,
      guardianContact,
      user: userId
    });

    const populatedStudent = await Student.findById(student._id).populate('class', 'grade section').populate('user', 'email');

    return successResponse(res, 201, 'Student created successfully', { student: populatedStudent });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message || 'Server Error');
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
  try {
    const { name, classId, guardianContact } = req.body;

    let student = await Student.findById(req.params.id);
    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }

    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return errorResponse(res, 404, 'Class not found');
      }
      student.class = classId;
      student.section = classExists.section;
    }

    if (name) {
      student.name = name;
      if (student.user) {
        await User.findByIdAndUpdate(student.user, { name });
      }
    }
    if (guardianContact) student.guardianContact = guardianContact;

    await student.save();

    const updatedStudent = await Student.findById(req.params.id).populate('class', 'grade section').populate('user', 'email');

    return successResponse(res, 200, 'Student updated successfully', { student: updatedStudent });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }
    
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }
    await Student.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Student deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
