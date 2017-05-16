var mongoose = require('mongoose');
var options = {
	  server: {
	    socketOptions: {
	      socketTimeoutMS: 9000000000,
	      connectionTimeout: 900000000,
	      poolSize: 100
	    }
	  }
  }
var conn = mongoose.createConnection("192.168.1.151", options);
var userSchema = mongoose.Schema({
	username: { type: String, index: true},
	email: { type: String},
	password: { type: String},
	URL: String,
	verified: String, 
});

module.exports = conn.model('real_users', userSchema);