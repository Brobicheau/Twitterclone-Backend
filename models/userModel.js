var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	username: { type: String, index: true},
	email: { type: String},
	password: { type: String},
	URL: String,
	verified: String, 
});

module.exports = mongoose.model('real_users', userSchema);