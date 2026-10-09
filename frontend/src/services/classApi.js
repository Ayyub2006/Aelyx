import api from './api';

export const getClasses = async () => {
  const { data } = await api.get('/classes');
  return data;
};

export const createClass = async (classData) => {
  const { data } = await api.post('/classes', classData);
  return data;
};

export const updateClass = async (id, classData) => {
  const { data } = await api.put(`/classes/${id}`, classData);
  return data;
};

export const deleteClass = async (id) => {
  const { data } = await api.delete(`/classes/${id}`);
  return data;
};
