var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: {type: String, index:true},
	id: {type: String, index:true},
	username: {type: String, index:true},
	parent: String,
	timestamp: {type: Number, index:true}
});


module.exports = mongoose.model('tweets', tweetSchema);