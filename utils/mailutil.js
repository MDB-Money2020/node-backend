// DEPENDENCIES
const nodemailer = require('nodemailer');
const jade = require('jade');
var fs = require('fs');
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

// HELPER
function renderTemplate(templatePath, data) {
  var template = process.cwd() + templatePath;
  return new Promise(function(resolve, reject) {
    fs.readFile(template, 'utf8', function(err, file) {
      if (err) reject(err);
      else {
        var compiledTmpl = jade.compile(file, {
          filename: template
        });
        resolve(compiledTmpl(data));
      }
    });
  });
}

// METHODS
function sendEmail(email, subject, html) {
  return new Promise(function(resolve, reject) {
    transporter.sendMail({
      from: fromStr,
      replyTo: mailConf.smtp_from,
      to: email,
      subject: subject,
      html: html,
    }, function(error, info) {
      if (error) reject(error);
      else resolve(info);
    });
  });
}

// EXPORTS
module.exports.renderTemplate = renderTemplate;
module.exports.sendEmail = sendEmail;
