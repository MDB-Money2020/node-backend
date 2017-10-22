var fs = require('fs');
var AWS = require('aws-sdk');
var uuid = require('uuid/v4');
var user = require('../logic/user.js');
AWS.config.region = 'us-east-1';
var rekognition = new AWS.Rekognition();
var request = require('request').defaults({
    encoding: null
});
var db = new AWS.DynamoDB();
var s3 = new AWS.S3();

function get_and_encode(url) {
    return new Promise(function(resolve, reject) {
        request.get(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error)
            }
        });
    });
}

function get_face(params) {
    return new Promise(function(resolve, reject) {
        rekognition.searchFacesByImage(params, function(err, data) {
            if (err) reject(err);
            if (!data || !data.FaceMatches || data.FaceMatches.length == 0 || !data.FaceMatches[0].Face || !data.FaceMatches[0].Face.FaceId) {
                return reject();
            }
            resolve(data.FaceMatches[0].Face.FaceId);
        });
    });
}

function get_item_and_store(params, encodedUrl, fileExt) {
    return new Promise(function(resolve, reject) {
        db.getItem(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                storeImageInS3(encodedUrl, data.Item.FullName.S, data.Item.Id.S, fileExt)
                resolve(data.Item.Id.S);
            }
        });
    });
}

function storeImageInS3(img, name, id, fileExt) {

        params = {
            Bucket: 'instantfaces',
            Key: 'index/'+uuid()+'.'+fileExt,
            Body: img,
            Metadata: {
                "FullName": name,
                "Id": id
            }
        };

        s3.putObject(params, function(err, data) {
            if (err) console.log(err);
        });
}

function process_image(url) {
    var encoded;
    var fileExt = url.split('.').pop();
    return get_and_encode(url).then(function(encodedUrl) {
        encoded = encodedUrl;
        var params = {
            CollectionId: "family_collection",
            FaceMatchThreshold: 90,
            Image: {
                Bytes: encodedUrl
            },
            MaxFaces: 1
        };
        return get_face(params);
    }).then(function(faceId) {
        var params = {
            AttributesToGet: [
                "FullName",
                "Id"
            ],
            TableName: 'family_collection',
            Key: {
                "RekognitionId": {
                    "S": faceId
                }
            }
        }
        return get_item_and_store(params, encoded, fileExt);
    }).then(function(userId){
        return user.getById({userId: userId});
    });

}

module.exports.process_image = process_image;