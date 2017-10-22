// DEPENDENCIES
var request = require("request");

// HELPER
function _makeRequest(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(err, resp, body) {
      if (err)
        reject(err);
      else if (String(resp.statusCode)[0] != "2")
        reject(resp.body);
      else {
        var body = JSON.parse(resp.body);
        var result = body.result == null ? body : body.result;
        resolve(result);
      }
    });
  });
}

// METHODS
function get(url, headers) {
  var options = {
    uri: url,
    method: 'GET',
    headers: headers
  };
  return _makeRequest(options);
}

function post(url, headers, body) {
  var options = {
    uri: url,
    method: 'POST',
    json: body,
    headers: headers
  };
  return _makeRequest(options);
}

// EXPORTS
module.exports.get = get;
module.exports.post = post;
