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
	setInterval(saveMedia, 50)
}

var saveMedia = function(){
	if(MediaQ.length !== 0){
		newTweet = MediaQ.pop();
		var time = process.hrtime()
		newTweet.save(function (err, results){
			var diff = process.hrtime(time);
			//console.log(`save tweet time: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			//if there was an Error
			if(err){
				//print out the error(and send back correct response)
				console.log(err);
			}
			else{
				if(MediaQ.length > 1000){
					//console.log('shrinking queue')
					saveTweet()
				}
			}
		});
	}
}

var addMediaToQueue = function(newMedia){
	MediaQ.push(newMedia);
}

var addmedia = function(params, callback){


	var filename = params.filename;
	var data = params.data;

	var newMedia = Media({
		'filename':filename,
		'content':data
	});
	addMediaToQueue(newMedia);
	newMedia.save(function(err, results){
		if(err){
			console.log(err)
			callback(err, {'status':'error'});
		}
		else {
			callback(null ,{'status':'OK', 'id':results._id});
		}
	})
	//callback(null, {'status':'OK'});
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

module.exports = {startSetIntervalMedia, addmedia, getMedia, deleteMedia}


