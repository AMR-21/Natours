import '@babel/polyfill';
import { displayMap } from './leaflet';
import { login, logout,signup,forgot,reset} from './login';
import { updateData } from './updateSetting';
import { bookTour } from './stripe';
import { showAlert } from './alert';

// DOM ELEMENTS
const map = document.getElementById('map');
const form = document.querySelector('.form--login');
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
    signup(name,email, password,passwordConfirm);
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
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) showAlert('success', alertMessage, 20);
