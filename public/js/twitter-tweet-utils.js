var parser = require('body-parser');//forparsing req params, will change to multer
var mongoose = require("mongoose");
var path = require ("path");
var bcrypt = require('bcrypt');
var shortid = require('shortid');
var cookieSession = require('cookie-session');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");

/*My libraries*/
var User = require('../../models/userModel.js');
var Tweet = require("../../models/tweetModel.js");
var Likes = require('../../models/likeModel.js');

var add = function(params, callback){
	var currentUser = params.currentUser;
	var parent = params.parent;
	var content = params.content;
	var media = params.media;
	//make sure there is a used logged in before we make the tweet
	if(typeof currentUser !== 'undefined'){


		//check if the optional parent param was given
		//Get the content of the new tweet

		//make a new unique ID for the tweet
		var id = shortid.generate();


		//create the tweet schema object for storing in mongodb
		newTweet = Tweet({
			"id": id,
			"username": currentUser,
			"parent": parent,
			"timestamp": Math.floor(new Date() / 1000),
			"content": content,
			"media":media
		});

		var time = process.hrtime();
		//save the sweet to the mongo database
		newTweet.save(function (err, results){
			var diff = process.hrtime(time)
			if(diff[0] > 3)
				console.log(`item save: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			//if there was an Error
			if(err){
				//print out the error(and send back correct response)
				////////console.log(err);
				response = {
					"status" : "error"
				}
				//callback(err, response);
			}
			else{


			//else lettuce know there was a success
			var	response = {
					"id": id,
					"status" : "OK"
				};
				callback(null, response)		 
			}
		});



	}//end if
	else{
		//telll em no user is logged in.
		var response  ={
			"status":"error",
			"error":"no user logged in"
		};
		callback("error: no user logged in", response);
	}
}


var getItemById = function(search_id, callback){

	Tweet.aggregate([
			{$match:{'id':search_id}},
			{'$project':{'parent':1, 'username':1,'id':1, 'timestamp':1, 'content':1, 'media':1, '_id':0}},

		], function(err, tweets){
			if(tweets){
				if(tweets.length > 0){
					var tweet = tweets[0]
					var response = {
						'item': tweet,
						'status':'OK'
					}
					callback(null,response );
				}
				else {
					callback('no tweet found', {'status':'error'});
				}
			}else{
				callback('couldnt find tweet', {'status':'error'});
			}

		}
	)

	/*if(typeof search_id !== 'undefined'){
		Tweet.findOne({"id": search_id}, function(err, tweet){

			if(err){
				callback(err, {"status":"error"})
			}
			else if(tweet){	
				var response = {
					"status": "OK",
					item: {
						"id": tweet.id,
						"username": tweet.username,
						"content": tweet.content,
						"timestamp": tweet.content,
						"parent":tweet.parent,
						"media": tweet.media
					}
				};
				//////////console.log("SENDING BACK TWEET");
				callback(null, response)
			}
			else {
				//////////console.log("Couldnt find tweet");
				callback("Error: couldnt find tweet", {"status":"error", 'error':'no tweet'});
			}
		});
	}
	else {
		callback("invalid search ID",{"status":"error"});
	}*/
}

//THIS IS WHERE I SHIT AGAIN - JAYBIRD
var search = function(params, callback) {	


	var limit = params.limit;
	var timestamp = params.timestamp;
	var following = params.following;
	var username = params.username;
	var rank = params.rank;
	var parent = params.parent;
	var q = params.q;
	var currentUser = params.currentUser;

	if(rank){
		sort = -1
	}
	else {
		sort = 1
	}

	if(following){
			var agg = Tweet.aggregate([
				{ $lookup: 
					{
						from:'following_datas',
						localField:'username',						
						foreignField:'username',
						as:"follow"
					}
				},
				{'$redact': {
					'$cond': {
						'if':{ '$in' :[ currentUser, "$follow" ]},
						'then':'$$KEEP',
						'else':'$$PRUNE'
					}
				}},			
			{'$project':{'parent':1, 'username':1,'id':1, 'timestamp':1, 'content':1, 'media':1, '_id':0}},
			{'$limit': limit},
			{'$sort': {'timestamp':sort}}

		]);
	}
	else if(typeof q !== 'undefined')
	{
		var agg = Tweet.aggregate([
			
				{'$match':{'$text':{'$search':q} } },
				{'$project':{'parent':1, 'username':1,'id':1, 'timestamp':1, 'content':1, 'media':1, '_id':0}},
				{'$limit': limit},
				{'$sort': {'timestamp':sort}}
					]);
	}
	else if (typeof username !== 'undefined')
		var agg = Tweet.aggregate([
			
			{'$match':{'username':username} },
			{'$project':{'parent':1, 'username':1,'id':1, 'timestamp':1, 'content':1, 'media':1, '_id':0}},
			{'$limit': limit},
			{'$sort': {'timestamp':sort}}
			
		]);
	else {
		var agg = Tweet.aggregate([
			/*{ '$match':
				 { 
				 	//'$text': { $search: q },
				 	'timestamp':{'$lte':timestamp} 
				 }
			},*/	
			{'$project':{'parent':1, 'username':1,'id':1, 'timestamp':1, 'content':1, 'media':1, '_id':0}},
			{'$limit': limit},
			{'$sort': {'timestamp':sort}}

		]);
	}

	agg.exec(function(err, data){


		var response = {
			'items': data,
			'status':'OK'
		};
		callback(null,response);
	})


}




var like = function(params, callback){
	var id = params.id;
	var like = params.like;
	var currentUser = params.currentUser;

	newLike = Likes({
		'tweet_id':id,
		'username':currentUser
	});
	newLike.save(function(err, result){
		if(err){
			////////console.log(err);
			callback(err, {'status':'error'});
		}
		else {
			response = {
				'status':'OK'
			};
			callback(err, response);
		}

	});
}


module.exports = {add, getItemById, search, like}