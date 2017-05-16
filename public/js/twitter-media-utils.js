var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var User = require('../../models/userModel.js');
var Tweet = require("../../models/tweetModel.js");
var Media = require("../../models/mediaModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");
var Q = require('./twitterQ.js');
var fs = require('fs');
var ObjectID = require('bson-objectid');
MediaQ = []

var startSetIntervalMedia = function(){
	setInterval(saveMedia, 3)
}

var saveMedia = function(){

	if(MediaQ.length !== 0){
		params = MediaQ.pop();
		var path = params.path
		fs.readFile(path, function(err, data){
			var parameters = {
				"data": data,
				'filename':params.filename,
				'id':params.id
			};
			addmedia(parameters, function(err, response){
				if(err){
					fs.unlink(path);
					//res.status(400).send(response);
				}
				else{
				//	var diff = process.hrtime(time);
					//if(diff[0] > 3)
					//	console.log(`add media: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
					//res.status(200).send(response);
					fs.unlink(path);
				}
			});
		});
	}
	// if(MediaQ.length !== 0){
	// 	newTweet = MediaQ.pop();
	// 	var time = process.hrtime()
	// 	newTweet.save(function (err, results){
	// 		var diff = process.hrtime(time);
	// 		console.log(`save tweet time: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
	// 		//if there was an Error
	// 		if(err){
	// 			//print out the error(and send back correct response)
	// 			console.log(err);
	// 		}
	// 		else{
	// 			if(MediaQ.length > 125){
	// 				console.log('shrinking queue')
	// 				saveMedia()
	// 			}
	// 		}
	// 	});
	// }
}

var addMediaToQueue = function(path,filename,id){
	var params = {
		"filename":filename,
		"path":path,
		"id":id
	}
	MediaQ.push(params);
}

var addmedia = function(params, callback){


	var filename = params.filename;
	var data = params.data;
	var id = params.id;

	var newMedia = Media({
		'_id':id,
		'filename':filename,
		'content':data
	});
	//addMediaToQueue(newMedia);
	newMedia.save(function(err, results){
		if(err){
			console.log(err)
			callback(err, {'status':'error'});
		}
		else {
			callback(null ,{'status':'OK', 'id':results._id});
		}
	})
	//callback(null, {'status':'OK', 'id':id});
}





var getMedia = function(params, callback){
	var id = params.id;
	Media.findOne({'_id':id}, function(err, media){
		if(err){
			callback(err, {'status':'error'});
		}
		else if(media){
			var response = {
				'content':media.content,
				'filename':media.filename
			}
			callback(null, response);
		}
		else {
			callback('could not find media file', {'status':'OK'});
		}
	})
}

	
var deleteMedia = function(id_array, callback){
		Media.remove({'_id':{$in:id_array}} ,function(err){
			if(err){
				console.log(err);
				callback(err, {'status':'error'});
			}
			callback(null, {'status':'OK'});
		});
}

module.exports = {startSetIntervalMedia, addmedia, getMedia, deleteMedia, addMediaToQueue}


