var dbutil = require("../utils/dbutil.js");
var apputil = require("../utils/apputil.js");

function getById(params) {
  var id = params.restaurantId;
  return dbutil.getByKey(dbutil.refs.restaurantRef, id);
}

function createRestaurant(params) {
  return dbutil.createNewObjectByAutoId(dbutil.refs.restaurantRef, params);
}

module.exports.getById = getById;
module.exports.createRestaurant = createRestaurant;
