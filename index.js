// DEPENDENCIES
var express = require('express');
var cors = require("cors");
var bodyParser = require("body-parser");
var validator = require('express-validator');
var router = require("./router.js");

// SETUP
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use("/", router);

// START SERVER
const port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log("Server listening on port: " + port);
});
