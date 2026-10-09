import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const generateTrendData = (records, startDate) => {
  const trend = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    // Create short day name e.g. "Mon"
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Find records matching exactly this date
    const dayRecords = records.filter(r => {
      const rDate = new Date(r.attendanceDate);
      return rDate.toISOString().split('T')[0] === dateStr;
    });

    const present = dayRecords.filter(r => r.status === 'PRESENT').length;
    const absent = dayRecords.filter(r => r.status === 'ABSENT').length;
    
    trend.push({
      date: dateStr,
      day: dayName,
      present,
      absent
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return trend;
};

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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Includes today, so 7 days total

    if (req.user.role === 'ADMIN') {
      // Admin sees system-wide stats
      summary.totalTeachers = await Teacher.countDocuments();
      summary.totalStudents = await Student.countDocuments();
      summary.totalClasses = await Class.countDocuments();

      const todayAttendance = await Attendance.find({ attendanceDate: today });
      summary.todayPresent = todayAttendance.filter(a => a.status === 'PRESENT').length;
      summary.todayAbsent = todayAttendance.filter(a => a.status === 'ABSENT').length;

      // 7 Day Trend
      const trendRecords = await Attendance.find({ 
        attendanceDate: { $gte: sevenDaysAgo, $lte: today } 
      });
      summary.trend = generateTrendData(trendRecords, sevenDaysAgo);

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

        // 7 Day Trend
        const trendRecords = await Attendance.find({ 
          class: { $in: myClassIds },
          attendanceDate: { $gte: sevenDaysAgo, $lte: today } 
        });
        summary.trend = generateTrendData(trendRecords, sevenDaysAgo);
      }
    } else if (req.user.role === 'STUDENT') {
      // Student sees stats specific to themselves
      const student = await Student.findOne({ user: req.user._id }).populate('class');
      if (student) {
        summary.studentDetails = {
          name: student.name,
          rollNumber: student.rollNumber,
          className: student.class ? `Grade ${student.class.grade}-${student.class.section}` : 'N/A'
        };

        const todayAttendance = await Attendance.findOne({
          student: student._id,
          attendanceDate: today
        });
        
        if (todayAttendance) {
          if (todayAttendance.status === 'PRESENT') summary.todayPresent = 1;
          if (todayAttendance.status === 'ABSENT') summary.todayAbsent = 1;
        }

        // 7 Day Trend just for this student
        const trendRecords = await Attendance.find({
          student: student._id,
          attendanceDate: { $gte: sevenDaysAgo, $lte: today }
        });
        summary.trend = generateTrendData(trendRecords, sevenDaysAgo);

        // Overall attendance for this student
        const allAttendance = await Attendance.find({ student: student._id });
        summary.totalAttendanceDays = allAttendance.length;
        summary.totalPresentDays = allAttendance.filter(a => a.status === 'PRESENT').length;
        summary.totalAbsentDays = allAttendance.filter(a => a.status === 'ABSENT').length;
        summary.attendancePercentage = summary.totalAttendanceDays > 0 
          ? Math.round((summary.totalPresentDays / summary.totalAttendanceDays) * 100) 
          : 0;
      }
    }

    return successResponse(res, 200, 'Dashboard summary retrieved', summary);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Server Error');
  }
};
