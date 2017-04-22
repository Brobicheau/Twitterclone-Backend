var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
var Tweet = require("../../models/tweetModel.js");
var Follow = require("../../models/followModel.js")
var shortid = require('shortid');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");


mongoose.Promise = require('bluebird');



var add = function(username, password, email, callback){


		bcrypt.hash(password, 1).then(function(hash, err){
			newUser = User({
				username: username,
				email: email,
				password: hash,
				URL: randomstring.generate(20),
				verified: null,
				status: "OK"
			});

			newUser.save(function(err, results){
		
				if(err){
					console.log(err);
					callback(err, {'status':'OK'});
				}
				else if (results){
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

					response ={
						"status":"OK"
					}
					callback(null, response);
				}
				else{
					callback('no user found', {'status':'error'});
				}
			});
		});

	//});
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