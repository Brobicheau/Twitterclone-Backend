/****************************************************************
*	Notes: 
*		- ALL POST PARAMETERS ARE JSON (application/json)
*		- ALL RETURN TYPES MUST BE JSON AS WELL
*
*****************************************************************/





var express = require('express'); // EXPRESS MODULE
var parser = require('body-parser');//forparsing req params, will change to multer
var mongoose = require("mongoose");
var path = require ("path");
var bcrypt = require('bcrypt');
var shortid = require('shortid');
var cookieSession = require('cookie-session');
var sendmail = require('sendmail')();
var randomstring = require("randomstring");
var multer = require('multer');
var fs = require('fs');
var upload = multer({dest: path.join(__dirname + '/uploads/temp/')})
mongoose.Promise = require('bluebird');

/*My libraries*/
var User = require('./models/userModel.js');
var Tweet = require("./models/tweetModel.js");
var Follow = require("./models/followModel.js");
var accountUtils = require('./public/js/twitter-account-utils.js');
var loginUtils = require('./public/js/twitter-login-utils.js');
var tweetUtils = require('./public/js/twitter-tweet-utils.js');
var followUtils = require('./public/js/twitter-follow-utils.js');
var mediaUtils = require('./public/js/twitter-media-utils.js');






const util = require('util');
var app = express();

//module setup
app.use(parser.urlencoded({extended: true}));
app.use(parser.json());
app.use(cookieSession({
	name: "session",
	keys: ['key1, key2']
}))


//MAIN PAGE OF TWITTER
app.post('/', function(req, res) {
	res.send();
});

app.get('/', function(req, res){
	res.send();
})



app.get('/init', function(req, res){

	if(typeof req.session.currentUser !== 'undefined'){
		res.send({"username":req.session.currentUser, "status":"OK"});
	}
	else
		res.send();

})

/********************************************
*	/adduser description - POST: 
*	This request will register a new user account IF 
*	the username AND email are unique. It must then send
* 	email with verification key (Use nodes email-verification module)
*
*	Request Parameters
*		- username = req.body.username
*		- email = req.body.email
*		- password = req.body.password
*
*	Return:
*	-	status: "OK" or "error"
*	- error: error message(if error)
*
************************************************/		
app.post('/adduser', function(req,res){

	var time = process.hrtime();

	//get the username, password and email
	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	accountUtils.add(username, password, email, function(err, response){
		if (err){
			var diff = process.hrtime(time);
			if(diff[0] > 3)
				console.log(`adduser: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			console.log(err);
			res.send(response);
		}
		else{
			res.send(response);
		}
	})

});//end /adduser



/********************************************
*	/login description - POST: 
*	This post request will log the user into the site IF its 
*	username and password are found in the database. It will then set
*	the users cookie to enable the session. 
*
*	Request Parameters
*		- username = req.body.username
*		- password = req.body.password
*
*	Return:
*	-	status: "OK" or "error"
*	- error: error message(if error)
*
************************************************/
app.get("/login", function(req, res){

	res.end();
});
app.post("/login", function(req, res){

	var time = process.hrtime()

	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;

	loginUtils.login(username, password, email, function(err, response, cookie_id){

		if(response.status === 'error'){
			console.log(err);
			var diff = process.hrtime(time);
			res.send(response);
		}
		else {
			req.session.id = cookie_id;
			req.session.currentUser = username;
			var diff = process.hrtime(time);
			if(diff[0] > 3)
  				console.log(`login: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
  			res.status(200).json(response);
		}

	})
	
});//end /login

/********************************************
*	/logout description - POST: 
*	This will log the user out by setting its session cookie to null
*
*	Request Parameters
*		- NONE
*
*	Return:
*	-	status: "OK" or "error"
*	- error: error message(if error)
*
************************************************/
app.post('/logout', function(req,res){

	//set the cookies to null
	req.session = null;

	//tell the client everything is peachy
	res.send({status: "OK"});
});//end /logout


app.get('/verify/:URL', function(req, res){

	var url = req.params.URL;

	TempUser.findOne({URL:url}, function(err, user){

		if(user){
			verifiedUser = User({
				username: user.username,
				password: user.password,
				email: user.email,
				status: "OK"
			})

			verifiedUser.save(function(err, results){
				 res.send({"status":"OK"});
			})

		}
		else {
			res.send({"status": "error"});
		}

	})
})

/********************************************
*	/verify description - POST: 
*	This will verify users account using its email and a backdoor key
*	Users account cannot be used until it is verified.
*
*	Request Parameters
*		- email = req.body.email
		- key = req.body.key = "abracadabra" (backdoor)
*
*	Return:
*	-	status: "OK" or "error"
*	- error: error message(if error)
*
************************************************/
app.post('/verify', function(req,res){

	var time = process.hrtime()
	//grab the key and create varibales for the url and reutrn json
	var key = req.body.key;
	var email = req.body.email;

	accountUtils.verify(email, key, function(err, response) {

		if (err){
			console.log(err);
			res.send(response);
		}
		else {
			var diff = process.hrtime(time)
			if(diff[0] > 3)
				console.log(`verify: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			res.send(response)
		}

	})

});// end /verify

/********************************************
*	/additem description - POST: 
*	This will post a new tweet only if a user is found in session
*
*	Request Parameters
*		- content = req.body.content
*		- parent(STAGE 3) = req.body.parent = 
*
*	Return:
*	-	status: "OK" or "error"
	- id: uniqur tweet IF (if OK)
*	- error: error message(if error)
*
************************************************/
app.post('/additem', function(req,res){
		
	var time = process.hrtime()

	var params = {
		'currentUser': req.session.currentUser,
		'parent':req.body.parent,
		'content':req.body.content,
		'media':req.body.media
	}

	tweetUtils.add(params, function(err, response){

		if (err){
			console.log(err);
			var diff = process.hrtime(time);
			res.send(response);
		}
		else {
			var diff = process.hrtime(time);
			if(diff[0] > 3)
				console.log(`additem: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			res.send(response);
		}

	});



});//end additem


/********************************************
*	/item/<id> description - GET: 
*	Searches and returns for tweet of given ID
*
*	Request Parameters
*		- NONE
*
*	Return:
*	-	status: "OK" or "error"
*	- item: {
*		- id : tweet id
*		- username: username who sent tweet
*		- content: message body of tweet
*		- timestamp: timestamp, represeted as Unix time in seconds
*	}
*	- error: error message(if error)
*	- media(STAGE 3): ID of asssociated media file(if any)
*
************************************************/
app.get('/item/:id', function(req,res){

	var time = process.hrtime();

	//get the id of the tweet to search for
	var search_id = req.params.id;
 

	tweetUtils.getItemById(search_id, function(err, response){

		if(err){
			console.log(err);
			var diff = process.hrtime(time);
			if(diff[0] > 3)
				console.log(`itemsearch: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);			
			res.send(response);
		}
		else{
			var diff = process.hrtime(time)
			if(diff[0] > 3)
				console.log(`itemsearch: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			res.send(response);
		}
	});



});

/********************************************
*	/item/<id> description - DELETE (STAGE 2): 
*	Deletes tweet of given ID, also deletes associated media
*
*	Request Parameters
*		- NONE
*
*	Return:
*	- success or failure
*
************************************************/
app.delete('/item/:id', function(req,res){

/******************************************************************
*
*							JAY 
*
*******************************************************************/

	var time = process.hrtime();
	//Pull id from request ( req.params.id)
	var delete_id = req.params.id;

	//find the item to remove via Tweet.find(id).remove(callback)
	if(typeof delete_id !== 'undefined'){
		Tweet.findOne({"id": delete_id}).lean().exec(function(err, tweet){
			if(err){
				console.log(err);
				res.status(400).send({"status":"error"});
			}
			else if(tweet){	
				if(tweet.media.length > 0){
					mediaUtils.deleteMedia(tweet.media, function(err,response){

						Tweet.remove({'id':delete_id}, function(err){
							if(err){
								console.log(err);
							}
							var diff = process.hrtime(time);
							if(diff[0] > 3)
								console.log(`delete: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
							res.status(200).send({"status":"OK"});

						});

					})
				}
				else {
					Tweet.remove({'id':delete_id}, function(err){
						if(err){
							console.log(err);
						}
						res.status(200).send({"status":"OK"});

					});
				}
			}
			else
			{	
				var response = {
					'status':'error'
				}
				res.send(response);
			}
		});
	}else{
		res.status(404).send({"status":"error"});
	}

});


/********************************************
*	/search description - POST : 
*	Gets list of all tweets(Expand description later)
*
*	Request Parameters
*		- timestamp: search tweets from this time and earlier
*			- Represented as Unix time in seconds
*			- Integer, optional
*			- Default: Current time
*		- limit: number of tweets to return
*			- Integerr, option
*			- Default: 25
*			- Max: 100
*		(STAGE 2 REQUEST PARAMS)
*			- q: search query
*			- username: username
*				- String optional
*				- Filter by username
*			- following: only show tweets made by users that logged in user follows
*				- Booklean, optional
*				- Default: true
*		(STAGE 3 PARAMS)
*			- rank: Orfer returned tweets by 'time' or by "interest" (weighting itme vs number of likes and retweets)
*				- String optional
*				- Default: true
*			- parent: Returns tweets made in reply to requested tweet
*				- Boolean, optional
*				- Default: false
*	Return:
*	- status: "OK" or "error"
*	- items: Array of tweet objects (see/item/:id)
*	- error: error message (if error)
*
************************************************/
app.post('/search', function(req,res){
	var time = process.hrtime();

	params =
	 {
		"q":req.body.q,
		"timestamp": req.body.timestamp,
		"limit":req.body.limit,
		"username":req.body.username,
		"following":req.body.following,
		"rank": req.body.rank,
		"parent": req.body.parent
	};

	tweetUtils.search(params, function(err, response){

		if(err){
			console.log(err);
			process.hrtime(time);
			res.send(response);
		}
		else {
	//		console.log('out of search')
			var diff = process.hrtime(time);
			if(diff[0] > 3)
				console.log(`search: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			res.send(response);
		}
	})
});

/********************************************
*	/user/<username> description - GET (STAGE 2): 
*	Gets the users profile information
*
*	Request Parameters
*		- username: username to retrieve = req.body.username
*
*	Return:
*	- status: "OK" or "error"
*	- user: {
*		- email: 
*		- followers: follower count
*		- following: following count
*	}
*
************************************************/


app.get('/user/:username', function(req,res){

/******************************************************************
*
*							JAY (USER twitter-item-utils.js)
*
*******************************************************************/	
	var time = process.hrtime();
	//pull username from params via req.params.username
	//pull username from params via req.params.username
	var username = req.params.username;

	//Search for account with correct username via Users.findOne(username, function(err, user))
	if(typeof username !== 'undefined'){//if user is not null
		User.findOne({"username":username},function(err,user){//checks if user is found
			var diff = process.hrtime(time);
			console.log(`user ; first query: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
			if(err){
				console.log(err);
				res.send({"status":"error1"});//sends error status
			}
			else if(user){
				Follow.count({"following":username}, function(err2, followerCount){
					if(err2){console.log(err2);
						res.send({"status":"error2"});
					}
					else {
						Follow.count({"username":username}, function(err3, followingCount){
							if(err3){console.log(err3);
								res.send({"status":"error3"});
							}
							else {
								var responseUser = {//All user data is stored in here
									"email": user.email,
									"followers": followerCount,
									"following": followingCount
								}
								var finalResponse = {//building the final response JSON object
									"status":"OK",
									"user": responseUser
								}
								var diff = process.hrtime(time);
								if(diff[0] > 3)
									console.log(`user info: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
								res.status(200).send(finalResponse);							}
						});
					}
				})
			}else{
				res.send({"status":"error6", 'err':'user not found'});
			}
		});
	}
	else{
		res.status(400).send({"status":"error4"});
	}
});


/******************************************************************
*	/user/<username>/followers description - GET (STAGE 2): 
*	Gets list of users following "username"
*
*	Request Parameters
*		- limit: number of usernames to return = req.body.username
*			- Integer, optional
*			- Default: 50
*			- Max: 200
*
*	Return:
*	- status: "OK" or "error"
*	- users: list of usernames (strings) 
*
*******************************************************************/
app.get('/user/:username/followers', function(req,res){


	/******************************************************************
	*
	*							VINNY = (use twitter-follow-utils)
	*
	*******************************************************************/

	var params = {
		"limit": req.params.limit,
		"username": req.params.username
	};
	followUtils.followers(params, function(err, response){

		if(err){
			res.send(response);
		}
		else{
			res.send(response);
		}
	})
});


/******************************************************************
*	/user/<username>/following description - GET (STAGE 2): 
*	Gets list of users "username" is following
*
*	Request Parameters
*		- limit: number of usernames to return = req.body.username
*			- Integer, optional
*			- Default: 50
*			- Max: 200
*
*	Return:
*	- status: "OK" or "error"
*	- users: list of usernames (strings) 
*
*******************************************************************/
app.get('/user/:username/following', function(req,res){

/******************************************************************
*
*							VINNY = (use twitter-follow-utils)
*
*******************************************************************/
	var params = {
		"limit": req.params.limit,
		"username": req.params.username
	};
	followUtils.following(params, function(err, response){

		if(err){
			res.send(response);
		}
		else{
			res.send(response);
		}
	})

});


/******************************************************************
*	/follow description - POST (STAGE 2): 
*	Followsor unfollows a user
*
*	Request Parameters
*		- username: username to follow = req.body.username
*		- follow: = req.body.follow
*			- Boolean
*			- Default: true
*
*	Return:
*	- status: "OK" or "error"
*
*******************************************************************/
app.post('/follow', function(req,res){


/******************************************************************
*
*							VINNY = (use twitter-follow-utils)
*
*******************************************************************/	

	var params = {
		"username":req.body.username,
		"follow": req.body.follow,
		"currentUser":req.session.currentUser
	};
	if(req.body.follow){
		followUtils.follow(params, function(err, response){

			if(err){
				//////////console.log(err);
				res.send(response);
			}
			else{
				res.send(response);
			}
		})
	}
	else {
		followUtils.unFollow(params, function(err, response){

			if(err){
			//	////////console.log(err);
				res.send(response);
			}
			else{
				res.send(response);
			}
		})
	}



});


/******************************************************************
*	/item/<id>/like description - POST (STAGE 3): 
*	Likes or unlikes a tweet ID
*
*	Request Parameters
*		- like: = req.body.like
*			- Boolean
*			- Default: true
*
*	Return:
*	- status: "OK" or "error"
*
*******************************************************************/
app.post('/item/:id/like', function(req,res){

	var id = req.params.id;
	var like = req.body.like;
	var currentUser = req.session.currentUser;

	var params = {
		"id": id,
		"like":like,
		"currentUser":currentUser
	}
	tweetUtils.like(params, function(err, response){
		if(err){
			//////////console.log(err);
			res.status(400).send(response);
		}
		else {
			res.status(200).send(response);
		}
	})
});


/******************************************************************
*	/addmedia description - POST (STAGE 3): 
*	adds media file (photo or video)
*
*	Request Parameters (type is multipart/form-data (gotta use multer module))
*		- content: binary content of ile being uploaded = req.file.content
*
*	Return:
*	- status: "OK" or "error"
*	- id: ID of uploaded media
*	- error: error message (if error)
*
*******************************************************************/
app.post('/addmedia',  upload.single('content'), function(req,res){
	var time = process.hrtime()
	console.log('adding media');
	fs.readFile(req.file.path, function(err, data){
		var params = {
			"data": data,
			'filename':req.file.filename,
		};
		mediaUtils.addmedia(params, function(err, response){
			if(err){
				fs.unlink(req.file.path);
				res.status(400).send(response);
			}
			else{
				var diff = process.hrtime(time);
				///if(diff[0] > 3)
				console.log(`add media: ${(diff[0] * 1e9 + diff[1])/1e9} seconds`);
				res.status(200).send(response);
				fs.unlink(req.file.path);
			}
		});
	});


});


/******************************************************************
*	/media/<id> description - GET (STAGE 3): 
*	Gets media file by id
*
*	Request Parameters (type is multipart/form-data (gotta use multer module))
*		- content: binary content of ile being uploaded = req.file.content
*
*	Return:
*	- returns media file (image or video)
*
*******************************************************************/
app.get('/media/:id', function(req,res){

	var params = {
		"id":req.params.id,
	}
	mediaUtils.getMedia(params, function(err, data){

		if(err){
			response = {
				'status':'error'
			};
			res.status(400).send(response);
		}
		else {
			res.setHeader("Content-Type", "image/jpeg"); 		    
			res.end(data.content, 'binary');
  		}

	})


});

app.get('/feed', function(req, res){

	Tweet.find({}).sort({"timestamp":-1}).limit(100).exec(function(err, data){

		if(err)
			res.send({"status": "error"});

		var fill = ""


		for(i = 0; i < data.length ;i++){
			fill = fill + data[i].username + ": " + data[i].content + "\n";
		}


		var response = {
			tweets: fill
		};


		res.send(response);
	});
})



/* using reverse proxy, so listening on localhost port 300x*/
app.listen(3000, "localhost");
////////console.log("listening on port 3000");
