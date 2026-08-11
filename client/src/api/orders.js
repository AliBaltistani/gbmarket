import api from './api';

export const createOrder = async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
};
