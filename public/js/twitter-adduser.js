var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");

mongoose.Promise = require('bluebird');

var checkForDuplicates = function(username, email, callback){

	var finishCount = 0;
	var value = false;

	console.log(username);
	console.log(email);

	TempUser.findOne({"username":username}, function(err, exsistingTempUser){
		if(exsistingTempUser){
			value = true;
		}
		finishCount++;
		if(finishCount >= 4){
			if(value)
				callback("Username or password in use", value);
			else
				callback(null, value);
		}	})


	TempUser.findOne({"email":email}, function(err, exsistingTempUser){

		if(exsistingTempUser){
			value = true;
		}
		finishCount++;
		if(finishCount >= 4){
			if(value)
				callback("Username or password in use", value);
			else
				callback(null, value);
		}	})	


	User.findOne({"username":username}, function(err ,exsistingUser){

		console.log(exsistingUser);
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
	
		if (!inUse){
			bcrypt.hash(req.body.password, 10).then(function(hash, err){
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

					sendmail({
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
					});

					callback(null, reponse);
					res.send(response);
				});
			});
		}
		else {
			response = {
				"status":"error"
			};
			callback(err, response);
			res.send(response);
		}
	});
};

module.exports = {add}