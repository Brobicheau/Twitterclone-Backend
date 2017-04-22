var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	username: { type: String, unique: true},
	email: { type: String, unique: true},
	password: { type: String},
	URL: String,
	verified: String, 
	status: String
});

module.exports = mongoose.model('real_users', userSchema);