import api from './api';

export const markAttendance = async (attendanceData) => {
  const { data } = await api.post('/attendance', attendanceData);
  return data;
};
