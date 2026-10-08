import Attendance from '../models/Attendance.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Mark attendance for a class
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
export const markAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      return errorResponse(res, 400, 'Please provide classId, date, and attendance records');
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); // Normalize date

    // Authorization: If user is a TEACHER, verify they are assigned to this class
    if (req.user.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher) {
        return errorResponse(res, 403, 'Teacher profile not found');
      }
      if (!teacher.assignedClasses.includes(classId)) {
        return errorResponse(res, 403, 'You are not authorized to mark attendance for this class');
      }
    }

    // Check if attendance already exists for this class and date to prevent duplicates
    const existingAttendance = await Attendance.findOne({ class: classId, attendanceDate });
    if (existingAttendance) {
      return errorResponse(res, 400, 'Attendance already marked for this class on this date. Please use the Edit feature.');
    }

    // Verify all students belong to the class
    const studentIds = records.map(r => r.studentId);
    const validStudentsCount = await Student.countDocuments({ _id: { $in: studentIds }, class: classId });
    
    if (validStudentsCount !== records.length) {
      return errorResponse(res, 400, 'Some students do not belong to the selected class');
    }

    // Prepare documents for insertion
    const attendanceDocs = records.map(record => ({
      student: record.studentId,
      class: classId,
      attendanceDate,
      status: record.status
    }));

    await Attendance.insertMany(attendanceDocs);

    return successResponse(res, 201, 'Attendance saved successfully');
  } catch (error) {
    console.error(error);
    // Handle MongoDB duplicate key error explicitly just in case
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Duplicate attendance detected. Attendance already marked for one or more students.');
    }
    return errorResponse(res, 500, 'Server Error');
  }
};
