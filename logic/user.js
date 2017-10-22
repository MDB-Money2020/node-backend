var dbutil = require("../utils/dbutil.js");
var apputil = require("../utils/apputil.js");

function getById(params) {
  var id = params.userId;
  return dbutil.getByKey(dbutil.refs.userRef, id);
}

function createUser(params) {
  return dbutil.createNewObjectByAutoId(dbutil.refs.userRef, params);
}

module.exports.getById = getById;
module.exports.createUser = createUser;
