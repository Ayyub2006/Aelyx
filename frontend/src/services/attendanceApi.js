import api from './api';

export const markAttendance = async (attendanceData) => {
  const { data } = await api.post('/attendance', attendanceData);
  return data;
};

export const getClassAttendanceByDate = async (classId, date) => {
  const { data } = await api.get(`/attendance/class/${classId}?date=${date}`);
  return data;
};

export const updateClassAttendance = async (classId, updateData) => {
  const { data } = await api.put(`/attendance/class/${classId}`, updateData);
  return data;
};
