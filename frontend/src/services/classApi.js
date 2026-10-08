import api from './api';

export const getClasses = async () => {
  const { data } = await api.get('/classes');
  return data;
};

export const createClass = async (classData) => {
  const { data } = await api.post('/classes', classData);
  return data;
};
