import api from './api';

export const getTeachers = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/teachers?page=${page}&limit=${limit}`);
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
