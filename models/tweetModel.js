var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: String,
	id: {type: String, index:true},
	username: String,
	parent: String,
	timestamp: {type: Number, index:true}
});


module.exports = mongoose.model('tweets', tweetSchema);