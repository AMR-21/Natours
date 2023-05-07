import axios from 'axios';
import { showAlert } from './alert';

export const addReview = async (tour, user, review, rating) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/reviews',
            data: {
                tour,
                user,
                review,
                rating,
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Thank You For Your Review');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', "You can't add more than one review for the same tour");
    }
}