var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: String,
	id: {type: String, index:true},
	username: {type: String, index:true},
	parent: String,
	timestamp: {type: Number, index:true}
});
tweetSchema.index({content: 'text'});

module.exports = mongoose.model('tweets', tweetSchema);