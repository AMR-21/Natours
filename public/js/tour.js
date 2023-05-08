import axios from 'axios';
import { showAlert } from './alert';

export const createTour = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/tours',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Tour created successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const findSlug = async (slug) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/tours?slug=${slug}`,
    });

    if (res.data.status === 'success') {
      if (res.data.data.tours.length === 0) {
        showAlert('error', 'Tour Not Found!');
        return 'Tour Not Found!';
      }
      showAlert('success', 'Tour Found!');
      return `Tour ID: ${res.data.data.tours[0].id}`;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    return 'Tour Not Found!';
  }
};

export const findID = async (id) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/tours/${id}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Tour Found!');
      return `Tour Name: ${res.data.data.tour.name}`;
    }

    showAlert('error', 'Tour Not Found!');
    return 'Tour Not Found!';
  } catch (err) {
    showAlert('error', err.response.data.message);
    return 'Tour Not Found!';
  }
};
