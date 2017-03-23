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




	$scope.switchToMain = function(){
		$scope.pageSwitch = "main-page";
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
		}

		function addTweetError (error){
			console.log("ERROR WHEN ADDING TWEET IN");
		}
	}


}]);//end controller