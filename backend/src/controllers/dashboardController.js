import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private (Teacher/Admin)
export const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let summary = {
      totalTeachers: 0,
      totalStudents: 0,
      totalClasses: 0,
      todayPresent: 0,
      todayAbsent: 0,
    };

    if (req.user.role === 'ADMIN') {
      // Admin sees system-wide stats
      summary.totalTeachers = await Teacher.countDocuments();
      summary.totalStudents = await Student.countDocuments();
      summary.totalClasses = await Class.countDocuments();

      const todayAttendance = await Attendance.find({ attendanceDate: today });
      summary.todayPresent = todayAttendance.filter(a => a.status === 'PRESENT').length;
      summary.todayAbsent = todayAttendance.filter(a => a.status === 'ABSENT').length;
    } else if (req.user.role === 'TEACHER') {
      // Teacher sees stats specific to their classes
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (teacher) {
        const myClasses = await Class.find({ teacher: teacher._id }).select('_id');
        const myClassIds = myClasses.map(c => c._id);
        
        summary.totalClasses = myClassIds.length;
        summary.totalStudents = await Student.countDocuments({ class: { $in: myClassIds } });

        const todayAttendance = await Attendance.find({ 
          class: { $in: myClassIds },
          attendanceDate: today 
        });
        summary.todayPresent = todayAttendance.filter(a => a.status === 'PRESENT').length;
        summary.todayAbsent = todayAttendance.filter(a => a.status === 'ABSENT').length;
      }
    }

    return successResponse(res, 200, 'Dashboard summary retrieved', summary);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
