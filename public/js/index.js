import '@babel/polyfill';
import { displayMap } from './leaflet';
import { login, logout, signup, forgot, reset } from './login';
import { updateData } from './updateSetting';
import { createTour, findSlug, findID, delTour } from './tour';
import { bookTour } from './paymob';
import { showAlert } from './alert';
import { addReview } from './review';

// DOM ELEMENTS
const map = document.getElementById('map');
const form = document.querySelector('.form--login');
const formAdd = document.querySelector('.form--tour-add');
const formSlug = document.querySelector('.form--tour-slug');
const formId = document.querySelector('.form--tour-id');
const success = document.querySelector('.success');
const formReview = document.querySelector('.form--review');
const signupForm = document.querySelector('.form--signup');
const formUpdate = document.querySelector('.form-user-data');
const formForgot = document.querySelector('.form--forgot');
const formReset = document.querySelector('.form--reset-password');
const formUpdatePassword = document.querySelector('.form-user-password');
const logoutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.querySelector('#book-tour');

// DELEGATION
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

if (success) {
  window.setTimeout(() => {
    location.assign('/my-tours');
  }, 3 * 1000);
}

if (formAdd)
  formAdd.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent the default form submission behavior

    // const data = document.getElementById('tour-data').value; // get the form data as FormData object
    const data = new FormData(formAdd);
    createTour(data);
  });

if (formSlug)
  formSlug.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent the default form submission behavior

    const data = document.getElementById('slug').value; // get the form data as FormData object
    const msg = await findSlug(data);
    document.querySelector('.status-slug').value = msg;
  });

if (formId)
  formId.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent the default form submission behavior
    if (e.target.classList.contains('btn--del')) return;

    const data = document.getElementById('id').value; // get the form data as FormData object
    const { msg, id } = await findID(data);
    document.querySelector('.status-ID').value = msg;
    if (id) {
      const del = document.querySelector('.btn--del');
      del.disabled = false;

      del.addEventListener('click', delTour.bind(del, id));
    }
  });

if (form)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (formReset)
  formReset.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const token = window.location.href.split('/').at(-1);

    reset(password, passwordConfirm, token);
  });

if (formForgot)
  formForgot.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgot(email);
  });

if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });

if (formUpdate)
  formUpdate.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(formUpdate);
    updateData(form, 'data');
  });

if (formUpdatePassword)
  formUpdatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.querySelector('.btn--save-password');

    btn.textContent = 'Updating...';
    const currentPassword = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    await updateData(
      { currentPassword, password, passwordConfirm },
      'password'
    );

    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
    btn.textContent = 'SAVE PASSWORD';
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId, userId } = e.target.dataset;
    bookTour(tourId, userId);
  });

if (formReview)
  formReview.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = document.querySelector('.data');
    const tour = data.dataset.tour;
    const user = data.dataset.user;
    const review = document.querySelector('#review').value;
    const rating = document.querySelector('#rating').value;
    addReview(tour, user, review, rating);
  });

// const formT = document.getElementById('myForm');

// if (formT)
//   formT.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const formData = new FormData(formT);

//     console.log(formData.get('name'));
//   });

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) showAlert('success', alertMessage, 20);
