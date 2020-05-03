const nodemailer = require('nodemailer');
const path = require('path')
const hbs = require('nodemailer-express-handlebars');


function sendEmail(data) {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODE_EMAIL,
        pass: process.env.NODE_PASSWORD
      }
    });
    transporter.use('compile', hbs({
      viewEngine: {
        partialsDir: path.join(__dirname, 'web'),
        defaultLayout: false
      },
      viewPath: path.join(__dirname, 'web')
    }));
    console.log(data);
    let mailOptions = {
      from: 'nrg.opilaskodu.paevik@gmail.com',
      to: data.email,
      subject: 'Email confirm',
      text: 'Please confirm your account',
      //html: `${process.env.NODE_BASEHOST}/activate?key=${data.key}`, // TODO Fix body
      template: data.emailType,
      context: {
        name: data.firstname,
        key: `${process.env.NODE_BASEHOST}/${data.html}?key=${data.key}`
      }
    };

    const callback = function (err, data) {
      if (err) {
        reject(err)
      } else{
        resolve(data)
      }
    };

    transporter.sendMail(mailOptions, callback);
  })

}

module.exports = {sendEmail}