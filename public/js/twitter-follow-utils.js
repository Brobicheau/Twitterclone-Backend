var mongoose = require("mongoose");
var Tweet = require("../../models/followModel.js");


var follow = function(params, callback){

	var toFollow = params.username;
	var follow = params.follow;
	var currentUser = params.currentUser;

	if(follow){
		newFollow = Follow({
			username: currentUser,
			following: toFollow
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
	else {
		Follow.findOne({"username": currentUser, "following":toFollow}, function(err, toRemove){

			if(err){
				callback("couldnt find user to unfollow", {"status":"error"});
			}
			else {
				Follow.remove(toRemove, function(err, removed){

					if(err){
						callback(err, {"status":"error"});

					}
					else {
						callback(null, {"status":"OK"});
					}
				})
			}

		})
	}
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


	Follow.find({"following":username}).limit(limit).toArray().exec(function(err, followersArray){
		if(err){
			console.log(err);
			callback(err, {"status":"error"});
		}
		else {
			followers = newArray();
			for( i = 0; i < followersArray.length();i++){
				followers.push(followersArray[i].username);
			}
			var response = {
				"users":followers,
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

	Follow.find({"username":username}).limit(limit).toArray().exec(function(err, following){
		if(err){
			console.log(err);
			callback(err, {"status":"error"});
		}
		else {
			following = newArray();
			for( i = 0; i < followingArray.length();i++){
				following.push(followingArray[i].username);
			}
			var response = {
				"users":following,
				"status":"OK"
			};
			callback(null, response);
		}
	})
}



module.exports = {follow, following};