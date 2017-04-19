var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");
var Memcached = require('memcached');
var memcached = new Memcached(
		'localhost:11211',
		{
			retries:10,
			retry:10000,
			remove:true,
			failOverServers:['192.168.0.103:11211']
		});

mongoose.Promise = require('bluebird');

var login = function(username, password, email, callback){ 

User.findOne({'username':username}, function(err, user){

		console.log(user);
		if(err){
			console.log(err)
			callback(err, {'status':'error'});
		}
		if(user.verified){

			//hash their password
			var time = process.hrtime();
			bcrypt.compare(password, user.password).then(function(res){
				var diff = process.hrtime(time);
				console.log(`: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`)
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


					//respond to user
					callback(null, response, id)
				}
				//else theres an errror
				else {
					var response = {
						"status":"OK"
					}
					//show errror
					callback("Incorrect password", response, null)
				}
			});
		}
		//else error
		else{

			var response = {
				"status" : "OK"
			}
			//theres an error here 
			callback('user not found', response, null);
		}



});

/*//use the mongoose User model to find the user data with the username given
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


					//respond to user
					callback(null, response, id)
				}
				//else theres an errror
				else {
					var response = {
						"status":"error"
					}
					//show errror
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
			//console.log(err);
			callback(err, response, null);
		}

	});// end find one function*/
}



module.exports = {login}