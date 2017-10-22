var dbutil = require("../utils/dbutil.js");
var apputil = require("../utils/apputil.js");
var process_image = require("../utils/bioid.js").process_image;

function getById(params) {
  var id = params.userId;
  return dbutil.getByKey(dbutil.refs.userRef, id);
}

function createUser(params) {
  return dbutil.createNewObjectByAutoId(dbutil.refs.userRef, params);
}

function verify(params) {
    var imageUrl = params.imageUrl;
    return process_image(imageUrl)
}

module.exports.getById = getById;
module.exports.createUser = createUser;
module.exports.verify = verify;
