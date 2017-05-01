var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var User = require('../../models/userModel.js');
var Tweet = require("../../models/tweetModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");

mongoose.Promise = require('bluebird');

var login = function(username, password, email, callback){ 



User.findOne({'username':username}, function(err, user){

		if(err){
			//////console.log(err)
			callback(err, {'status':'error'});
		}
		if(user && user.verified){

			//hash their password
			bcrypt.compare(password, user.password).then(function(res){
				//set the data and ID fields for adding to database
				var date = Date();


				//if the password we got from the user is the one in the database
				if (res){


					//prepare response to sendt o the user
					var response = {
						"username": username,
						"date": date,
						"status": "OK"
					};	


					//respond to user
					callback(null, response, res._id)
				}
				//else theres an errror
				else {
					var response = {
						"status":"error",
						'error':'incorrect password'
					}
					//show errror
					callback("Incorrect password", response, null)
				}
			});
		}
		//else error
		else{

			var response = {
				"status" : "user not found"
			}
			//theres an error here 
			callback('user not found', response, null);
		}



});


}



module.exports = {login}