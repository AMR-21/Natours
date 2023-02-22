const nodemailer = require('nodemailer');
const Transport = require('nodemailer-sendinblue-transport');
const pug = require('pug');
const html2text = require('html-to-text');

module.exports = class {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Amr Yasser <${process.env.EMAIL_FROM}`;
  }

  getTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport(
        new Transport({
          apiKey: process.env.SENDINBLUE_KEY,
        })
      );
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1) render html for the email based on a pug template

    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: html2text.convert(html),
    };

    // 3) create a transport and send email
    await this.getTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    );
  }
};

// const sendMail = async (options) => {
//   // 1) Create transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },

//     // Activate in gmail "less secure app" option
//     // service: 'Gmail',
//     // auth: {
//     //   user: process.env.EMAIL_USERNAME,
//     //   pass: process.env.EMAIL_PASSWORD,
//     // },
//   });

//   // 2) Define the email options
//   const mailOptions = {
//     from: 'Amr Yasser <amr@kosomk.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };

//   // 3) actually send the email
//   await transporter.sendMail(mailOptions);
// };
