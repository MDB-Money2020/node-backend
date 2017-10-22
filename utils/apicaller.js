// DEPENDENCIES
var request = require("request").defaults({
  encoding: null
});

// HELPER
function _makeRequest(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(err, resp, body) {
      if (err)
        reject(err);
      else if (String(resp.statusCode)[0] != "2")
        reject(resp.body);
      else {
        var result;
        try {
          var body = JSON.parse(resp.body);
          result = body.result == null ? body : body.result;
        } catch(e) {
          result = resp.body;
        }
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
