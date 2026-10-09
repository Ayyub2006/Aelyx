import Attendance from '../models/Attendance.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ... existing code ...

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
    attendanceDate.setHours(0, 0, 0, 0);

    // Authorization
    if (req.user.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      const cls = await Class.findById(classId);
      if (!teacher || !cls || cls.teacher?.toString() !== teacher._id.toString()) {
        return errorResponse(res, 403, 'You are not authorized to mark attendance for this class');
      }
    }

    const existingAttendance = await Attendance.findOne({ class: classId, attendanceDate });
    if (existingAttendance) {
      return errorResponse(res, 400, 'Attendance already marked for this class on this date. Please use the Edit feature.');
    }

    const studentIds = records.map(r => r.studentId);
    
    // In our new schema, students might be mapped to any equivalent class ID for the same grade/section
    // So we just check if students exist. The frontend deduplicates class selection anyway.
    const validStudentsCount = await Student.countDocuments({ _id: { $in: studentIds } });
    
    if (validStudentsCount !== records.length) {
      return errorResponse(res, 400, 'Some students were not found');
    }

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
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Duplicate attendance detected.');
    }
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Get attendance for a class on a specific date
// @route   GET /api/attendance/class/:classId
// @access  Private (Teacher/Admin)
export const getClassAttendanceByDate = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return errorResponse(res, 400, 'Please provide a date');
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Authorization
    if (req.user.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      const cls = await Class.findById(classId);
      if (!teacher || !cls || cls.teacher?.toString() !== teacher._id.toString()) {
        return errorResponse(res, 403, 'You are not authorized to view attendance for this class');
      }
    }

    const attendanceRecords = await Attendance.find({ class: classId, attendanceDate })
      .populate('student', 'name rollNumber');

    return successResponse(res, 200, 'Attendance retrieved successfully', { attendance: attendanceRecords });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Edit existing attendance for a class
// @route   PUT /api/attendance/class/:classId
// @access  Private (Teacher/Admin)
export const updateClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return errorResponse(res, 400, 'Please provide date and attendance records');
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Authorization
    if (req.user.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      const cls = await Class.findById(classId);
      if (!teacher || !cls || cls.teacher?.toString() !== teacher._id.toString()) {
        return errorResponse(res, 403, 'You are not authorized to edit attendance for this class');
      }
    }

    await Promise.all(records.map(async (record) => {
      await Attendance.findOneAndUpdate(
        { class: classId, attendanceDate, student: record.studentId },
        { status: record.status }
      );
    }));

    return successResponse(res, 200, 'Attendance updated successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};

// @desc    Get attendance report by date range
// @route   GET /api/attendance/report
// @access  Private (Teacher/Admin)
export const getAttendanceReport = async (req, res) => {
  try {
    const { classId, startDate, endDate, studentId } = req.query;

    if (!classId || !startDate || !endDate) {
      return errorResponse(res, 400, 'Please provide classId, startDate, and endDate');
    }

    // Authorization
    if (req.user.role === 'TEACHER') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      const cls = await Class.findById(classId);
      if (!teacher || !cls || cls.teacher?.toString() !== teacher._id.toString()) {
        return errorResponse(res, 403, 'You are not authorized to view reports for this class');
      }
    }

    let filter = {
      class: classId,
      attendanceDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (studentId) {
      filter.student = studentId;
    }

    const records = await Attendance.find(filter).populate('student', 'name rollNumber').sort({ attendanceDate: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = total - present;
    const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

    const summary = {
      total,
      present,
      absent,
      percentage
    };

    return successResponse(res, 200, 'Report retrieved successfully', { records, summary });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
