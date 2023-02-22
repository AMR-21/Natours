import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51Me5DpGo5ykfujlCXT83asPLszD4NT2iLuPmRHxRosmlQ1yQoCNrI6UkQaUvD83z48bSZ96LrPNUde15XJbrD1ky006NLM98Dz'
);

export const bookTour = async (tourId) => {
  try {
    // 1) get checkout session from the API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    console.log(session);

    // 2) create checkout form + charge credit card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.error(err);
    showAlert('error', err);
  }
};
