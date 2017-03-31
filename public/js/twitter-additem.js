var express = require('express'); // EXPRESS MODULE
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
				callback(err, response);
			}

			else{

			var	response = {
				"id": id,
				"status" : "OK"
			};
			//else lettuce know there was a success
			 console.log("Successfully saved new tweet to database");
			 callback(null, response)
			}
		});

	}//end if
	else{
		//telll em no user is logged in.
		console.log("no user logged in");
		var response  ={
			"status":"error",
			"error":"no user logged in"
		};
		callback(err, response);

	}
}

module.exports = {add}