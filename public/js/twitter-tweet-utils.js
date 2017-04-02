var parser = require('body-parser');//forparsing req params, will change to multer
var mongoose = require("mongoose");
var path = require ("path");
var bcrypt = require('bcrypt');
var shortid = require('shortid');
var cookieSession = require('cookie-session');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");

/*My libraries*/
var User = require('../../models/userModel.js');
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");

var add = function(currentUser, parent, content, callback){
	//make sure there is a used logged in before we make the tweet
	if(typeof currentUser !== 'undefined'){


		//check if the optional parent param was given
		if(!(typeof parent !== "undefined")){
			 parent = "null"

		}

		//Get the content of the new tweet
		console.log(content);

		//make a new unique ID for the tweet
		var id = shortid.generate();

		//create the tweet schema object for storing in mongodb
		newTweet = Tweet({
			"id": id,
			"username": currentUser,
			"parent": null,
			"timestamp": Date(),
			"content": content
		});

		console.log(newTweet);
		//save the sweet to the mongo database
		newTweet.save(function (err, results){

			//if there was an error
			if(err){
				//print out the error(and send back correct response)
				console.log(err);
				response = {
					"status" : "error"
				}
				//callback(err, response);
			}

			else{


			//else lettuce know there was a success
			 console.log("Successfully saved new tweet to database");
			}
		});
		var	response = {
				"id": id,
				"status" : "OK"
			};
		callback(null, response)


	}//end if
	else{
		//telll em no user is logged in.
		console.log("no user logged in");
		var response  ={
			"status":"error",
			"error":"no user logged in"
		};
		callback("error: no user logged in", response);

	}
}


var getItemById = function(search_id, callback){

	if(typeof search_id !== 'undefined'){
		console.log("searching");
		Tweet.findOne({"id": search_id}).lean().exec(function(err, tweet){

			console.log("found something  probably");

			if(err){
				console.log(err);
				callback(err, {"status":"error"})
			}


			else if(tweet){	
				var response = {
					"status": "OK",
					item: {
					"id": tweet.id,
					"username": tweet.username,
					"content": tweet.content,
					"timestamp": tweet.content,
					}
				};
				callback(null, response)
			}
		});
	}
	else {
		console.log('not valid ID');
		callback("invalid search ID",{"status":"error"});
	}
}

var search = function(params, callback) {	

	var limit = params.limit;
	var timestamp = params.timestamp;
	var following = params.following;
	var username = params.username;
	var rank = params.rank;
	var parent = params.parent;

	

	if(typeof limit === 'undefined')
		limit = 25;

	Tweet.find().sort({_id:-1}).limit(limit).lean().exec(function(err, data){

		if(err){
			console.log(err)
			response = {
				"status": "error",
				"error": err
			};
			callback(err, response)
		}
		else {
			var filler = new Array(data.lengh) ;

			console.log(data);
			for( i = 0; i < data.length; i++){
				filler[i] = {
					"id": data[i].id,
					"username": data[i].username,
					"content": data[i].content,
					"timestamp": data[i].timestamp
				};
			}
			console.log(filler);

			var response = {
				items: filler ,
				"status":"OK"
			}			
			response.items = filler;
			callback(null, response);
		}

	});
}


module.exports = {add, getItemById, search}