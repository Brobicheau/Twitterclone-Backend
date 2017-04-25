var mongoose = require("mongoose");
var Follow = require("../../models/followModel.js");


var follow = function(params, callback){

	var toFollow = params.username;
	var follow = params.follow;
	var currentUser = params.currentUser;

	if(follow){
		newFollow = Follow({
			'username': currentUser,
			'following': toFollow
		});

		newFollow.save(function(err, results){

			if(err){
				response = {
					"status":"error"
				};
				callback(err, response);
			}
			else {
				response = {
					"status":"OK"
				}
				callback(null, response);
			}
		})
	}
}

var unFollow = function(params, callback){
	var toFollow = params.username;
	var follow = params.follow;
	var currentUser = params.currentUser;
	Follow.findOne({"username": currentUser, "following":toFollow}, function(err, toRemove){

		if(err){
			callback("couldnt find user to unfollow", {"status":"error"});
		}
		else if(toRemove) {
			toRemove.remove(function(err, removed){

				if(err){
					callback(err, {"status":"error"});

				}
				else {
					callback(null, {"status":"OK"});
				}
			})
		}
		else {
			callback('cant find user to follow', {'status':'error'});
		}

	})	
}


var followers = function(params, callback){

	var limit = params.limit;
	var username = params.username;

	if(!limit){
		limit = 50;
	}
	else if(limit > 200){
		limit = 200;
	}


	Follow.find({"following":username}).limit(limit).exec(function(err, followers){
		if(err){
			console.log(err);
			callback(err, {"status":"error"});
		}
		else {
			var ret = [];
			for( i = 0; i < followers.length;i++){
				ret.push(followers[i].username);
			}
			var response = {
				"users":ret,
				"status":"OK"
			};
			callback(null, response);
		}
	})
}


var following = function(params, callback){

	var username = params.username;
	var limit = params.limit;
	var currentUser = params.currentUser;


	Follow.find({"username":username}).limit(limit).exec(function(err, following){
		if(err){
			console.log(err);
			callback(err, {"status":"error"});
		}
		else {
			var ret = [];

			for( i = 0; i < following.length;i++){
				ret.push(following[i].username);
			}
			var response = {
				"users":ret,
				"status":"OK"
			};

			callback(null, response);
		}
	})
}


var getFollowerCount = function(params, callback){

	var username = params.username;

	Follow.count({"following":username}, function(err, count){

		if(err)
			callback(null, {"status":"error"});
		else{
			callback(null,count);
		}
	})
}

var getFollowingCount = function(params, callback){

	var username = params.username;

	Follow.count({"username":username}, function(err, count){

		if(err)
			callback(null, {"status":"error"});
		else{
			callback(null,count);
		}
	})
}



module.exports = {follow, following, followers, unFollow, getFollowerCount, getFollowingCount};