// CONSTANTS
const firebaseConfVars = [
  "firebaseDBUrl"
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
module.exports.visaConf = getConfig(visaConfVars, visaRenameVars);
