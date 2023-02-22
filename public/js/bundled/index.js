require('@babel/polyfill');
var e = require('axios');
function t(e) {
  return e && e.__esModule ? e.default : e;
}
const o = (e) => {
    var t = L.map('map', { zoomControl: !1 }),
      o = L.icon({
        iconUrl: '/img/pin.png',
        iconSize: [32, 40],
        iconAnchor: [16, 45],
        popupAnchor: [0, -50],
      });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      crossOrigin: '',
    }).addTo(t);
    const r = [];
    e.forEach((e) => {
      r.push([e.coordinates[1], e.coordinates[0]]),
        L.marker([e.coordinates[1], e.coordinates[0]], { icon: o })
          .addTo(t)
          .bindPopup(`<p>Day ${e.day}: ${e.description}</p>`, { autoClose: !1 })
          .openPopup();
    });
    const s = L.latLngBounds(r).pad(0.5);
    t.fitBounds(s), t.scrollWheelZoom.disable();
  },
  r = () => {
    const e = document.querySelector('.alert');
    e && e.remove();
  },
  s = (e, t) => {
    r();
    const o = `\n  <div class="alert alert--${e}">${t}</div>\n  `;
    document.querySelector('body').insertAdjacentHTML('afterbegin', o),
      window.setTimeout(r, 3e3);
  },
  a = async (o, r) => {
    try {
      'success' ===
        (
          await t(e)({
            method: 'POST',
            url: '/api/v1/users/login',
            data: { email: o, password: r },
          })
        ).data.status &&
        (s('success', 'Logged in successfully!'),
        window.setTimeout(() => {
          location.assign('/');
        }, 1500));
    } catch (e) {
      s('error', e.response.data.message);
    }
  },
  n = async (o, r) => {
    try {
      'success' ===
        (
          await t(e)({
            method: 'PATCH',
            url:
              '/api/v1/users/' +
              ('password' === r ? 'updatePassword' : 'updateMe'),
            data: o,
          })
        ).data.status &&
        (s('success', `${r.toUpperCase()} updated successfully!`),
        window.setTimeout(() => {
          location.reload(!0);
        }, 1500));
    } catch (e) {
      s('error', e.response.data.message);
    }
  },
  c =
    (Stripe(
      'pk_test_51Me5DpGo5ykfujlCXT83asPLszD4NT2iLuPmRHxRosmlQ1yQoCNrI6UkQaUvD83z48bSZ96LrPNUde15XJbrD1ky006NLM98Dz'
    ),
    async (o) => {
      try {
        const r = await t(e)(`/api/v1/bookings/checkout-session/${o}`);
        window.location.replace(r.data.session.url);
      } catch (e) {
        console.error(e), s('error', e);
      }
    }),
  u = document.getElementById('map'),
  d = document.querySelector('.form--login'),
  i = document.querySelector('.form-user-data'),
  l = document.querySelector('.form-user-password'),
  p = document.querySelector('.nav__el--logout'),
  m = document.querySelector('#book-tour');
if (u) {
  o(JSON.parse(u.dataset.locations));
}
d &&
  d.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = document.getElementById('email').value,
      o = document.getElementById('password').value;
    a(t, o);
  }),
  i &&
    i.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = new FormData(i);
      n(t, 'data');
    }),
  l &&
    l.addEventListener('submit', async (e) => {
      e.preventDefault();
      const t = document.querySelector('.btn--save-password');
      t.textContent = 'Updating...';
      const o = document.querySelector('#password-current').value,
        r = document.querySelector('#password').value,
        s = document.querySelector('#password-confirm').value;
      await n(
        { currentPassword: o, password: r, passwordConfirm: s },
        'password'
      ),
        (document.querySelector('#password-current').value = ''),
        (document.querySelector('#password').value = ''),
        (document.querySelector('#password-confirm').value = ''),
        (t.textContent = 'SAVE PASSWORD');
    }),
  p &&
    p.addEventListener('click', async () => {
      try {
        'success' ===
          (await t(e)({ method: 'GET', url: '/api/v1/users/logout' })).data
            .status && location.reload(!0);
      } catch (e) {
        s('error', 'Error logging out, Try again.');
      }
    }),
  m &&
    m.addEventListener('click', (e) => {
      e.target.textContent = 'Processing...';
      const { tourId: t } = e.target.dataset;
      c(t);
    });
//# sourceMappingURL=index.js.map
