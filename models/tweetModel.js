var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: String,
	username: String,
	parent:String,
	timestamp: Number,
	media: [String]
});
//tweetSchema.index({content: 'text'});

module.exports = mongoose.model('tweets', tweetSchema);