import api from './api';

export const getTeachers = async () => {
  const { data } = await api.get('/teachers');
  return data;
};

export const createTeacher = async (teacherData) => {
  const { data } = await api.post('/teachers', teacherData);
  return data;
};

export const updateTeacher = async (id, teacherData) => {
  const { data } = await api.put(`/teachers/${id}`, teacherData);
  return data;
};

export const deleteTeacher = async (id) => {
  const { data } = await api.delete(`/teachers/${id}`);
  return data;
};
