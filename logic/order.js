// DEPENDENCIES
var dbutil = require("../utils/dbutil.js");
var apputil = require("../utils/apputil.js");
var visadirecturil = require("../utils/visadirectutil.js");
var mailutil = require("../utils/mailutil.js");

// CONSTANTS
const recieptTemplate = '/views/reciept.jade';

// HELPER
function _getInvoiceItems(order) {
	var invoiceItems = [];
	var plist = [];
	Object.keys(order.orderItems).forEach(function(key) {
		var item = order.orderItems[key];
		plist.push(dbutil.getByKey(dbutil.refs.menuItemRef, key).then(function(menuItem) {
			invoiceItems.push({
				name: menuItem.title,
				price: item.menuItemPrice
			});
		}))
	})
	return Promise.all(plist).then(function() {
		return invoiceItems;
	});
}

function _sendReciept(user, order) {
	return _getInvoiceItems(order).then(function(invoiceItems) {
		var date = new Date();
		date.setTime(order.timePlaced * 1000);
		date.setDate(date.getDate() - 6);
		date.setFullYear(date.getFullYear() - 1);
		var dateStr = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
		var totalPaid = String(order.totalPaid.toFixed(2));
		var data = {
			dateStr: dateStr,
			userName: user.fullName,
			userEmail: user.email,
			invoiceItems: invoiceItems,
			totalPaid: totalPaid
		}
		return mailutil.renderTemplate(recieptTemplate, data);
	}).then(function(html) {
		return mailutil.sendEmail(user.email, "Money2020 Hackathon", html);
	}).catch(function(error) {
		console.log(error);
		console.error("MAIL FAIL TO SEND");
	}).then(function() {
		return order;
	});
}

// METHODS
function getById(params) {
	var id = params.orderId;
	return dbutil.getByKey(dbutil.refs.orderRef, id);
}

function getOrdersByRestaurant(params) {
	return dbutil.getObjectsByFields(dbutil.refs.orderRef, {
		restaurantId: params.restaurantId
	});
}

function getAllOrdersForUser(params) {
	var userId = params.userId;
	var fieldToVal = {
		"userId": userId
	};
	return dbutil.getObjectsByFields(dbutil.refs.orderRef, fieldToVal);
}

function placeOrder(params) {
	var userId = params.userId;
	var orderItems = params.orderItems;
	var restaurantId = params.restaurantId;
	var instructions = params.instructions || "";
	var restaurant, totalPaid;
	for (var key in orderItems) {
		var item = orderItems[key];
		if (!item.menuItemPrice)
			return Promise.reject("menuItemPrice is required");
		if (!item.quantity)
			return Promise.reject("quantity is required");
		item.menuItemPrice = parseFloat(item.menuItemPrice);
		item.quantity = parseInt(item.quantity);
	}
	var user;
	return dbutil.getByKey(dbutil.refs.userRef, userId).then(function(u) {
		user = u;
		return dbutil.getByKey(dbutil.refs.restaurantRef, restaurantId)
	}).then(function(rest) {
		restaurant = rest;
	}).then(function(org) {
		organization = org;
		return dbutil.getByKey(dbutil.refs.userRef, userId);
	}).then(function(user) {
		totalPaid = Object.keys(orderItems).reduce(function(total, key) {
			var orderItem = orderItems[key];
			var price = orderItem.menuItemPrice;
			price *= orderItem.quantity;
			total += price;
			return total;
		}, 0) + "";
		return visadirecturil.payment({
			accountNumber: user.accountNumber,
			name: user.fullName,
			address: user.address,
			city: user.city,
			state: user.state
		}, {
			name: restaurant.name,
			accountNumber: restaurant.accountNumber
		}, totalPaid);
	}).then(function() {
		var unixTS = apputil.getCurrUnixTimeStamp();
		var order = {
			timePlaced: unixTS,
			restaurantId: restaurantId,
			userId: userId,
			orderItems: orderItems,
			totalPaid: totalPaid,
			instructions: instructions,
			status: "placed"
		};
		if (instructions) order.additionalInstructions = instructions;
		return dbutil.createNewObjectByAutoId(dbutil.refs.orderRef, order);
	}).then(function(order) {
		return _sendReciept(user, order);
	});
}

module.exports.getById = getById;
module.exports.placeOrder = placeOrder;
module.exports.getAllOrdersForUser = getAllOrdersForUser;
module.exports.getOrdersByRestaurant = getOrdersByRestaurant;
