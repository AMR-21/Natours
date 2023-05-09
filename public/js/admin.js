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
      window.setTimeout(() => {
        location.reload();
      }, 1700);
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
      return { msg: `Tour Name: ${res.data.data.tour.name}`, id };
    }
  } catch (err) {
    showAlert('error', 'Tour Not Found!');
    return { msg: `Tour Not Found!` };
  }
};

export const findUserID = async (id) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/users/${id}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'User Found!');
      return { msg: `User Email: ${res.data.data.user.email}`, id };
    }
  } catch (err) {
    showAlert('error', 'User Not Found!');
    return { msg: `User Not Found!` };
  }
};

export const findRev = async (id) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/reviews/${id}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review Found!');
      return { msg: `Review found: ${res.data.data.review.id}`, id };
    }
  } catch (err) {
    showAlert('error', 'Review Not Found!');
    return { msg: `Review Not Found!` };
  }
};

export const findBok = async (id) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/bookings/${id}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Booking Found!');
      return { msg: `Booking found: ${res.data.data.booking.id}`, id };
    }
  } catch (err) {
    showAlert('error', 'Booking Not Found!');
    return { msg: `Booking Not Found!` };
  }
};

export const updUser = async (id, role) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${id}`,
      data: {
        role,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'User updated!');
    }
  } catch (err) {
    showAlert('error', 'User Not Found!');
    return { msg: `User Not Found!` };
  }
};

export const delTour = async (id) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${id}`,
    });

    if (res.status === 204) {
      showAlert('success', 'Tour deleted!');
      this.disabled = true;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const delUser = async (id) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/users/${id}`,
    });

    if (res.status === 204) {
      showAlert('success', 'User deleted!');
      this.disabled = true;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const delRev = async (id) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${id}`,
    });

    if (res.status === 204) {
      showAlert('success', 'Review deleted!');
      this.disabled = true;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const delBok = async (id) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${id}`,
    });

    if (res.status === 204) {
      showAlert('success', 'Booking deleted!');
      this.disabled = true;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
