var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
	username: { type: String, unique: true},
	email: { type: String, unique: true},
	password: { type: String, index:true},
	URL: String,
	verified: String, 
	status: String
});

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.pw);
};

module.exports = mongoose.model('real_users', userSchema);