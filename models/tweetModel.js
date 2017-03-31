var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: String,
	id: String,
	username: String,
	parent: String,
	timestamp: Date,
});


module.exports = mongoose.model('tweets', tweetSchema);