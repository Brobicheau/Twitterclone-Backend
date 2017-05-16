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
var conn = mongoose.createConnection("192.168.1.151:27017", options);

var mediaSchema = mongoose.Schema({
	'filename': String,
	'content': Buffer
});


module.exports = conn.model('media', mediaSchema);