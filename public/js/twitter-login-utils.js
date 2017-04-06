var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");

mongoose.Promise = require('bluebird');

var login = function(username, password, email, callback){ 
	console.log("in login module");

//use the mongoose User model to find the user data with the username given
	User.findOne({'username': username}).lean().exec(function(err, user){
		//if we found a user by that name
		if(user){

			//hash their password
			bcrypt.compare(password, user.password).then(function(res){

				//set the data and ID fields for adding to database
				var date = Date();
				var id = shortid.generate();


				//if the password we got from the user is the one in the database
				if (res){


					//prepare response to sendt o the user
					var response = {
						"username": username,
						"date": date,
						"status": "OK"
					};	


					console.log("LOGGED IN");
					//respond to user
					callback(null, response, id)
				}
				//else theres an errror
				else {
					var response = {
						"status":"error"
					}
					//show errror
					console.log("not user");
					callback("Incorrect password", response, null)
				}
			});
		}
		//else error
		else{

			var response = {
				"status" : "error"
			}
			//theres an error here 
			console.log(err);
			callback(err, response, null);
		}

	});// end find one function
}



module.exports = {login}