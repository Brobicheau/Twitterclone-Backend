var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userTempSchema = mongoose.Schema({
	username: {type: String, unique: true},
	email: {type: String, unique: true},
	password: String,
	URL: String,
	status: String
});

userTempSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.pw);
};

module.exports = mongoose.model('temporary_users', userTempSchema);