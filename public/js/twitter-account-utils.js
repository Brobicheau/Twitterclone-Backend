var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");
var Follow = require("../../models/followModel.js")
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");

mongoose.Promise = require('bluebird');





var checkForDuplicates = function(username, email, callback){



	TempUser.count({"username":username}, function(err, count) {
		if(count >0 ){
			callback("Temp User or email found", true);
		}
		else{
			TempUser.count({"email":email}, function(err, count) {
				if(count >0 ){
					callback("Temp User or email found", true);
				}
				else{
					User.count({"username":username}, function(err, count) {
						if(count >0 ){
							callback(" User or email found");
						}
						else{
							User.count({"email":email}, function(err, count) {
								if(count >0 ){
									callback(" User or email found");
								}
								else
									callback(null, false)
							});
						}
					});
				}
			});
		}
	});
};

var add = function(username, password, email, callback){

	checkForDuplicates(username, email, function(err, inUse){

	
		if (!inUse){
			bcrypt.hash(password, 10).then(function(hash, err){
				newUser = TempUser({
					username: username,
					email: email,
					password: hash,
					URL: randomstring.generate(20),
					status: "OK"
				});

				newUser.save(function(err, results){
			
				
					/*sendmail({
					    from: 'ubuntu@brobicheaucse356',
					    to: 'nexijifot@88clean.pro',
					    subject: 'test sendmail',
					    html: 'Mail of test sendmail ',
					  }, function(err, reply) {
					  	if(err)
					  		console.log("THERE WAS AN ERROR IN SENDIN MAIL");
					  	else console.log("SUCCESSFULLY SENT MIAL");
					    console.log(err && err.stack);
					    console.dir(reply);
					});*/

					response ={
						"status":"OK"
					}
					console.log(results);
					callback(null, response);
				});
			});
		}
		else {
			response = {
				"status":"error"
			};
			callback(err, response);
		}
	});
};


var verify = function(email, key, callback) {

	TempUser.findOne({'email':email}).exec(function(err, user){
		console.log(email);

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

			User.remove(user, function(err, res){
				if(err)
					console.log(err);
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
					callback(null, response)

				}

			});

		}		
	});
}

module.exports = {add, verify}