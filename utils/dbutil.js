// DEPENDENCIES
var firebase = require("firebase-admin");
var firebaseDBUrl = require("./cloudconfig.js").firebaseConf.firebaseDBUrl;
var serviceAccount = require("../firebase-admin-conf.json");
var apputil = require("./apputil.js");

// SETUP
firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: firebaseDBUrl
});

var rootRef = firebase.database().ref();
var refs = {};
refs.menuItemRef = rootRef.child("MenuItems");
refs.restaurantRef = rootRef.child("Restaurants");
refs.userRef = rootRef.child("Users");
refs.orderRef = rootRef.child("Orders");

// HELPER
function _multipleCallback(snapshot) {
	var result = [];
	if (!snapshot.exists()) return result;
	snapshot.forEach(function(childSnapshot) {
		var obj = childSnapshot.val();
		obj._key = childSnapshot.key;
		obj._parentNode = snapshot.ref.key;
		result.push(obj);
	});
	return result;
}

// METHODS
function getAll(ref) {
	return ref.once("value").then(_multipleCallback);
}

function getAllStartsWith(ref, childParam, childValue) {
	return ref.orderByChild(childParam).startAt(childValue)
		.endAt(childValue + "\uf8ff").once("value").then(_multipleCallback);
}

function getAllWithBounds(ref, fieldToBound) {
	var primaryField = Object.keys(fieldToBound)[0];
	var primaryBound = fieldToBound[primaryField];
	return ref.orderByChild(primaryField).startAt(primaryBound[0])
		.endAt(primaryBound[1]).once("value").then(_multipleCallback)
		.then(function(objects) {
			return objects.filter(function(object) {
				var matches = true;
				Object.keys(fieldToBound).forEach(function(key) {
					var bound = fieldToBound[key];
					var objectVal = object[key];
					if (objectVal < bound[0] || objectVal > bound[1]) {
						matches = false;
						return true;
					}
				});
				return matches;
			});
		});
}

function checkIfAllKeysExist(ref, keys) {
	var plist = [];
	var exists = true;
	keys.forEach(function(key) {
		plist.push(ref.child(key).once("value").then(function(snapshot) {
			if (!snapshot.exists()) exists = false;
		}));
	});
	return Promise.all(plist).then(function() {
		return exists;
	});
}

function remove(ref, key) {
	return ref.child(key).remove();
}

function getByKey(ref, key) {
	return new Promise(function(resolve, reject) {
		return ref.child(key).once("value").then(function(snapshot) {
			if (!snapshot.exists()) {
				reject("Object with id " + key + " does not exist in the database");
			} else {
				var obj = snapshot.val();
				obj._key = key;
				obj._parentNode = snapshot.ref.key;
				resolve(obj);
			}
		});
	});
}

function getAllByKeys(ref, keys) {
	return getAll(ref).then(function(objs) {
		var result = [];
		objs.forEach(function(obj) {
			if (keys.indexOf(obj._key) >= 0)
				result.push(obj);
		});
		return result;
	});
}

function doTransaction(ref, transFunc) {
	return new Promise(function(resolve, reject) {
		ref.transaction(transFunc, function(error, committed, snapshot) {
			if (error)
				reject(error);
			else if (!committed)
				reject(new Error("transaction not committed!"));
			else if (snapshot.exists()) {
				var obj = snapshot.val();
				obj._key = snapshot.key;
				obj._parentNode = snapshot.ref.key;
				resolve(obj);
			} else {
				resolve(null);
			}
		}, true);
	});
}

function getAllLessThan(ref, childParam, value) {
	return ref.orderByChild(childParam).endAt(value).once("value").then(
		_multipleCallback);
}

function getAllGreaterThan(ref, childParam, value) {
	return ref.orderByChild(childParam).startAt(value).once("value").then(
		_multipleCallback);
}

function updateObject(ref, id, fieldToVal) {
	return new Promise(function(resolve, reject) {
		var unixTS = apputil.getCurrUnixTimeStamp();
		fieldToVal["lastUpdated"] = unixTS;
		return ref.child(id).update(fieldToVal, function(error) {
			if (error) {
				reject(error);
			} else {
				return getByKey(ref, id).then(function(obj) {
					resolve(obj);
				});
			}
		});
	});
}

function getObjectsByFields(ref, fieldToVal) {
	return new Promise(function(resolve, reject) {
		var primaryField = Object.keys(fieldToVal)[0];
		var primaryVal = fieldToVal[primaryField];
		return ref.orderByChild(primaryField).equalTo(primaryVal).once("value")
			.then(_multipleCallback).then(function(objects) {
				var filteredObjects = [];
				objects.forEach(function(object) {
					var matches = true;
					for (var key in fieldToVal) {
						var val = fieldToVal[key];
						if (object[key] !== val) {
							matches = false;
						}
					}
					if (matches) {
						filteredObjects.push(object);
					}
				});
				resolve(filteredObjects);
			});
	});
}

function createNewObjectByAutoId(ref, object) {
	var unixTS = apputil.getCurrUnixTimeStamp();
	object["lastUpdated"] = unixTS;
	return new Promise(function(resolve, reject) {
		var newRef = ref.push();
		return newRef.set(object, function(error) {
			if (error) {
				reject("Unable to create object in database");
			} else {
				object["_key"] = newRef.key;
				object["_parentNode"] = ref.key;
				resolve(object);
			}
		});
	});

}

function createNewObject(ref, object, id) {
	var unixTS = apputil.getCurrUnixTimeStamp();
	object["lastUpdated"] = unixTS;
	return new Promise(function(resolve, reject) {
		return ref.child(id).set(object, function(error) {
			if (error) {
				reject("Unable to create object in database");
			} else {
				object["_key"] = id;
				object["_parentNode"] = ref.key;
				resolve(object);
			}
		});
	});
}


// EXPORTS
module.exports.refs = refs;
module.exports.remove = remove;
module.exports.getAll = getAll;
module.exports.checkIfAllKeysExist = checkIfAllKeysExist;
module.exports.getByKey = getByKey;
module.exports.doTransaction = doTransaction;
module.exports.getAllByKeys = getAllByKeys;
module.exports.getAllLessThan = getAllLessThan;
module.exports.getAllWithBounds = getAllWithBounds;
module.exports.getAllStartsWith = getAllStartsWith;

module.exports.getAllGreaterThan = getAllGreaterThan;
module.exports.updateObject = updateObject;
module.exports.getObjectsByFields = getObjectsByFields;
module.exports.createNewObjectByAutoId = createNewObjectByAutoId;
module.exports.createNewObject = createNewObject;
