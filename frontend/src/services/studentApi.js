import api from './api';

export const getStudents = async (classId) => {
  const url = classId ? `/students?classId=${classId}` : '/students';
  const { data } = await api.get(url);
  return data;
};

export const getMyProfile = async () => {
  const { data } = await api.get('/students/me');
  return data;
};

export const createStudent = async (studentData) => {
  const { data } = await api.post('/students', studentData);
  return data;
};

export const updateStudent = async (id, studentData) => {
  const { data } = await api.put(`/students/${id}`, studentData);
  return data;
};

export const deleteStudent = async (id) => {
  const { data } = await api.delete(`/students/${id}`);
  return data;
};
