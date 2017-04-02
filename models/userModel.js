var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
	username: {type: String, index: true},
	email: {type: String, index: true},
	password: String,
	status: String
});

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.pw);
};

module.exports = mongoose.model('real_users', userSchema);