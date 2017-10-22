// DEPENDENCIES
var router = require("express").Router();
var dbutil = require('./utils/dbutil.js');
var menuItem = require("./logic/menuitem.js");
var order = require("./logic/order.js");
var user = require("./logic/user.js");
var restaurant = require("./logic/restaurant.js");
var expressValidator = require("express-validator");

var formatErrorMessage = "Invalid param format";
var missingErrorMessage = "Missing or empty param";
var dbErrorMessage = "Object with id specified not found in the database";

// VALIDATOR
router.use(expressValidator({
  customValidators: {
    valueLessThan: function(param, value) {
      return param < value;
    },
    valueGreaterThan: function(param, value) {
      return param > value;
    },
    isNonEmptyArray: function(value) {
      return (Array.isArray(value)) && (value.length > 0);
    },
    keyExistsInDB: function(param, ref) {
      return new Promise(function(resolve, reject) {
        return dbutil.checkIfAllKeysExist(ref, [param]).then(
          function(exists) {
            if (exists) {
              resolve();
            } else {
              reject();
            }
          });
      });
    },
    isTrue: function(param) {
      return param == "true";
    },
    isValidNumber: function(param) {
      var num = +param;
      return !isNaN(num);
    }
  }
}));

// REQUEST HANDLER

function completeRequest(req, res, func) {
  return req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400).json({
        result: null,
        status: 400,
        error: result.array()
      });
      return;
    }
    var allParams = {};
    for (var key in req.query) {
      if (req.query[key] != null) {
        allParams[key] = req.query[key];
      }
    }
    for (var key in req.body) {
      if (req.body[key] != null) {
        allParams[key] = req.body[key];
      }
    }
    for (var key in req.params) {
      if (req.params[key] != null) {
        allParams[key] = req.params[key];
      }
    }

    return func(allParams).then(function(result) {
      res.status(200).json({
        result: result || true,
        status: 200,
        error: null
      });
    }).catch(function(error) {
      res.status(500).json({
        result: null,
        status: 500,
        error: error.toString()
      });
    });
  });
}

function rejectRequest(req, res) {
  return completeRequest(req, res, function(params) {
    return Promise.reject(new Error("Could not clasify your request."));
  });
}

// METHODS

//ORDER METHODS


router.get("/orders/:orderId?/:userId?/:restaurantId?", function(req, res) {
  if (req.query.orderId) {
    req.checkQuery("orderId", missingErrorMessage).notEmpty();
    req.checkQuery("orderId", dbErrorMessage).keyExistsInDB(dbutil.refs.orderRef);
    return completeRequest(req, res, order.getById);
  } else if (req.query.userId) {
    req.checkQuery("userId", missingErrorMessage).notEmpty();
    req.checkQuery("userId", dbErrorMessage).keyExistsInDB(dbutil.refs.userRef);
    return completeRequest(req, res, order.getAllOrdersForUser);
  } else if (req.query.restaurantId) {
    req.checkQuery("restaurantId", missingErrorMessage).notEmpty();
    req.checkQuery("restaurantId", dbErrorMessage).keyExistsInDB(dbutil.refs.restaurantRef);
    return completeRequest(req, res, order.getOrdersByRestaurant);
  }
  return rejectRequest(req, res);
});

router.post("/orders", function(req, res) {
  req.checkBody("userId", missingErrorMessage).notEmpty();
  req.checkBody("userId", dbErrorMessage).keyExistsInDB(dbutil.refs.userRef);
  req.checkBody("orderItems", missingErrorMessage).notEmpty();
  req.checkBody("restaurantId", missingErrorMessage).notEmpty();
  req.checkBody("restaurantId", dbErrorMessage).keyExistsInDB(dbutil.refs.restaurantRef);
  return completeRequest(req, res, order.placeOrder);
});

//MENUITEM METHODS

router.get("/menuitems/:menuItemId?/:restaurantId?/:userId?", function(req, res) {
  if (req.query.menuItemId) {
    req.checkQuery("menuItemId", missingErrorMessage).notEmpty();
    req.checkQuery("menuItemId", dbErrorMessage).keyExistsInDB(dbutil.refs.menuItemRef);
    return completeRequest(req, res, menuItem.getById);
  } else if (req.query.restaurantId) {
    req.checkQuery("restaurantId", missingErrorMessage).notEmpty();
    req.checkQuery("restaurantId", dbErrorMessage).keyExistsInDB(dbutil.refs.restaurantRef);
    return completeRequest(req, res, menuItem.getByRestaurant);
  } else if (req.query.userId) {
    req.checkQuery("userId", missingErrorMessage).notEmpty();
    req.checkQuery("userId", dbErrorMessage).keyExistsInDB(dbutil.refs.userRef);
    return completeRequest(req, res, menuItem.getByUser);
  }
  return rejectRequest(req, res);
});

router.post("/menuItems", function(req, res) {
  req.checkBody("title", missingErrorMessage).notEmpty();
  req.checkBody("category", missingErrorMessage).notEmpty();
  req.checkBody("price", missingErrorMessage).notEmpty();
  req.checkBody("price", missingErrorMessage).isValidNumber();
  req.checkBody("description", missingErrorMessage).notEmpty();
  req.checkBody("imageUrl", missingErrorMessage).notEmpty();
  req.checkBody("restaurantId", missingErrorMessage).notEmpty();
  req.checkBody("restaurantId", dbErrorMessage).keyExistsInDB(dbutil.refs.restaurantRef);
  req.checkBody("carbs", missingErrorMessage).notEmpty();
  req.checkBody("carbs", missingErrorMessage).isValidNumber();
  req.checkBody("protein", missingErrorMessage).notEmpty();
  req.checkBody("protein", missingErrorMessage).isValidNumber();
  req.checkBody("fat", missingErrorMessage).notEmpty();
  req.checkBody("fat", missingErrorMessage).isValidNumber();
  req.checkBody("calories", missingErrorMessage).notEmpty();
  req.checkBody("calories", missingErrorMessage).isValidNumber();
  req.checkBody("ingredients", missingErrorMessage).notEmpty();
  return completeRequest(req, res, menuItem.createMenuItem);
});

//RESTAURANT METHODS

router.get("/restaurants/:restaurantId/", function(req, res) {
  req.checkParams("restaurantId", missingErrorMessage).notEmpty();
  req.checkParams("restaurantId", dbErrorMessage).keyExistsInDB(dbutil.refs.restaurantRef);
  return completeRequest(req, res, restaurant.getById);
});

router.post("/restaurants/", function(req, res) {
  req.checkBody("name", missingErrorMessage).notEmpty();
  req.checkBody("accountNumber", missingErrorMessage).notEmpty();
  req.checkBody("logoUrl", missingErrorMessage).notEmpty();
  req.checkBody("imageUrl", missingErrorMessage).notEmpty();
  return completeRequest(req, res, restaurant.createRestaurant);
});

//USER METHODS

router.get("/users/:userId/", function(req, res) {
  req.checkParams("userId", missingErrorMessage).notEmpty();
  req.checkParams("userId", dbErrorMessage).keyExistsInDB(dbutil.refs.userRef);
  return completeRequest(req, res, user.getById);
});

router.post("/users/", function(req, res) {
  req.checkBody("fullName", missingErrorMessage).notEmpty();
  req.checkBody("accountNumber", missingErrorMessage).notEmpty();
  req.checkBody("address", missingErrorMessage).notEmpty();
  req.checkBody("city", missingErrorMessage).notEmpty();
  req.checkBody("state", missingErrorMessage).notEmpty();
  return completeRequest(req, res, user.createUser);
});

router.patch("/users/verification/", function(req, res) {
  req.checkBody("imageUrl", missingErrorMessage).notEmpty();
  return completeRequest(req, res, user.verify);
})

// EXPORTS
module.exports = router;
