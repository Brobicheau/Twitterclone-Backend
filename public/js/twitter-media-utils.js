var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");
var Media = require("../../models/mediaModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");
var fs = require('fs');
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints: ['192.168.1.34'], keyspace: 'twitter'});


var addmedia = function(params, callback){

	var id = shortid.generate();

	var filename = params.filename;
	var data = params.data;

	var newMedia = Media({
		'id': id,
		'filename':filename,
		'content':data
	});
	newMedia.save(function(err){
		if(err){
			callback(err, {'status':'error'});
		}
		else {
			callback(null ,{'status':'OK', 'id':id});
		}
	})
}





var getMedia = function(params, callback){
	var id = params.id;
	Media.findOne({'id':id}, function(err, media){
		//////////console.log(media);
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
		//	////////console.log('could not find file');
			callback('could not find media file', {'status':'OK'});
		}
	})
}

	
var deleteMedia = function(id_array, callback){
	for(i = 0; i< id_array.length; i++){
		var id = id_array[i];
		Media.findOne({'id':id}).remove().exec(function(err){});
	}
	callback(null, {'status':'OK'});
}

module.exports = {addmedia, getMedia, deleteMedia}


