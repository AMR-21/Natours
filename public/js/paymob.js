import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId, userId) => {
  try {
    // 1) get checkout URL from the API
    const data = await axios(`/api/v1/bookings/paymob/${tourId}/${userId}`);

    const { url } = data.data;

    window.location.replace(url);
  } catch (err) {
    console.error(err);
    showAlert('error', err);
  }
};
