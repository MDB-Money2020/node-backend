// DEPENDENCIES
const nodemailer = require('nodemailer');
const mailConf = require("./cloudconfig.js").mailConf;

// CONSTANTS
const transporter = nodemailer.createTransport({
  host: mailConf.smtp_host,
  port: parseInt(mailConf.smtp_port),
  secure: mailConf.smtp_secure == "true" ? true : false,
  auth: {
    user: mailConf.smtp_email,
    pass: mailConf.smtp_password
  }
});

const fromStr = '"' + mailConf.smtp_from + '" <' + mailConf.smtp_email + '>';

// METHODS
function sendEmail(email, subject, text) {
  return new Promise(function(resolve, reject) {
    transporter.sendMail({
      from: fromStr,
      to: email,
      subject: subject,
      text: text,
    }, function(error, info) {
      if (error) reject(error);
      else resolve(info);
    });
  });
}


// EXPORTS
module.exports.sendEmail = sendEmail;
