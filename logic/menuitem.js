var dbutil = require("../utils/dbutil.js");
var apicaller = require("../utils/apicaller.js");
var mlConf = require("../utils/cloudconfig.js").mlConf;
var stats = require('./stats.js');

function getById(params) {
	var id = params.menuItemId;
	return dbutil.getByKey(dbutil.refs.menuItemRef, id);
}

function getByRestaurant(params) {
	var restaurantId = params.restaurantId;
	return dbutil.getObjectsByFields(dbutil.refs.menuItemRef, {
		"restaurantId": restaurantId
	});
}

function getByUser(params) {
	var userId = params.userId;
	return dbutil.getObjectsByFields(dbutil.refs.orderRef, {
		"userId": userId
	}).then(function(orders) {
		var menuItemIds = [];
		orders.forEach(function(order) {
			if (order.orderItems) {
				Object.keys(order.orderItems).forEach(function(key) {
					var orderItem = order.orderItems[key];
					for (i = 0; i < orderItem.quantity; i++) {
						menuItemIds.push(key);
					}
				});
			}
		});
		return dbutil.getAllByKeys(dbutil.refs.menuItemRef, menuItemIds);
	});
}

function getSuggested(params) {
	return apicaller.get(mlConf.ml_endpoint + "?userId=" + params.userId +
		"&restaurantId=" + params.restaurantId).then(function(menuItemIds) {
		return dbutil.getAllByKeys(dbutil.refs.menuItemRef, menuItemIds);
	});
}

function createMenuItem(params) {
	var item = {
		title: params.title,
		category: params.category,
		description: params.description,
		imageUrl: params.imageUrl,
		price: params.price,
		restaurantId: params.restaurantId,
		carbs: params.carbs,
		protein: params.protein,
		fat: params.fat,
		calories: params.calories,
		ingredients: params.ingredients
	};
	var savedItem;
	return dbutil.createNewObjectByAutoId(dbutil.refs.menuItemRef, item)
		.then(function(menuItem) {
			savedItem = menuItem;
			return dbutil.doTransaction(dbutil.refs.restaurantRef.child(params.restaurantId)
				.child(
					"menuItemIds"),
				function(menuItemIds) {
					menuItemIds = menuItemIds || [];
					menuItemIds.push(menuItem._key);
					return menuItemIds;
				});
		}).then(function() {
			return stats.updateStats(savedItem);
		}).then(function() {
			return savedItem;
		});
}

module.exports.getById = getById;
module.exports.createMenuItem = createMenuItem;
module.exports.getByRestaurant = getByRestaurant;
module.exports.getSuggested = getSuggested;
module.exports.getByUser = getByUser;