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
var TempUser = require("../../models/userTempModel.js");
var Tweet = require("../../models/tweetModel.js");

var add = function(currentUser, parent, content, callback){
	//make sure there is a used logged in before we make the tweet
	if(typeof currentUser !== 'undefined'){


		//check if the optional parent param was given
		if(!(typeof parent !== "undefined")){
			 parent = "null"

		}

		//Get the content of the new tweet

		//make a new unique ID for the tweet
		var id = shortid.generate();

		//create the tweet schema object for storing in mongodb
		newTweet = Tweet({
			"id": id,
			"username": currentUser,
			"parent": null,
			"timestamp": Math.floor(new Date() / 1000),
			"content": content,
			"likes": []
		});

		//save the sweet to the mongo database
		newTweet.save(function (err, results){

			//if there was an error
			if(err){
				//print out the error(and send back correct response)
				console.log(err);
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
		//console.log("searching");
		Tweet.findOne({"id": search_id}).lean().exec(function(err, tweet){

			//console.log("found something  probably");

			if(err){
				console.log(err);
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
						"likes": tweet.likes
					}
				};
				//console.log("SENDING BACK TWEET");
				callback(null, response)
			}
			else {
				//console.log("Couldnt find tweet");
				callback("Error: couldnt find tweet", {"status":"error"});
			}
		});
	}
	else {
		callback("invalid search ID",{"status":"error"});
	}
}

var buildQuery = function(params, callback){

	var limit = params.limit;
	var timestamp = params.timestamp;
	var following = params.following;
	var username = params.username;
	var rank = params.rank;
	var parent = params.parent;
	var query = params.query;
	var q = params.q;

	var queryArray = {};

	// if(typeof query !== 'undefined'){
	// 	queryArray["content"] = query  ;
	// }
	// if(typeof timestamp !== 'undefined'){
	// 	console.log("TIMESTAMP");
	// 	console.log(timestamp);
	// 	queryArray["timestamp"] = timestamp;
	// }else{
	// 	queryArray["timestamp"] = Math.floor(new Date() / 1000);
	// }
	if(typeof username !== 'undefined'){
		queryArray["username"] = username;
	}
	if(typeof query !== 'undefined'){
		queryArray["query"] = query;
	}
	// if(typeof following !== 'undefined'){
	// 	queryArray["following"] = true;//default
	// }else{
		if (following !== false){
		queryArray["following"] = following;//user chosen
		}
	// }
	callback(null, queryArray);

}

var search = function(params, callback) {	

	var limit = params.limit;
	var timestamp = params.timestamp;
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
	// var timestamp = params.timestamp;
	// console.log("------------LIMIT-----------" + limit);


	//THIS IS WHERE I SHIT
	// Tweet.find({ "timestamp": {$lte: params.timestamp} }).limit(limit).lean().exec(function(err, data){

	// 	console.log("---------FOUND IN SEARCH if(q !=={}) --------------");

	// 	if(err){
	// 		response = {
	// 			"status": "error",
	// 			"error": err
	// 		};
	// 		callback(err, response)
	// 	}
	// 	else {
	// 		console.log("-------------TESTING----------------")

	// 		var filler = new Array(data.length) ;

	// 		console.log("---------data.length--------"+data.length);
	// 		console.log(data);
	// 		for( i = 0; i < data.length; i++){
	// 			filler[i] = {
	// 				"id": data[i].id,
	// 				"username": data[i].username,
	// 				"content": data[i].content,
	// 				"timestamp": data[i].timestamp
	// 			};
	// 		}
	// 		// console.log("----QUERY----- " + query);
	// 		console.log("-----PARAMS-----" + params);
	// 		var response = {
	// 			items: filler ,
	// 			"status":"OK"
	// 		}			
	// 		callback(null, response);
	// 	}

	// });	
	//SHIT ENDS HERE



	buildQuery(params, function(err, query){
		// console.log("------query search-------"+query.username + " ---- " + username.following + " ------ " + username.q+" ------- ");
		// console.log()

	//	console.log("------query search------- limit ------" + limit);
	//	console.log("------query search------- query ------ %j",query);
	//	console.log("------query search------- timestamp ------ %j",timestamp);
		if(query!=={}){
			Tweet.find(query).where('timestamp').lte(timestamp).limit(limit).lean().exec(function(err, data){
				if(err){
					response = {
						"status": "error",
						"error": err
					};
					callback(err, response)
				}
				else{
					var filler = new Array(data.length);

		//			console.log("---------data.length--------"+data.length);
					//console.log(data);
					for( i = 0; i < data.length; i++){
						filler[i] = {
							"id": data[i].id,
							"username": data[i].username,
							"content": data[i].content,
							"timestamp": data[i].timestamp
						};
					}
				//	console.log("----QUERY----- " + query);
				//	console.log("-----PARAMS-----" + params);
					var response = {
						items: filler ,
						"status":"OK"
					}			
					callback(null, response);
				}

			});
		}else{
			Tweet.find(query).where('timestamp').lte(timestamp).limit(limit).lean().exec(function(err, data){
				if(err){
					response = {
						"status": "error",
						"error": err
					};
					callback(err, response)
				}
				else{
					var filler = new Array(data.length);

				//	console.log("---------data.length--------"+data.length);
				//	console.log(data);
					for( i = 0; i < data.length; i++){
						filler[i] = {
							"id": data[i].id,
							"username": data[i].username,
							"content": data[i].content,
							"timestamp": data[i].timestamp
						};
					}
				//	console.log("----QUERY----- " + query);
				//	console.log("-----PARAMS-----" + params);
					var response = {
						items: filler ,
						"status":"OK"
					}			
					callback(null, response);
				}

			});

		}
	});
	// 	if(q !=={}){
	// 		console.log("---------q--------" + q);
	// 		Tweet.find(query).limit(limit).lean().exec(function(err, data){

	// 			console.log("---------FOUND IN SEARCH if(query !=={}) --------------");

	// 			if(err){
	// 				response = {
	// 					"status": "error",
	// 					"error": err
	// 				};
	// 				callback(err, response)
	// 			}
	// 			else {
	// 				console.log("-------------TESTING----------------")

	// 				var filler = new Array(data.length) ;

	// 				console.log("---------data.length--------"+data.length);
	// 				console.log(data);
	// 				for( i = 0; i < data.length; i++){
	// 					filler[i] = {
	// 						"id": data[i].id,
	// 						"username": data[i].username,
	// 						"content": data[i].content,
	// 						"timestamp": data[i].timestamp
	// 					};
	// 				}
	// 				console.log("----QUERY----- " + query);
	// 				console.log("-----PARAMS-----" + params);
	// 				var response = {
	// 					items: filler ,
	// 					"status":"OK"
	// 				}			
	// 				callback(null, response);
	// 			}

	// 		});			
	// 	}

	// 	else {
	// 	Tweet.find(query).limit(limit).lean().exec(function(err, data){

	// 		console.log("-------FOUND IN SEARCH (else)---------------");

	// 		if(err){
	// 			response = {
	// 				"status": "error",
	// 				"error": err
	// 			};
	// 			callback(err, response)
	// 		}
	// 		else {
	// 			var filler = new Array(data.length) ;

	// 			console.log("----------data------------"+data);
	// 			for( i = 0; i < data.length; i++){
	// 				filler[i] = {
	// 					"id": data[i].id,
	// 					"username": data[i].username,
	// 					"content": data[i].content,
	// 					"timestamp": data[i].timestamp
	// 				};
	// 			}
	// 			console.log(filler);

	// 			var response = {
	// 				"query":params,
	// 				items: filler ,
	// 				"status":"OK"
	// 			}			
	// 			callback(null, response);
	// 		}
	// 	});
	// }

}


var like = function(params, callback){
	var id = params.id;
	var like = params.like;
	var currentUser = params.currentUser;

	tweet.findOne({"id":id}, function(err, tweet){
		if(err){
			callback(err, {"status":"error"});
		}
		if(typeof tweet !== "undefined")
			if(like){
				tweet.likes.append(currentUser);
				callback(null,{"status":"OK"});
			}
			else{
				tweet.likes(tweet.indexof(currentUser), 1);
				callback(null, {"status":"OK"});
			}
		else {
			callback("Couldnt find tweet with that id", {"status":"error"});
		}
	})
}


module.exports = {add, getItemById, search}