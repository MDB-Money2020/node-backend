// DEPENDENCIES
var apiKey = require("./cloudconfig.js").visaConf.visa_api_key;
var VisaAPIClient = require("./VisaAPIClient.js");

// HELPERS
function _pay(body) {
  var baseUri = 'visadirect/';
  var resourcePath = 'fundstransfer/v1/pushfundstransactions';
  return new Promise(function(resolve, reject) {
    var visaAPIClient = new VisaAPIClient();
    visaAPIClient.doMutualAuthRequest(baseUri + resourcePath,
      JSON.stringify(body), 'POST', {},
      function(err, responseCode) {
        if (err) reject(err);
        else resolve(responseCode);
      });
  });
}

// METHODS
function payment(sender, recipient, amount) {
  return _pay({
    "acquirerCountryCode": "840",
    "acquiringBin": "408999",
    "amount": amount,
    "businessApplicationId": "AA",
    "cardAcceptor": {
      "address": {
        "country": "USA",
        "county": "San Mateo",
        "state": "CA",
        "zipCode": "94404"
      },
      "idCode": "CA-IDCode-77765",
      "name": "Visa Inc. USA-Foster City",
      "terminalId": "TID-9999"
    },
    "localTransactionDateTime": "2017-10-21T23:37:17",
    "merchantCategoryCode": "6012",
    "pointOfServiceData": {
      "motoECIIndicator": "0",
      "panEntryMode": "90",
      "posConditionCode": "00"
    },
    "recipientName": recipient.name,
    "recipientPrimaryAccountNumber": recipient.accountNumber,
    "retrievalReferenceNumber": "412770451018",
    "senderAccountNumber": sender.accountNumber,
    "senderAddress": sender.address,
    "senderCity": sender.state,
    "senderCountryCode": "124",
    "senderName": sender.name,
    "senderReference": "",
    "senderStateCode": sender.state,
    "sourceOfFundsCode": "05",
    "systemsTraceAuditNumber": "451018",
    "transactionCurrencyCode": "USD",
    "transactionIdentifier": "381228649430015"
  });
}

// EXPORTS
module.exports.payment = payment;
