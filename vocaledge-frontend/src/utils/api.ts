/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/user';

export const signup = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, data);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    return null;
  }
};
