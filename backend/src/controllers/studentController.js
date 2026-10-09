import Student from '../models/Student.js';
import Class from '../models/Class.js';
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

    const students = await Student.find(query).populate('class', 'grade section');
    return successResponse(res, 200, 'Students retrieved successfully', { students });
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
    const student = await Student.findById(req.params.id).populate('class', 'grade section');
    if (!student) {
      return errorResponse(res, 404, 'Student not found');
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
    const { name, rollNumber, classId, guardianContact } = req.body;

    // Check if roll number exists
    const studentExists = await Student.findOne({ rollNumber });
    if (studentExists) {
      return errorResponse(res, 400, 'Student with this roll number already exists');
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return errorResponse(res, 404, 'Class not found');
    }

    const student = await Student.create({
      name,
      rollNumber,
      class: classId,
      section: classExists.section,
      guardianContact,
    });

    const populatedStudent = await Student.findById(student._id).populate('class', 'grade section');

    return successResponse(res, 201, 'Student created successfully', { student: populatedStudent });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
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

    if (name) student.name = name;
    if (guardianContact) student.guardianContact = guardianContact;

    await student.save();

    const updatedStudent = await Student.findById(req.params.id).populate('class', 'grade section');

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
    
    await Student.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Student deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
