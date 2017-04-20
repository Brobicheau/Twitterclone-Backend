var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: String,
	id: {type: String, index:true},
	username: {type: String, index:true},
	parent:{type: String, index:true},
	timestamp: {type: Number, index:true},
	media: [String]
});
tweetSchema.index({content: 'text'});

module.exports = mongoose.model('tweets', tweetSchema);