var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var Tweet = require("../../models/tweetModel.js");
var Media = require("../../models/mediaModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");
var fs = require('fs');
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints: ['192.168.1.43'], keyspace: 'twitter'});


var addmedia = function(params, callback){


	var filename = params.filename;
	var data = params.data;

	var newMedia = Media({
		'filename':filename,
		'content':data
	});
	newMedia.save(function(err, results){
		if(err){
			callback(err, {'status':'error'});
		}
		else {
			callback(null ,{'status':'OK', 'id':results._id});
		}
	})
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

module.exports = {addmedia, getMedia, deleteMedia}


