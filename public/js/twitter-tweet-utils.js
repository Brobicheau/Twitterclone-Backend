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


		//save the sweet to the mongo database
		newTweet.save(function (err, results){

			//if there was an error
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

	if(typeof search_id !== 'undefined'){
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
	}
}

var buildQuery = function(params, callback){

	// var limit = params.limit;
	// var timestamp = params.timestamp;
	// var following = params.following;
	// var username = params.username;
	// var rank = params.rank;
	// var parent = params.parent;
	// var query = params.query;
	// var q = params.q;

	// var queryArray = {};

	// // if(typeof query !== 'undefined'){
	// // 	queryArray["content"] = query  ;
	// // }
	// // if(typeof timestamp !== 'undefined'){
	// // 	////////console.log("TIMESTAMP");
	// // 	////////console.log(timestamp);
	// // 	queryArray["timestamp"] = timestamp;
	// // }else{
	// // 	queryArray["timestamp"] = Math.floor(new Date() / 1000);
	// // }
	// if(typeof username !== 'undefined'){
	// 	queryArray["username"] = username;
	// }
	// if(typeof query !== 'undefined'){
	// 	queryArray["query"] = query;
	// }
	// // if(typeof following !== 'undefined'){
	// // 	queryArray["following"] = true;//default
	// // }else{
	// 	if (following !== false){
	// 	queryArray["following"] = following;//user chosen
	// 	}
	// // }
	// callback(null, queryArray);

	var limit = params.limit;
	var timestamp = params.timestamp;
	var following = params.following;
	var username = params.username;
	var rank = params.rank;
	var parent = params.parent;
	var query = params.query;
	var q = params.q;
	var replies = params.replies;

	var queryArray = {};
	if(typeof username !== 'undefined'){
		queryArray["username"] = username;
	}
	if(typeof query !== 'undefined'){
		queryArray["query"] = query;

	}
	if (following !== false){
		queryArray["following"] = following;//user chosen
	}
	if (typeof parent !== 'undefined'){
		queryArray['parent'] = parent;
	}
	callback(null, queryArray);

}

var sortFiller = function(filler,sortBy, callback){


}




var sortTweets = function(data, rank, timestamp, callback){

	//	////////console.log("=-------------------------DATA")
	var filler = new Array(data.length);
	var i = 0;
	//filler = [{id,username,content,timestamp,rating},{id,username,content,timestamp,rating},{id,username,content,timestamp,rating}..]
	while(i < data.length){
//		////////console.log('-------------------looop');(

		Likes.count({"tweet_id":data[i].id}, function(err, likeCount){
			//	//console.log("\n\n\n\n DISPLAYING DATA");
			//	//console.log(data[currentCount]);
			//console.log("currentCount" + i);
			Tweet.count({"parent":data[i].id},function(err,parentCount){
				filler[i] = {
					"id": data[i].id,
					"username": data[i].username,
					"content": data[i].content,
					"timestamp": data[i].timestamp,
					"rating": ((likeCount + (parentCount*10))*100000)/((Math.floor(new Date()/1000)) - data[i].timestamp)
				}
				i++;
				if(i === data.length-1){	

					if (rank === 'undefined' || rank === 'time'){
						data.sort(function(a,b){
							callback(null, b.timestamp - a.timestamp);
						});

					}
					else{
						data.sort(function(a,b){
							callback(null, b.rating - a.timestamp);
						});
					}
				}
			});
		});
	}
}

//THIS IS WHERE I SHIT AGAIN - JAYBIRD
var search = function(params, callback) {	

	var limit = params.limit;
	var timestamp = params.timestamp;
	var rank = params.rank;
	if(typeof limit === 'undefined'){//setting the limit
		limit = 25;
	}else{
		limit = params.limit;
	}
	if(typeof timestamp === 'undefined'){//Setting the time stamp
		timestamp = Math.floor(new Date()/1000);
	}else{
		timestamp = params.timestamp;
	}

	buildQuery(params, function(err, query){
		Tweet.find(query).where('timestamp').lte(timestamp).sort({'timestamp':-1}).limit(limit).lean().exec(function(err, data){
			if(err){
				response = {
					"status": "error",
					"error": err
				};
				callback(err, response)
			}
			else if (data){

/*				sortTweets(data, rank, timestamp, function(err, filler){
					var response = {
						items: filler ,
						"status":"OK"
					}			
					callback(null, response);
				});*/

					if (rank === 'undefined' || rank === 'time'){


						var response = {
							items: data,
							'status':'OK'
						}
						callback(null, response);

					}
					else{
						var response = {
							items: data,
							'status':'OK'
						}

						callback(null, response);
					}

			}
			else{
				callback('no items found', {'status':'OK'});
			}

		});
	});

}

//THIS IS WHERE JAYBIRD STOPS SHITTING


//THIS CODE BELONGS TO NEANDERTHAL
// var search = function(params, callback) {	

// 	var limit = params.limit;
// 	var timestamp = params.timestamp;
// 	if(typeof limit === 'undefined'){//setting the limit
// 		limit = 25;
// 	}else{
// 		limit = params.limit;
// 	}
// 	if(typeof timestamp === 'undefined'){//Setting the time stamp
// 		timestamp = Math.floor(new Date()/1000);
// 	}else{
// 		timestamp = params.timestamp;
// 	}

// 	buildQuery(params, function(err, query){

// 		if(query!=={}){
// 			Tweet.find(query).where('timestamp').lte(timestamp).limit(limit).lean().exec(function(err, data){
// 				if(err){
// 					response = {
// 						"status": "error",
// 						"error": err
// 					};
// 					callback(err, response)
// 				}
// 				else{
// 					var filler = new Array(data.length);

// 		//			////////console.log("---------data.length--------"+data.length);
// 					//////////console.log(data);
// 					for( i = 0; i < data.length; i++){
// 						filler[i] = {
// 							"id": data[i].id,
// 							"username": data[i].username,
// 							"content": data[i].content,
// 							"timestamp": data[i].timestamp
// 						};
// 					}
// 				//	////////console.log("----QUERY----- " + query);
// 				//	////////console.log("-----PARAMS-----" + params);
// 					var response = {
// 						items: filler ,
// 						"status":"OK"
// 					}			
// 					callback(null, response);
// 				}

// 			});
// 		}else{
// 			Tweet.find(query).where('timestamp').lte(timestamp).limit(limit).lean().exec(function(err, data){
// 				if(err){
// 					response = {
// 						"status": "error",
// 						"error": err
// 					};
// 					callback(err, response)
// 				}
// 				else{
// 					var filler = new Array(data.length);

// 				//	////////console.log("---------data.length--------"+data.length);
// 				//	////////console.log(data);
// 					for( i = 0; i < data.length; i++){
// 						filler[i] = {
// 							"id": data[i].id,
// 							"username": data[i].username,
// 							"content": data[i].content,
// 							"timestamp": data[i].timestamp
// 						};
// 					}
// 				//	////////console.log("----QUERY----- " + query);
// 				//	////////console.log("-----PARAMS-----" + params);
// 					var response = {
// 						items: filler ,
// 						"status":"OK"
// 					}			
// 					callback(null, response);
// 				}

// 			});

// 		}
// 	});
// }


//THIS CODE BELONGS TO NEANDERTHALIC CODE ENDS HERE


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