var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var followSchema = mongoose.Schema({
	username: String,
	following: [String],
	followers: [String]
});


module.exports = mongoose.model('follow_data', followSchema);