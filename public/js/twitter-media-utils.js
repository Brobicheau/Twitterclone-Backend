var mongoose = require("mongoose");
var bcrypt = require('bcrypt');

var Media = require("../../models/mediaModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");
var fs = require('fs');



var addmedia = function(params, callback){
	var time = process.hrtime();

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
			var diff = process.hrtime(time);
			if(diff[0] > 3)
				console.log(`add media query: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			//callback(err, {'status':'error'});
		}
		else {

		}
	})
	var diff = process.hrtime(time);
	if(diff[0] > 3)
		console.log(`add media query: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);			
	callback(null ,{'status':'OK', 'id':id});
}





var getMedia = function(params, callback){
	var id = params.id;
	Media.findOne({'id':id}, function(err, media){
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
	for(i = 0; i< id_array.length; i++){
		var id = id_array[i];
		Media.findOne({'id':id}).remove().exec(function(err){});
	}
	callback(null, {'status':'OK'});
}

module.exports = {addmedia, getMedia, deleteMedia}


