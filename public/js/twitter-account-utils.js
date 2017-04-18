var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");
var Follow = require("../../models/followModel.js")
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



/*		USING ACTUAL DATABASE
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
			});*/

var checkForDuplicates = function(username, email, callback){


	memcached.get(username+'t', function(err, data){
		if(typeof data === 'undefined'){
			memcached.get(email+'t', function(err, data){
				if(typeof data === 'undefined'){
					memcached.get(username+'p', function(err, data){
						if(typeof data === 'undefined'){
							memcached.get(email+'p', function(err, data){
								if(typeof data === 'undefined'){
									callback(null, false)
								}
							})

						}
					});
				}
			});
		}
	});
	callback("Email or username already in use", true);

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

					memcached.set(username+'t', 20000, function(err){});
					memcached.set(email+'t', 20000, function(err){});


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
					memcached.set(username+'p', 20000, function(err){});
					memcached.set(email+'p', 20000, function(err){});
					callback(null, response)

				}

			});

		}		
	});
}

module.exports = {add, verify}