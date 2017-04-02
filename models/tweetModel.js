var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: String,
	id: String,
	username: String,
	parent: String,
	timestamp: {type: String, index: true}
});


module.exports = mongoose.model('tweets', tweetSchema);