var mongoose = require("mongoose");
var bcrypt = require('bcrypt');
var User = require('../../models/userModel.js');
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



var add = function(username, password, email, callback){

	var time = process.hrtime();

//	checkForDuplicates(username, email, function(err, inUse){
	var diff = process.hrtime(time);
	console.log(`Hash time: ${(diff[0] * 1e9 + diff[1])/1e9}`);

		bcrypt.hash(password, 1).then(function(hash, err){
			newUser = User({
				username: username,
				email: email,
				password: hash,
				URL: randomstring.generate(20),
				verified: null,
				status: "OK"
			});
			console.log(newUser);

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
				callback(null, response);
			});
		});

	//});
};


var verify = function(email, key, callback) {

	if (key === "abracadabra"){

		User.findOne({'email':email}, function(err, user){

			if(err){
				console.log(err);
				callback(null,{'status':'OK'})
			}else{
				user.verified = "verified";
				user.URL = null;
				user.save();
				callback(null,{'status':'OK'})
			}

		});

	}
}

module.exports = {add, verify}