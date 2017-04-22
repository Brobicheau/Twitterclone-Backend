var mongoose = require('mongoose');
var options = {server: {socketOptions: {socketTimeoutMS: 10000}}};
var conn1 = mongoose.createConnection('mongodb://127.0.0.1:27017/twitter', options);

var userSchema = mongoose.Schema({
	username: { type: String, unique: true},
	email: { type: String, unique: true},
	password: { type: String},
	URL: String,
	verified: String, 
	status: String
});

module.exports = conn1.model('real_users', userSchema);