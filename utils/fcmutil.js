// DEPENDENCIES
var dbutil = require("./dbutil.js");
var firebase = require("firebase-admin");

// METHODS
function sendNotificationToDevice(deviceRegToken, message, type, additionalData) {
	var options = {
		priority: "high"
	};

	var payload = {
		notification: {
			title: "Money2020",
			body: message,
			icon: "icon_notification",
			sound: "default"
		},
		data: {
			type: type,
		}
	};

	if (additionalData) {
		payload["data"]["additionalData"] = additionalData
	}

	return firebase.messaging().sendToDevice(deviceRegToken, payload, options);
}

function sendNotificationToTopic(topic, message, type, additionalData) {
	var options = {
		priority: "high"
	};

	var payload = {
		notification: {
			title: "Money2020",
			body: message,
			icon: "icon_notification",
			sound: "default"
		},
		data: {
			type: type
		}
	};

	if (additionalData) {
		payload["data"]["additionalData"] = additionalData
	}

	return firebase.messaging().sendToTopic(topic, payload, options);
}

function sendSilentNotificationToDevice(deviceRegToken, message, type, additionalData) {
	var options = {
		priority: "high",
		contentAvailable: true
	};

	var payload = {
		notification: {},
		data: {
			type: type
		}
	};

	if (additionalData) {
		payload["data"]["additionalData"] = additionalData
	}

	return firebase.messaging().sendToDevice(deviceRegToken, payload, options);
}

function sendSilentNotificationToTopic(topic, message, type, additionalData) {
	var options = {
		priority: "high",
		contentAvailable: true
	};

	var payload = {
		notification: {},
		data: {
			type: type
		}
	};

	if (additionalData) {
		payload["data"]["additionalData"] = additionalData
	}

	return firebase.messaging().sendToTopic(topic, payload, options);
}

function sendDataMessageToDevice(deviceRegistrationToken, data) {
	var payload = {
	  "data": data
	};
	var options = {
		priority: "high"
	};
	return firebase.messaging().sendToDevice(deviceRegistrationToken, payload, options);
}


function sendDataMessageToTopic(topic, data) {
	var payload = {
	  "data": data
	};
	var options = {
		priority: "high"
	};
	return firebase.messaging().sendToTopic(topic, payload, options);
}

// EXPORTS
module.exports.sendDataMessageToDevice = sendDataMessageToDevice;
module.exports.sendDataMessageToTopic = sendDataMessageToTopic;
module.exports.sendNotificationToDevice = sendNotificationToDevice;
module.exports.sendNotificationToTopic = sendNotificationToTopic;
module.exports.sendSilentNotificationToDevice = sendSilentNotificationToDevice;
module.exports.sendSilentNotificationToTopic = sendSilentNotificationToTopic;
