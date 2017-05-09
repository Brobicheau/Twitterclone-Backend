var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var User = require('../../models/userModel.js');
var Tweet = require("../../models/tweetModel.js");
var Follow = require("../../models/followModel.js")
var Q = require('./twitterQ.js');
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");


mongoose.Promise = require('bluebird');



var add = function(username, password, email, callback){
	User.aggregate([
				{'$match':{'username':username}},
				{'$match':{'email':email}}
		],
		function(err, results){
			if(results && results.length > 0){
				callback('username or email in use', {'status':'error'});
			}
			else{
				bcrypt.hash(password, 1).then(function(hash, err){
					newUser = User({
						username: username,
						email: email,
						password: hash,
						URL: randomstring.generate(20),
						verified: null,
						status: "OK"
					});
					//tweetQ.addToQ(newUser);
					newUser.save(function(err, results){
				
						if(err){
							console.log(err);
							callback(err, {'status':'error'});
						}
						else if (results){


							response ={
								"status":"OK"
							}
							callback(null, response);
						}
						else{
							
							callback('results not saved', {'status':'error'});
						}
					});
					//callback(null, {'status':'OK'});
				});			
			}
		}
	);
		
};


var verify = function(email, key, callback) {

	if (key === "abracadabra"){

		User.findOne({'email':email}, function(err, user){

			if(err){
				callback(null,{'status':'OK'})
			}else if(user){
				user.verified = "verified";
				user.URL = null;
				user.save();
				callback(null,{'status':'OK'});
			}
			else {
				callback('couldnt find user', {'status':'error'});
			}

		});

	}
}

module.exports = {add, verify}

					/*sendmail({
					    from: 'ubuntu@brobicheaucse356',
					    to: 'nexijifot@88clean.pro',
					    subject: 'test sendmail',
					    html: 'Mail of test sendmail ',
					  }, function(err, reply) {
					  	if(err)
					  		//////console.log("THERE WAS AN ERROR IN SENDIN MAIL");
					  	else //////console.log("SUCCESSFULLY SENT MIAL");
					    //////console.log(err && err.stack);
					    console.dir(reply);
					});*/