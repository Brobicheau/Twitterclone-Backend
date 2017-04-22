var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	content: String,
	id: {type: String, unique:true},
	username: {type: String, index: true},
	parent:{type: String},
	timestamp: {type: Number},
	media: [String]
});
//tweetSchema.index({content: 'text'});

module.exports = mongoose.model('tweets', tweetSchema);