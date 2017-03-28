var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
	

	$scope.pageSwitch = "login-page";
	$scope.tweet = "";

	$scope.createUserInfo = {
		username: "",
		email: "",
		password: ""
	};

	$scope.loginInfo = {
		username:"",
		password:""
	};

	$scope.tweet = {
		tweet: ""
	};


	$scope.twitter = {
		feed:""
	}

	$scope.current = {
		user: "Welcome to Twitter! Create an account to post tweets!"
	}

	$scope.item = {
		id: ""
	}

	var init = function(){
		$http.get('/init').then(initSuccess, initError)

			function initSuccess(success){

				if(typeof success.data.user !== 'undefined'){
					$scope.current.user= success.data.user;
					$scope.switchToMain();

				}

			}

			function initError(err){

				console.log(err);
			}
	}

	init();



	$scope.switchToMain = function(){
		$scope.pageSwitch = "main-page";
		console.log("IN MAIN SWITCH");
			$http.get("/feed").then(feedSuccess, feedError);

			function feedSuccess(success){
				console.log(success.data.tweets);


				$scope.twitter.feed = success.data.tweets;
			}

			function feedError(error){
				console.log(error);
			}

	}

	$scope.switchToLogin = function() {
		$scope.pageSwitch = "login-page";
	}

	$scope.switchToCreate = function() {
		$scope.pageSwitch = "createUser-page";
	}


	$scope.logout = function(){
		$http.post('/logout').then(logoutSuccess, logoutError);

		function logoutSuccess (success){
			console.log("LLOGOUT SUCCESS");
		}

		function logoutError(error){
			console.log("ERROR WHEN LOGGING OUT");
		}
	}

	$scope.verify = function(){

		 console.log("IN VERIFY");
		request = {
			email: $scope.createUserInfo.email,
			key : "abracadabra"
		};

		$http.post('/verify', request).then(verifySuccess, verifyError);

		function verifySuccess(succes){
			console.log("SUCCESFULLY VERIFYED");
		}

		function verifyError(error){
			console.log("VERIFY ERROR")
		}
	}

	$scope.createAccount = function(){
		request = {
			username: $scope.createUserInfo.username,
			email: $scope.createUserInfo.email,
			password: $scope.createUserInfo.password
		};

		console.log("HTTP PRE REQUEST")

		$http.post('/adduser', request).then(createAccountSuccess, createAccountError);

		function createAccountSuccess(success){
			console.log("SUCCESSFULLY CREATED USER IN");
		}

		function createAccountError (error){
			console.log("ERROR WHEN CREATING USER IN");
		}
	
	}

	$scope.login = function() {
		request = {
			username: $scope.loginInfo.username,
			password: $scope.loginInfo.username
		};
		$http.post('/login', request).then(loginSuccess, loginError);

		function loginSuccess(success){
			console.log("SUCCESSFULLY  LOGGED IN");
			$scope.switchToMain();
		}

		function loginError (error){
			console.log("ERROR WHEN LOGGING IN");
		}
	}

	$scope.addTweet = function() {
		request = {
			content: $scope.tweet.tweet			
		};

		$http.post('/additem', request).then(addTweetSuccess, addTweetError);

		function addTweetSuccess(success){
			console.log("SUCCESSFULLY ADDED TWEET IN");
			$scope.switchToMain();
		}

		function addTweetError (error){
			console.log("ERROR WHEN ADDING TWEET IN");
		}
	}


	$scope.search = function() {

		request = {
			timestamp: $scope.search.timestamp,
			limit: $scope.search.limit
		};

		$scope.search.timestamp = null;
		$scope.search.limit = null;

		$http.post('/search', request).then(searchSuccess, searchError);

		function searchSuccess(success){

			var data = success.data.items;	
			var tweets = "";

			console.log(data);
			for(i = 0; i < data.length; i++){

				tweets = tweets + data[i].username + ": " + data.content + "\n";

			}

			$scope.twitter.feed = tweets;

		}

		function searchError(err){

			console.log(err);
		}
	}

	$scope.findItem = function () {

		request = {
			id: $scope.item.id
		}
		console.log("in find item");
		$http.get('/item/:id', request).then(itemSuccess, itemError);


		function itemSuccess(success){

			console.log("found item");

			$scope.twitter.feed = success.data.item.username + ": " + success.data.item.content;

		}


		function itemError(error){

			console.log(error);
		}

	}

}]);//end controller