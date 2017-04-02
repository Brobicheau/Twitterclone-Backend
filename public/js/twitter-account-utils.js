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

	var finishCount = 0;
	var value = false;

	console.log(username);
	console.log(email);

	TempUser.findOne({"username":username}).lean().exec(function(err ,exsistingTempUser){
		console.log("checked username");
		console.log(err);
		if(exsistingTempUser){
			value = true;
		}
		finishCount++;
		if(finishCount >= 4){
							console.log("sending callback1");

			if(value)
				callback("Username or password in use", value);
			else
				callback(null, value);
		}	})


	TempUser.findOne({"email":email}).lean().exec(function(err ,exsistingTempUser){

		if(exsistingTempUser){
			value = true;
		}
		finishCount++;
		if(finishCount >= 4){
			console.log("sending callback2");

			if(value)
				callback("Username or password in use", value);
			else
				callback(null, value);
		}	})	


	User.findOne({"username":username}).lean().exec(function(err ,exsistingUser){
		console.log("sending callback3");
		console.log("exsistingUser");
		if (exsistingUser){
			value = true;
		}
		finishCount++;
		if(finishCount >= 4){
			if(value)
				callback("Username or password in use", value);
			else
				callback(null, value);
		}
	})

	User.findOne({"email":email}).lean().exec(function(err ,exsistingUser){
		console.log("sending callback3");
		console.log("exsistingUser");
		if (exsistingUser){
			value = true;
		}
		finishCount++;
		if(finishCount >= 4){
			if(value)
				callback("Username or password in use", value);
			else
				callback(null, value);
		}
	})	
};

var add = function(username, password, email, callback){

	checkForDuplicates(username, email, function(err, inUse){

		console.log("checked for dups");
	
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
					console.log(results);
					response = {
						"status" : "OK"
					}
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

					reponse ={
						"status":"OK"
					}

					callback(null, reponse);
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

	TempUser.findOne({'email':email}).lean().exec(function(err, user){

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
					callback(null, response)

				}

			});

		}		
	});
}

module.exports = {add, verify}