// CONSTANTS
const mlConf = [
  "ml_endpoint"
];

const firebaseConfVars = [
  "firebase_db_url", "firebase_private_key", "firebase_project_id",
  "firebase_client_email"
];

const visaConfVars = [
  "visa_api_key", "visa_shared_secret", "visa_user_id",
  "visa_url", "visa_password", "visa_key", "visa_cert"
];

const visaRenameVars = {
  "visa_shared_secret": "sharedSecret",
  "visa_user_id": "userId",
  "visa_url": "visaUrl",
  "visa_password": "password",
  "visa_key": "key",
  "visa_cert": "cert"
};


const mailConfVars = [
  "smtp_host", "smtp_port", "smtp_secure",
  "smtp_email", "smtp_password", "smtp_from"
];

// METHODS
function getConfig(vars, renameVars) {
  var conf = {};
  vars.forEach(function(v) {
    if (!renameVars || Object.keys(renameVars).indexOf(v) < 0)
      conf[v] = process.env[v];
    else
      conf[renameVars[v]] = process.env[v];
  });
  return conf;
}

// EXPORTS
module.exports.firebaseConf = getConfig(firebaseConfVars);
module.exports.mailConf = getConfig(mailConfVars);
module.exports.mlConf = getConfig(mlConf);
module.exports.visaConf = getConfig(visaConfVars, visaRenameVars);
