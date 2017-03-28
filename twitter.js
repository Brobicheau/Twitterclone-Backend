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
var nev = require('email-verification')(mongoose);
var User = require('./models/userModel.js');
var TempUser = require("./models/userTempModel.js");
var Tweet = require("./models/tweetModel.js");
var shortid = require('shortid');
var cookieSession = require('cookie-session');

mongoose.Promise = require('bluebird');
const util = require('util');
mongoose.connect('mongodb://192.168.1.16/twitterUsers');
var app = express();


//module setup
app.use(parser.urlencoded({extended: true}));
app.use(parser.json());
app.use(cookieSession({
	name: "session",
	keys: ['key1, key2']
}))

/******* Hash setup **************/
var myHasher = function (password, tempUserData, insertTempUser, callback){
	var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	return insertTempUser(hash, tempUserData, callback);
}

/********** Configure Email verification **********/

nev.configure({

	persistentUserModel: User,
	tempUserModel: TempUser,
	expirationTime: 1000,
	URLFieldName: "URL",
	verificationURL: "http://130.245.168.124/verify/${URL}",
	hashingFunction: myHasher,
	passwordFieldName:"password",
	//check proper transportOption configuration

	transportOptions: {
	    service: "Gmail",
	    auth: {
	    	user:"twittercloneverifyemial",
	    	pass: "!password"
	    }
	},
	verifyMailOptions: {
		from: 'Do Not Reply brobicheaucse356',
		subject: "Confirm Eliza Account",
		html: "Click the link to confirm account: $URL",
		text: 'Confirm Account by clicking the link:${URL}'
	},
	shouldSendConfirmation: true,
	confirmMailOptionsL:{
		from:'Do Not Reply brobicheaucse356',
		subject: 'Successfully verified',
		html: '<p>Your account has been successfully verified.</p>',
		text:'Your account has been successfully verified.'
	}
	}, function (error, options){

});

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

	console.log("IN ADDUSER");


	//get the username, password and email
	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;

	var newUser = User({
		email:email,
		password:password
	})

	nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser){

		console.log

		console.log("increateuser method");
		//if there was a problem in creating the temp user
		if(err){
			//should send some sort of error back to client 
			console.log(err);
		}

		//if the user alreadt exsists in the database
		if(existingPersistentUser){
			console.log("exsisting");
			//should send back respnose
		}

		//otherwise we have successfully created a new temp user
		if(newTempUser){
			console.log(newTempUser);
			//grab the URL from the new users data
			var URL = newTempUser[nev.options.URLFieldName]; 

			console.log(URL);

			//send an email with that url to the user to verify their account
			nev.sendVerificationEmail(email, URL, function(err, info){

				//if there was an error in sending the email
				if(err){
					//send some sort of error back to tuser
					console.log(err);
					return;
				}

				//if everything went back send the data back to the client
				console.log(newUser);
				res.send(newUser);	

			});//end send emmail

		}
		else {
			//dont realyl need this else
			//its the error field for if threr was no temp user either
			console.log("ERROR");	
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

	console.log("GO INTO LOGIUN");
	res.end();
});
app.post("/login", function(req, response){

	console.log("in login");
	console.log(req.body.username);
	console.log(req.body.email);
	console.log(req.body.password);

	//use the mongoose User model to find the user data with the username given
	User.findOne({username: req.body.username}, function(err, user){

		//if we found a user by that name
		if(user){

			//hash their password
			bcrypt.hash(req.body.password, user.password).then(function(res){

				//set the data and ID fields for adding to database
				var date = Date();
				var id = shortid.generate();

				//set the cookies so we know theres a sesson going on
				//this should be below the password check
				req.session.id = id;

				//if the password we got from the user is the one in the database
				if (res === user.password){


					//set the username for the session
					req.session.currentUser = req.body.username;

					//prepare response to sendt o the user
					var json = {
						"username": req.body.username,
						"date": date,
						"status": "OK"
					};	


					console.log("LOGGED IN");
					//respond to user
					response.json(json);
				}
				//else theres an errror
				else 
					//show errror
					console.log("not user");
			});
		}
		//else error
		else
			//theres an error here 
			console.log(err);
	});// end find one function
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

	console.log("IN LOGOUT");
	//set the cookies to null
	req.session = null;

	//tell the client everything is peachy
	res.send({status: "OK"});
});//end /logout


app.get('/verify/:URL', function(req, res){

	var url = req.params.URL;

		//confirm the user with the URL we got 
	nev.confirmTempUser(url, function(err, user){

		//if there was an error
		if (err){

			//display error and send client an error message
			console.log(err);
			json = {
				status: "ERROR"
			};	
			res.json(json);
		}

		//otherwise let user know it all went ok
		if(user){

			json = {
				status: "OK"
			};
			res.json(json);
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


	//grab the key and create varibales for the url and reutrn json
	var key = req.body.key;
	var url;
	var json;

	//this was probably used for testing, cant remember
	var tempJson = {
		email: req.body.email
	};

	console.log(req.body.email);
	//use the temp user model and find the json with the corresponding email
	TempUser.findOne({email:req.body.email}, function(err, user){

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
					res.send(response);
				}
				else {
					var response = {
						"status": "OK",
					}
					res.send(response);

				}

			});

		}		
	});
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
	

	//make sure there is a used logged in before we make the tweet
	if(typeof req.session.currentUser !== 'undefined'){


		//check if the optional parent param was given
		if(typeof req.body.parent !== "undefined"){

			//if it is we set it to the parent value
			var parent = req.body.parent;
		}
		else{

			//otherwise we set it to null
			var parent = "null";
		}

		//Get the content of the new tweet
		var content = req.body.content;
		console.log(content);

		//make a new unique ID for the tweet
		var id = shortid.generate();

		//create the tweet schema object for storing in mongodb
		newTweet = Tweet({
			"id": id,
			"username": req.session.currentUser,
			"parent": null,
			"timestamp": Date(),
			"content": content
		});

		console.log(newTweet);
		//save the sweet to the mongo database
		newTweet.save(function (err, results){

			//if there was an error
			if(err){
				//print out the error(and send back correct response)
				console.log(err);
				res.status(200).send(err);
			}

			else{

			var	response = {
				"id": id,
				"status" : "OK"
			};
			//else lettuce know there was a success
			 console.log("Successfully saved new tweet to database");
			 res.send(response);
			}
		});

	}//end if
	else{
		//telll em no user is logged in.
		console.log("no user logged in");
		res.send({"status":"error", "error":"no user logged in"});
	}


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

	//get the id of the tweet to search for
	var search_id = req.params.id;
 
	console.log("IN GET ITEM");
	console.log(search_id);

	if(typeof search_id !== 'undefined'){
		console.log("searching");
		Tweet.findOne({"id": search_id}, function(err, tweet){

			console.log("found something  probably");

			if(err)
				console.log(err);

			else if(tweet){	
				var response = {
					"status": "OK",
					item: {
					"id": tweet.id,
					"username": tweet.username,
					"content": tweet.content,
					"timestamp": tweet.content,
					}
				};
				console.log("RETURNING" + tweet.content);
				res.status(200).send(response);
			}
		});
	}
	else {
		console.log('not valid ID');
		res.status(404).send({"status":"error"});
	}


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
app.delete('/item/<id>', function(req,res){

/******************************************************************
*
*							JAY 
*
*******************************************************************/

	//Pull id from request ( req.params.id)

	//find the item to remove via Tweet.find(id).remove(callback)

		//if its an error 

			//send back status error

		//else we deleted user

			//return back success

		//END IF ELSE

	//END FIND ITEM

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


	//get the timestamp the user sent in
	var timestamp = req.body.timestamp;

	//get the limitfrom the user
	var limit = req.body.limit;

	if(typeof limit === 'undefined')
		limit = 25;

	Tweet.find().sort({_id:-1}).limit(limit).exec(function(err, data){

		if(err){
			console.log(err)
			response = {
				"status": "error",
				"error": err
			};res.send(response);
		}
		else {
			var filler = new Array(data.lengh) ;

			console.log(data);
			for( i = 0; i < data.length; i++){
				filler[i] = {
					"id": data[i].id,
					"username": data[i].username,
					"content": data[i].content,
					"timestamp": data[i].timestamp
				};
			}
			console.log(filler);

			var response = {
				items: filler ,
				"status":"OK"
			}			
			response.items = filler;
			res.send(response);
		}

	});


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
app.get('/user/<username>', function(req,res){

/******************************************************************
*
*							JAY 
*
*******************************************************************/	

	//pull username from params via req.params.username

	//Search for account with correct username via Users.findOne(username, function(err, user))

		//if theres an error

			//return status error

		//else if we found user

			//create json to return call user (see function description for details)

			//return user info

		//END IF ELSE

	//END FIND USERNAME

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
	*							VINNY 
	*
	*******************************************************************/

	//pull username from params via req.params.username

	//pull limit from request via req.params.limit (maybe)

	//find username via User.findOne(username, function(err, user))

	//ACCESS FOLOWERS BY user.followers GIVES ARRAY

		//if err 

			//return error status

		//else if we found user

			//if limit is defined

				//create response json with array of followers the size of limit (max of 200) (and status)

				//send response json

			//else we use default limit

				//create json response with array of 50 followers (any order)

				//send response json

			//END IF ELSE

		//END IF ELSE

	//END FIND USERNAME



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
app.post('/user/:username/following', function(req,res){

/******************************************************************
*
*							VINNY 
*
*******************************************************************/

	//pull username from params via req.params.username

	//pull limit from request via req.params.limit (maybe)

	//find username via User.findOne(username, function(err, user))

	//ACCESS FOLLOWINGS BY user.followings GIVES ARRAY

		//if err 

			//return error status

		//else if we found user

			//if limit is defined

				//create response json with array of users hes following the size of limit (max of 200) (and status)

				//send response json

			//else we use default limit

				//create json response with array of 50 hes following (any order)

				//send response json

			//END IF ELSE

		//END IF ELSE

	//END FIND USERNAME

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
*							VINNY 
*
*******************************************************************/	

	//pull usename to follow via req.body.username

	//pull follow bool via req.body.follow

	//find the user to follow via User.findOne(username, function(err, user))

		//if theres an array

			//send error response

		//else

			//add the currentUser to users array, access to current user is req.session.currentUser
			//access to users follower array is user.followers, gives array.

			///send OK response

		//END IF ELSE

	//END FIND USER

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
app.post('/item/<id>/like', function(req,res){


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
app.post('/addmedia', function(req,res){


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
app.post('/media/<id>', function(req,res){


});

app.get('/feed', function(req, res){

	Tweet.find({}).sort({"timestamp":-1}).limit(100).exec(function(err, data){

		if(err)
			res.send({"status": "error"});

		var fill = ""


		for(i = 0; i < data.length ;i++){
			fill = fill + data[i].username + ": " + data[i].content + "\n";
		}

		console.log(fill);

		var response = {
			tweets: fill
		};


		res.send(response);
	});
})



/* using reverse proxy, so listening on localhost port 300x*/
app.listen(3000, "localhost");
console.log("listening on port 3000");