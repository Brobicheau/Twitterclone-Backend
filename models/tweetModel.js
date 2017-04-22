var mongoose = require('mongoose');
var options = {server: {socketOptions: {socketTimeoutMS: 10000}}};
var conn1 = mongoose.createConnection('mongodb://192.168.1.50:27017/twitter', options);

var tweetSchema = mongoose.Schema({
	content: String,
	id: {type: String, unique:true},
	username: {type: String, index: true},
	parent:{type: String, index: true},
	timestamp: {type: Number, index: true},
	media: [String]
});
tweetSchema.index({content: 'text'});

module.exports = conn1.model('tweets', tweetSchema);