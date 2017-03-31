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


var verify = function(email, key, callback) {

	TempUser.findOne({'email':email}, function(err, user){

		//if there was an error
		if(err){
			//should be sending the client somme sort of error
			console.log("err");
		}


		//this is the key crap for backdooring user verification
		if (key === "abracadabra"){

			var newUser =  User ({
				"username": user.username,
				"email": user.email,
				"password": user.password,
				"status": "OK"
			});

			newUser.save(function(err, results){

				if(err)
				{
					console.log("error")
					var response = {
						"status": "error",
						"error": err
					}
					callback(err, response)
				}
				else {
					var response = {
						"status": "OK",
					}
					res.send(response);
					callback(null, response)

				}

			});

		}		
	});
}

module.exports = {verify}